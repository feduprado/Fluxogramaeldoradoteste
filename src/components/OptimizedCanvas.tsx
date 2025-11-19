import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { FlowNode, Connection } from '../types';
import { FlowchartNode } from './FlowchartNode';
import { Connection as ConnectionComponent } from './Connection';
import { Theme } from '../hooks/useTheme';
import { getViewportFromElement, getVisibleNodes } from '../utils/viewport';

interface OptimizedCanvasProps {
  nodes: FlowNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  temporaryConnection: { fromNodeId: string; x: number; y: number } | null;
  zoom: number;
  pan: { x: number; y: number };
  onNodeSelect: (nodeId: string | null) => void;
  onNodeMove: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onNodeTextChange: (nodeId: string, newText: string) => void;
  onStartConnection: (nodeId: string) => void;
  onUpdateTemporaryConnection: (x: number, y: number) => void;
  onEndConnection: (nodeId: string) => void;
  onNodeResize: (nodeId: string, newSize: { width: number; height: number }) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
  theme: Theme;
  enableVirtualization?: boolean;
}

export const OptimizedCanvas = React.memo<OptimizedCanvasProps>(({
  nodes,
  connections,
  selectedNodeId,
  temporaryConnection,
  zoom,
  pan,
  onNodeSelect,
  onNodeMove,
  onNodeTextChange,
  onStartConnection,
  onUpdateTemporaryConnection,
  onEndConnection,
  onNodeResize,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  theme,
  enableVirtualization = true
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ x: 0, y: 0, width: 0, height: 0 });

  // Atualizar viewport quando o canvas redimensiona
  useEffect(() => {
    const updateViewport = () => {
      if (canvasRef.current) {
        setViewport(getViewportFromElement(canvasRef.current));
      }
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  // Virtualização: renderizar apenas nós visíveis
  const visibleNodes = useMemo(() => {
    if (!enableVirtualization) {
      return nodes;
    }
    return getVisibleNodes(nodes, pan, zoom, viewport);
  }, [nodes, pan, zoom, viewport, enableVirtualization]);

  // Filtrar conexões apenas dos nós visíveis (otimização)
  const visibleConnections = useMemo(() => {
    if (!enableVirtualization) {
      return connections;
    }

    const visibleNodeIds = new Set(visibleNodes.map(n => n.id));
    return connections.filter(conn => 
      visibleNodeIds.has(conn.fromNodeId) || visibleNodeIds.has(conn.toNodeId)
    );
  }, [connections, visibleNodes, enableVirtualization]);

  // Event listeners globais
  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isBackground = target === canvasRef.current || 
                        target.classList.contains('canvas-background') ||
                        target.closest('svg')?.classList.contains('connections-layer');
    
    if (e.button === 1) {
      e.preventDefault();
      onMouseDown(e);
      return;
    }
    
    if (e.button === 0 && isBackground) {
      onMouseDown(e);
      onNodeSelect(null);
    }
  }, [onMouseDown, onNodeSelect]);

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (temporaryConnection && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      onUpdateTemporaryConnection(x, y);
    }
  }, [temporaryConnection, pan, zoom, onUpdateTemporaryConnection]);

  const calculateTemporaryConnectionPath = useCallback(() => {
    if (!temporaryConnection) return '';

    const fromNode = nodes.find(n => n.id === temporaryConnection.fromNodeId);
    if (!fromNode) return '';

    const startX = fromNode.position.x + fromNode.width / 2;
    const startY = fromNode.position.y + fromNode.height / 2;
    
    return `M ${startX} ${startY} L ${temporaryConnection.x} ${temporaryConnection.y}`;
  }, [temporaryConnection, nodes]);

  return (
    <div
      ref={canvasRef}
      className={`flex-1 overflow-hidden relative cursor-grab ${
        theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-white'
      }`}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onWheel={onWheel}
    >
      {/* Container com transformações */}
      <div
        className="absolute inset-0 canvas-background"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          backgroundImage: theme === 'dark' 
            ? 'radial-gradient(circle, #2a2a2a 1px, transparent 1px)'
            : 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* SVG para conexões */}
        <svg 
          className="absolute inset-0 pointer-events-none connections-layer" 
          style={{ 
            width: '100%', 
            height: '100%',
            overflow: 'visible'
          }}
        >
          {/* Conexões permanentes */}
          {visibleConnections.map(connection => {
            const fromNode = nodes.find(n => n.id === connection.fromNodeId);
            const toNode = nodes.find(n => n.id === connection.toNodeId);
            
            if (!fromNode || !toNode) return null;

            return (
              <ConnectionComponent
                key={connection.id}
                connection={connection}
                fromNode={fromNode}
                toNode={toNode}
              />
            );
          })}

          {/* Conexão temporária */}
          {temporaryConnection && (
            <path
              d={calculateTemporaryConnectionPath()}
              stroke="#EF4444"
              strokeWidth="2"
              strokeDasharray="5,5"
              fill="none"
              markerEnd="url(#tempArrowhead)"
            />
          )}

          {/* Marcadores de seta */}
          <defs>
            {/* Marcador padrão (azul) */}
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
            </marker>
            
            {/* Marcador Verde (Sim) */}
            <marker
              id="arrowhead-sim"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#10B981" />
            </marker>
            
            {/* Marcador Vermelho (Não) */}
            <marker
              id="arrowhead-nao"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#EF4444" />
            </marker>
            
            {/* Marcador temporário */}
            <marker
              id="tempArrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#EF4444" />
            </marker>
          </defs>
        </svg>

        {/* Nós do fluxograma */}
        {visibleNodes.map(node => (
          <FlowchartNode
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={onNodeSelect}
            onMove={onNodeMove}
            onTextChange={onNodeTextChange}
            onStartConnection={onStartConnection}
            onEndConnection={onEndConnection}
            onResize={onNodeResize}
            zoom={zoom}
            pan={pan}
            isConnecting={!!temporaryConnection && temporaryConnection.fromNodeId !== node.id}
          />
        ))}
      </div>

      {/* Overlay quando não há nós */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className={`text-center rounded-xl p-8 max-w-md border ${
            theme === 'dark' 
              ? 'bg-gray-800/90 text-gray-300 border-gray-700' 
              : 'bg-white/90 text-gray-600 border-gray-200'
          } backdrop-blur-sm`}>
            <h3 className={`text-xl mb-4 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}>
              Bem-vindo ao Construtor de Fluxogramas
            </h3>
            <div className="space-y-2 text-sm text-left">
              <p>• Use os botões acima para adicionar nós</p>
              <p>• <strong>Arraste</strong> o fundo para mover o canvas</p>
              <p>• <strong>Shift + Arraste</strong> para mover nós</p>
              <p>• Duplo clique para editar texto</p>
              <p>• Use o botão "+" para conectar nós</p>
              <p>• Clique em 🤖 IA para criar fluxos automaticamente</p>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de virtualização (debug) */}
      {enableVirtualization && nodes.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs rounded-lg px-3 py-2 pointer-events-none">
          {visibleNodes.length} de {nodes.length} nós visíveis | Zoom: {Math.round(zoom * 100)}%
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para evitar re-renders desnecessários
  return (
    prevProps.nodes === nextProps.nodes &&
    prevProps.connections === nextProps.connections &&
    prevProps.selectedNodeId === nextProps.selectedNodeId &&
    prevProps.temporaryConnection === nextProps.temporaryConnection &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.pan === nextProps.pan &&
    prevProps.theme === nextProps.theme &&
    prevProps.enableVirtualization === nextProps.enableVirtualization
  );
});

OptimizedCanvas.displayName = 'OptimizedCanvas';