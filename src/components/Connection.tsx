import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Connection as ConnectionType, FlowNode, ConnectionStyle } from '../types';
import { getHookAnchorPosition } from '../utils/hookManager';

interface ConnectionProps {
  connection: ConnectionType;
  fromNode: FlowNode;
  toNode: FlowNode;
  isSelected?: boolean;
  onSelect?: (connectionId: string) => void;
  onUpdatePoints?: (connectionId: string, points: { x: number; y: number }[]) => void;
  onClick?: (connectionId: string, position: { x: number; y: number }) => void;
  zoom: number;
  pan: { x: number; y: number };
}

export const Connection: React.FC<ConnectionProps> = React.memo((props) => {
  const {
    connection,
    fromNode,
    toNode,
    isSelected = false,
    onSelect,
    onUpdatePoints,
    onClick,
    zoom,
    pan
  } = props;

  const [isDragging, setIsDragging] = useState(false);
  const [dragPointIndex, setDragPointIndex] = useState<number | null>(null);

  const style: ConnectionStyle = useMemo(() => ({
    type: 'elbow',
    color: '#3B82F6',
    strokeWidth: 2,
    dashed: false,
    curvature: 0.5,
    ...connection.style
  }), [connection.style]);

  // Cores baseadas no label (mantém compatibilidade)
  const connectionColor = useMemo(() => {
    const isSimBranch = connection.label === 'Sim';
    const isNaoBranch = connection.label === 'Não';
    const defaultColor = isSimBranch ? '#10B981' : isNaoBranch ? '#EF4444' : '#3B82F6';
    return style.color || defaultColor;
  }, [connection.label, style.color]);

  // 🔥 Determina qual marcador (arrowhead) usar baseado no label
  const arrowheadId = useMemo(() => {
    if (connection.label === 'Sim') return 'arrowhead-sim';
    if (connection.label === 'Não') return 'arrowhead-nao';
    return 'arrowhead';
  }, [connection.label]);

  // Calcula pontos base baseados no estilo
  const calculateBasePoints = useCallback((): { x: number; y: number }[] => {
    const start = getHookAnchorPosition(fromNode, connection.fromHookId);
    const end = getHookAnchorPosition(toNode, connection.toHookId);

    switch (style.type) {
      case 'straight':
        return [start, end];

      case 'curved': {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const curvature = style.curvature || 0.5;

        const controlX1 = start.x + dx * curvature;
        const controlY1 = start.y;
        const controlX2 = start.x + dx * (1 - curvature);
        const controlY2 = end.y;

        return [
          start,
          { x: controlX1, y: controlY1 },
          { x: controlX2, y: controlY2 },
          end
        ];
      }

      case 'elbow':
      default: {
        const midX = (start.x + end.x) / 2;
        return [
          start,
          { x: midX, y: start.y },
          { x: midX, y: end.y },
          end
        ];
      }
    }
  }, [fromNode, toNode, style.type, style.curvature, connection.fromHookId, connection.toHookId]);

  // Usa pontos personalizados ou calcula base
  const points = useMemo(() => {
    const basePoints = calculateBasePoints();
    
    // Se não tem pontos customizados, usa os calculados
    if (!connection.points) {
      return basePoints;
    }
    
    // Se tem pontos customizados, atualiza APENAS primeiro e último para seguir os nós
    // Mantém os pontos intermediários customizados
    const customPoints = [...connection.points];
    
    // Atualiza primeiro ponto (origem)
    customPoints[0] = { ...basePoints[0] };
    
    // Atualiza último ponto (destino)
    customPoints[customPoints.length - 1] = { ...basePoints[basePoints.length - 1] };
    
    return customPoints;
  }, [connection.points, calculateBasePoints]);

  const path = useMemo(() => {
    if (points.length === 2 && style.type === 'straight') {
      // Linha reta
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    } else if (points.length === 4 && style.type === 'curved') {
      // Curva bezier cúbica
      return `M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y}`;
    } else {
      // Linha quebrada (elbow ou custom)
      let pathStr = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathStr += ` L ${points[i].x} ${points[i].y}`;
      }
      return pathStr;
    }
  }, [points, style.type]);

  const handlePointMouseDown = useCallback((e: React.MouseEvent, index: number) => {
    if (!onUpdatePoints || !onSelect) return;
    
    e.stopPropagation();
    e.preventDefault();
    setIsDragging(true);
    setDragPointIndex(index);
    onSelect(connection.id);
  }, [onUpdatePoints, onSelect, connection.id]);

  const handleConnectionClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    const midPoint = Math.floor(points.length / 2);
    const clickPosition = {
      x: points[midPoint]?.x || 0,
      y: points[midPoint]?.y || 0
    };

    // Se Shift está pressionado, abre menu contextual
    if (e.shiftKey && onClick) {
      onClick(connection.id, clickPosition);
    } 
    // Se não, apenas seleciona a conexão
    else if (onSelect) {
      onSelect(connection.id);
    }
  }, [points, onClick, onSelect, connection.id]);

  // Drag dos pontos de controle
  useEffect(() => {
    if (!isDragging || dragPointIndex === null || !onUpdatePoints) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      
      // Converte coordenadas do mouse (screen space) para coordenadas do canvas (SVG space)
      // Fórmula: canvasX = (screenX - pan.x) / zoom
      const canvasX = (e.clientX - pan.x) / zoom;
      const canvasY = (e.clientY - pan.y) / zoom;
      
      const newPoints = [...points];
      
      // Para pontos intermediários em elbow, mantém alinhamento
      if (style.type === 'elbow' && dragPointIndex > 0 && dragPointIndex < points.length - 1) {
        // Ponto do meio em elbow: move apenas X (mantém linha vertical)
        if (dragPointIndex === 1 || dragPointIndex === 2) {
          // Move ambos os pontos do meio horizontalmente
          const newX = canvasX;
          newPoints[1] = { x: newX, y: newPoints[1].y };
          newPoints[2] = { x: newX, y: newPoints[2].y };
        }
      } else {
        // Outros pontos movem livremente
        newPoints[dragPointIndex] = { x: canvasX, y: canvasY };
      }
      
      onUpdatePoints(connection.id, newPoints);
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setDragPointIndex(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragPointIndex, points, connection.id, onUpdatePoints, style.type, zoom, pan]);

  // Calcula posição do label no meio da conexão
  const labelPosition = useMemo(() => 
    points[Math.floor(points.length / 2)] || points[0]
  , [points]);

  return (
    <g>
      {/* Camada invisível mais grossa para facilitar clique */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        style={{ 
          pointerEvents: 'stroke',
          cursor: 'pointer'
        }}
        onClick={handleConnectionClick}
      />
      
      {/* Linha principal da conexão */}
      <path
        d={path}
        stroke={connectionColor}
        strokeWidth={style.strokeWidth}
        strokeDasharray={style.dashed ? '5,5' : 'none'}
        fill="none"
        markerEnd={`url(#${arrowheadId})`}
        className={isSelected ? 'connection-selected' : ''}
        style={{ pointerEvents: 'none' }}
      />

      {/* Pontos de controle interativos (visíveis apenas quando selecionado) */}
      {isSelected && onUpdatePoints && points.map((point, index) => (
        <g key={`${connection.id}-point-${index}`}>
          <circle
            cx={point.x}
            cy={point.y}
            r={8}
            fill="white"
            stroke={connectionColor}
            strokeWidth={2}
            className="connection-point"
            style={{ cursor: 'move', pointerEvents: 'all' }}
            onMouseDown={(e) => handlePointMouseDown(e, index)}
          />
          <circle
            cx={point.x}
            cy={point.y}
            r={3}
            fill={connectionColor}
            style={{ pointerEvents: 'none' }}
          />
        </g>
      ))}

      {/* Labels são renderizados separadamente no Canvas.tsx para ficarem sempre no topo */}

      {/* Definição da ponta da seta */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={connectionColor}
          />
        </marker>
        <marker
          id="arrowhead-sim"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#10B981"
          />
        </marker>
        <marker
          id="arrowhead-nao"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill="#EF4444"
          />
        </marker>
      </defs>
    </g>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para evitar re-renders desnecessários
  return (
    prevProps.connection.id === nextProps.connection.id &&
    prevProps.isSelected === nextProps.isSelected &&
    JSON.stringify(prevProps.connection.style) === JSON.stringify(nextProps.connection.style) &&
    JSON.stringify(prevProps.connection.points) === JSON.stringify(nextProps.connection.points) &&
    prevProps.connection.label === nextProps.connection.label &&
    prevProps.fromNode.position.x === nextProps.fromNode.position.x &&
    prevProps.fromNode.position.y === nextProps.fromNode.position.y &&
    prevProps.toNode.position.x === nextProps.toNode.position.x &&
    prevProps.toNode.position.y === nextProps.toNode.position.y
  );
});