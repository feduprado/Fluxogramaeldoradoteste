import React, { useRef, useEffect } from 'react';
import { FlowNode, Connection } from '../types';
import { Container as ContainerType } from '../types/container';
import { FlowchartNode } from './FlowchartNode';
import { Connection as ConnectionComponent } from './Connection';
import { Container } from './Container';
import { Theme } from '../hooks/useTheme';

interface CanvasProps {
  nodes: FlowNode[];
  connections: Connection[];
  containers: ContainerType[];
  selectedNodeId: string | null;
  selectedNodeIds?: string[]; // 🆕 Multi-seleção
  selectedContainerId: string | null;
  temporaryConnection: { fromNodeId: string; x: number; y: number } | null;
  zoom: number;
  pan: { x: number; y: number };
  onNodeSelect: (nodeId: string | null) => void;
  onToggleNodeSelection?: (nodeId: string, isShiftPressed: boolean) => void; // 🆕
  onNodeMove: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onMoveMultiple?: (nodeIds: string[], delta: { x: number; y: number }) => void; // 🆕 Arraste múltiplo COM DELTA
  onClearMultiDrag?: () => void; // 🆕 Limpa posições do arraste
  onContainerSelect: (containerId: string | null) => void;
  onNodeTextChange: (nodeId: string, newText: string) => void;
  onStartConnection: (nodeId: string) => void;
  onUpdateTemporaryConnection: (x: number, y: number) => void;
  onEndConnection: (nodeId: string) => void;
  onNodeResize: (nodeId: string, newSize: { width: number; height: number }) => void;
  onContainerMove: (containerId: string, newPosition: { x: number; y: number }) => void;
  onContainerResize: (containerId: string, newSize: { width: number; height: number }) => void;
  onToggleContainerCollapse: (containerId: string) => void;
  onContainerRename?: (containerId: string, newName: string) => void;
  onConnectionClick?: (connectionId: string, position: { x: number; y: number }) => void;
  onConnectionSelect?: (connectionId: string) => void;
  onUpdateConnectionPoints?: (connectionId: string, points: { x: number; y: number }[]) => void;
  selectedConnectionId?: string | null;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
  theme: Theme;
}

