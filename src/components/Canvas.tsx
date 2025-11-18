import React, { useRef, useEffect } from 'react';
import { FlowNode, Connection } from '../types';
import { FlowchartNode } from './FlowchartNode';
import { Connection as ConnectionComponent } from './Connection';
import { Theme } from '../hooks/useTheme';

interface CanvasProps {
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
}

export const Canvas: React.FC<CanvasProps> = ({
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

  const calculateTemporaryConnectionPath = () => {
    if (!temporaryConnection) return '';

    const fromNode = nodes.find(n => n.id === temporaryConnection.fromNodeId);
    if (!fromNode) return '';

    const startX = fromNode.position.x + fromNode.width / 2;
    const startY = fromNode.position.y + fromNode.height / 2;
    
    return `M ${startX} ${startY} L ${temporaryConnection.x} ${temporaryConnection.y}`;
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
          {connections.map(connection => {
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

          {/* Definições de marcadores */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
            </marker>
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
        {nodes.map(node => (
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
        {selectedNodeId && ' • Nó selecionado'}
      </div>
    </div>
  );
};