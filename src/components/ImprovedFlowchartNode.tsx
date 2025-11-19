import React, { useState, useRef, useCallback } from 'react';
import { FlowNode } from '../types';

interface FlowchartNodeProps {
  node: FlowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onMove: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onTextChange: (nodeId: string, newText: string) => void;
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
  onResize: (nodeId: string, newSize: { width: number; height: number }) => void;
  zoom: number;
  pan: { x: number; y: number };
  isConnecting?: boolean;
}

export const ImprovedFlowchartNode: React.FC<FlowchartNodeProps> = React.memo(({
  node,
  isSelected,
  onSelect,
  onMove,
  onTextChange,
  onStartConnection,
  onEndConnection,
  onResize,
  zoom,
  pan,
  isConnecting,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(node.text);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const nodeRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const resizeStart = useRef({ x: 0, y: 0, width: 0, height: 0 });

  // Estilos base para cada tipo de nó
  const getNodeStyles = useCallback(() => {
    const baseStyles = {
      width: node.width,
      height: node.height,
    };

    switch (node.type) {
      case 'start':
        return {
          ...baseStyles,
          className: 'bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-green-600 flowchart-node',
        };
      case 'end':
        return {
          ...baseStyles,
          className: 'bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-red-600 flowchart-node',
        };
      case 'process':
        return {
          ...baseStyles,
          className: 'bg-blue-500 text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-blue-600 flowchart-node',
        };
      case 'decision':
        return {
          ...baseStyles,
          className: 'bg-yellow-500 text-white diamond flex items-center justify-center shadow-lg border-2 border-yellow-600 flowchart-node',
        };
      default:
        return {
          ...baseStyles,
          className: 'bg-gray-500 text-white rounded-lg flex items-center justify-center shadow-lg border-2 border-gray-600 flowchart-node',
        };
    }
  }, [node.type, node.width, node.height]);

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) return;
    
    onSelect(node.id);
    setIsDragging(true);
    
    // Ajusta para coordenadas do canvas considerando zoom e pan
    const nodeScreenX = node.position.x * zoom + pan.x;
    const nodeScreenY = node.position.y * zoom + pan.y;
    
    dragStart.current = {
      x: e.clientX - nodeScreenX,
      y: e.clientY - nodeScreenY,
    };

    const handleDrag = (moveEvent: MouseEvent) => {
      if (!isDragging) return;

      const newX = (moveEvent.clientX - dragStart.current.x - pan.x) / zoom;
      const newY = (moveEvent.clientY - dragStart.current.y - pan.y) / zoom;

      onMove(node.id, { x: newX, y: newY });
    };

    const handleDragEnd = () => {
      setIsDragging(false);
      document.removeEventListener('mousemove', handleDrag);
      document.removeEventListener('mouseup', handleDragEnd);
      document.body.style.cursor = '';
    };

    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', handleDragEnd);
    document.body.style.cursor = 'grabbing';
  }, [node.id, node.position, isEditing, isDragging, onSelect, onMove, zoom, pan]);

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    
    resizeStart.current = {
      x: e.clientX,
      y: e.clientY,
      width: node.width,
      height: node.height,
    };

    const handleResize = (moveEvent: MouseEvent) => {
      if (!isResizing) return;

      const deltaX = (moveEvent.clientX - resizeStart.current.x) / zoom;
      const deltaY = (moveEvent.clientY - resizeStart.current.y) / zoom;

      const newWidth = Math.max(80, resizeStart.current.width + deltaX);
      const newHeight = Math.max(40, resizeStart.current.height + deltaY);

      onResize(node.id, { width: newWidth, height: newHeight });
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
  }, [node.id, node.width, node.height, isResizing, onResize, zoom]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type !== 'start' && node.type !== 'end') {
      setIsEditing(true);
      setEditedText(node.text);
      setTimeout(() => {
        textareaRef.current?.focus();
        textareaRef.current?.select();
      }, 0);
    }
  }, [node.type, node.text]);

  const handleTextSubmit = useCallback(() => {
    if (editedText.trim()) {
      onTextChange(node.id, editedText.trim());
    }
    setIsEditing(false);
  }, [editedText, node.id, onTextChange]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
    
    // Auto-resize do textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.max(40, textarea.scrollHeight) + 'px';
  }, []);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setEditedText(node.text);
      setIsEditing(false);
    }
  }, [handleTextSubmit, node.text]);

  const nodeStyles = getNodeStyles();

  // Renderização do conteúdo baseado no tipo de nó
  const renderNodeContent = useCallback(() => {
    if (isEditing) {
      return (
        <textarea
          ref={textareaRef}
          value={editedText}
          onChange={handleTextareaChange}
          onBlur={handleTextSubmit}
          onKeyDown={handleKeyPress}
          className="w-full h-full bg-transparent border-none outline-none text-white placeholder-white/70 resize-none text-center leading-relaxed p-2 overflow-hidden"
          placeholder="Digite o texto..."
          style={{ minHeight: '20px' }}
          autoFocus
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center p-3">
        <div className="text-sm font-medium text-center break-words whitespace-pre-wrap leading-relaxed">
          {node.text.split('\n').map((line, index) => (
            <div key={index}>{line || <br />}</div>
          ))}
        </div>
      </div>
    );
  }, [isEditing, editedText, node.text, handleTextareaChange, handleTextSubmit, handleKeyPress]);

  return (
    <div
      ref={nodeRef}
      className={`absolute select-none ${nodeStyles.className} ${
        isSelected ? 'ring-4 ring-blue-400 ring-opacity-60' : ''
      } ${isDragging ? 'opacity-80 cursor-grabbing' : 'cursor-move'} transition-all duration-150`}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: nodeStyles.width,
        height: nodeStyles.height,
        zIndex: isDragging || isResizing || isSelected ? 1000 : 1,
      }}
      onMouseDown={handleDragStart}
      onDoubleClick={handleDoubleClick}
    >
      {/* Conteúdo principal do nó */}
      {node.type === 'decision' ? (
        <div className="w-full h-full flex items-center justify-center">
          {renderNodeContent()}
        </div>
      ) : (
        renderNodeContent()
      )}

      {/* Botão de conexão - só mostra quando selecionado */}
      {isSelected && (
        <button
          className="absolute -right-2 -bottom-2 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center text-xs hover:bg-gray-900 transition-colors shadow-lg z-10"
          onClick={(e) => {
            e.stopPropagation();
            onStartConnection(node.id);
          }}
          title="Conectar com outro nó"
        >
          <span className="font-bold">+</span>
        </button>
      )}

      {/* Alça de redimensionamento - só mostra quando selecionado e para tipos redimensionáveis */}
      {isSelected && node.type !== 'start' && node.type !== 'end' && (
        <div
          className="absolute bottom-1 right-1 w-4 h-4 bg-blue-500 rounded-sm cursor-nw-resize hover:bg-blue-600 transition-colors shadow border border-blue-300"
          onMouseDown={handleResizeStart}
          title="Redimensionar nó"
        />
      )}

      {/* Área para receber conexões */}
      {isConnecting && (
        <div
          className="absolute inset-0 rounded-lg cursor-crosshair opacity-0 hover:opacity-20 bg-green-400 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            onEndConnection(node.id);
          }}
          title="Conectar a este nó"
        />
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para evitar re-renders desnecessários
  return (
    prevProps.node === nextProps.node &&
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.zoom === nextProps.zoom &&
    prevProps.pan === nextProps.pan &&
    prevProps.isConnecting === nextProps.isConnecting
  );
});

ImprovedFlowchartNode.displayName = 'ImprovedFlowchartNode';