export const Canvas: React.FC<CanvasProps> = ({
  nodes,
  connections,
  containers,
  selectedNodeId,
  selectedNodeIds = [], // 🆕
  selectedContainerId,
  temporaryConnection,
  zoom,
  pan,
  onNodeSelect,
  onToggleNodeSelection, // 🆕
  onNodeMove,
  onMoveMultiple, // 🆕 Arraste múltiplo COM DELTA
  onClearMultiDrag, // 🆕 Limpa posições do arraste
  onContainerSelect,
  onNodeTextChange,
  onStartConnection,
  onUpdateTemporaryConnection,
  onEndConnection,
  onNodeResize,
  onContainerMove,
  onContainerResize,
  onToggleContainerCollapse,
  onContainerRename,
  onConnectionClick,
  onConnectionSelect,
  onUpdateConnectionPoints,
  selectedConnectionId,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  theme,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Permite pan com botão do meio (1) ou botão esquerdo no background
    const target = e.target as HTMLElement;
    const isBackground = target === canvasRef.current || 
                        target.classList.contains('canvas-background') ||
                        target.closest('svg')?.classList.contains('pointer-events-none');
    
    // Botão do meio sempre permite arrastar
    if (e.button === 1) {
      e.preventDefault();
      onMouseDown(e);
      return;
    }
    
    // Botão esquerdo só arrasta se clicar no background
    if (e.button === 0 && isBackground) {
      onMouseDown(e);
      onNodeSelect(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (temporaryConnection && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      // Converte coordenadas da tela para coordenadas do canvas
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      onUpdateTemporaryConnection(x, y);
    }
  };

  // 🔥 Helper function para converter container ou node em formato unificado
  const getElementForConnection = (id: string): FlowNode | null => {
    const node = nodes.find(n => n.id === id);
    if (node) return node;

    const container = containers.find(c => c.id === id);
    if (!container) return null;

    // Converte container para formato de FlowNode
    return {
      id: container.id,
      type: 'process',
      position: { ...container.position },
      text: container.name,
      width: container.size.width,
      height: container.size.height,
    } as FlowNode;
  };

  const calculateTemporaryConnectionPath = () => {
    if (!temporaryConnection) return '';

    const fromElement = getElementForConnection(temporaryConnection.fromNodeId);
    if (fromElement) {
      const startX = fromElement.position.x + fromElement.width / 2;
      const startY = fromElement.position.y + fromElement.height / 2;
      return `M ${startX} ${startY} L ${temporaryConnection.x} ${temporaryConnection.y}`;
    }

    return '';
  };

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
      {/* Container principal com transformações */}
      <div
        className="absolute inset-0 canvas-background"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        {/* Fundo branco - sem grid */}

        {/* SVG para conexões */}
        <svg 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            width: '100%', 
            height: '100%',
            overflow: 'visible'
          }}
        >
          {/* Conexões permanentes */}
          {connections.map(conn => {
            const fromElement = getElementForConnection(conn.fromNodeId);
            const toElement = getElementForConnection(conn.toNodeId);
            if (!fromElement || !toElement) return null;

            return (
              <ConnectionComponent
                key={conn.id}
                connection={conn}
                fromNode={fromElement}
                toNode={toElement}
                isSelected={conn.id === selectedConnectionId}
                onSelect={onConnectionSelect}
                onUpdatePoints={onUpdateConnectionPoints}
                onClick={onConnectionClick}
                zoom={zoom}
                pan={pan}
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

          {/* Definições de marcadores */}
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

        {/* Contêineres (renderizados ANTES dos nós para ficarem no fundo) */}
        {containers.map(container => (
          <Container
            key={container.id}
            container={container}
            isSelected={selectedContainerId === container.id}
            onSelect={onContainerSelect}
            onMove={onContainerMove}
            onResize={onContainerResize}
            onToggleCollapse={onToggleContainerCollapse}
            onRename={onContainerRename}
            onStartConnection={onStartConnection}
            onEndConnection={onEndConnection}
            isConnecting={!!temporaryConnection}
            zoom={zoom}
            pan={pan}
          />
        ))}

        {/* Nós do fluxograma (renderizados DEPOIS dos containers para ficarem na frente) */}
        {nodes.map(node => {
          // 🆕 Verifica se o nó está selecionado (único OU multi-seleção)
          const isNodeSelected = selectedNodeId === node.id || selectedNodeIds.includes(node.id);
          
          return (
            <FlowchartNode
              key={node.id}
              node={node}
              isSelected={isNodeSelected}
              onSelect={onNodeSelect}
              onToggleSelection={onToggleNodeSelection} // 🆕 Multi-seleção
              onMove={onNodeMove}
              onMoveMultiple={onMoveMultiple} // 🆕 Arraste múltiplo COM DELTA
              onClearMultiDrag={onClearMultiDrag} // 🆕 Limpa posições originais
              selectedNodeIds={selectedNodeIds} // 🆕 Passar IDs selecionados
              onTextChange={onNodeTextChange}
              onStartConnection={onStartConnection}
              onEndConnection={onEndConnection}
              onResize={onNodeResize}
              zoom={zoom}
              theme={theme}
              containers={containers}
              temporaryConnection={temporaryConnection} // 🆕 Para detectar modo de conexão
            />
          );
        })}

        {/* SVG para labels das conexões - SEMPRE NO TOPO */}
        <svg 
          className="absolute inset-0 pointer-events-none" 
          style={{ 
            width: '100%', 
            height: '100%',
            overflow: 'visible',
            zIndex: 10000
          }}
        >
          {/* Renderiza APENAS os labels (S/N) das conexões com label */}
          {connections.filter(conn => conn.label).map(conn => {
            const fromElement = getElementForConnection(conn.fromNodeId);
            const toElement = getElementForConnection(conn.toNodeId);
            if (!fromElement || !toElement) return null;

            const defaultPoints = [
              { x: fromElement.position.x + fromElement.width / 2, y: fromElement.position.y + fromElement.height / 2 },
              { x: (fromElement.position.x + fromElement.width / 2 + toElement.position.x + toElement.width / 2) / 2, y: fromElement.position.y + fromElement.height / 2 },
              { x: (fromElement.position.x + fromElement.width / 2 + toElement.position.x + toElement.width / 2) / 2, y: toElement.position.y + toElement.height / 2 },
              { x: toElement.position.x + toElement.width / 2, y: toElement.position.y + toElement.height / 2 }
            ];

            // Calcula posição do label
            const points = conn.points || defaultPoints;
            const labelPosition = points[Math.floor(points.length / 2)] || points[0];
            
            const isSimBranch = conn.label === 'Sim';
            const isNaoBranch = conn.label === 'Não';
            const connectionColor = isSimBranch ? '#10B981' : isNaoBranch ? '#EF4444' : '#3B82F6';

            return (
              <g key={`label-${conn.id}`}>
                {/* Fundo do label com borda para destaque */}
                <circle
                  cx={labelPosition.x}
                  cy={labelPosition.y}
                  r="18"
                  fill="white"
                  stroke={connectionColor}
                  strokeWidth={3}
                  style={{ 
                    pointerEvents: 'none',
                    filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))'
                  }}
                />
                {/* Círculo interno colorido */}
                <circle
                  cx={labelPosition.x}
                  cy={labelPosition.y}
                  r="15"
                  fill={connectionColor}
                  style={{ pointerEvents: 'none' }}
                />
                {/* Texto do label */}
                <text
                  x={labelPosition.x}
                  y={labelPosition.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="white"
                  fontSize="14"
                  fontWeight="bold"
                  style={{ 
                    pointerEvents: 'none',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  {conn.label === 'Sim' ? 'S' : conn.label === 'Não' ? 'N' : conn.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Overlay de instruções quando não há nós */}
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
              <p>• <strong>Clique e arraste</strong> o fundo para mover o canvas 🖱️</p>
              <p>• <strong>Shift + Clique</strong> para mover nós</p>
              <p>• Duplo clique para editar texto</p>
              <p>• Use o botão "+" para conectar nós</p>
              <p>• Clique em 🤖 IA para criar fluxos automaticamente</p>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de zoom */}
      <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs rounded-lg px-3 py-2 pointer-events-none">
        Zoom: {Math.round(zoom * 100)}% | Arraste para navegar
      </div>

      {/* Contador de nós e conexões */}
      <div className="absolute top-4 right-4 bg-black/80 text-white text-xs rounded-lg px-3 py-2 pointer-events-none">
        {nodes.length} nós • {connections.length} conexões
        {selectedNodeIds.length > 0 && ` • ${selectedNodeIds.length} selecionado${selectedNodeIds.length > 1 ? 's' : ''}`}
      </div>
    </div>
  );
};