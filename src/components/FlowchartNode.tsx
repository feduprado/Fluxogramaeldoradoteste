import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
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

export const FlowchartNode: React.FC<FlowchartNodeProps> = React.memo(({
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
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const originalPos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const getNodeStyle = useCallback((): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: node.width,
      height: node.height,
      left: node.position.x,
      top: node.position.y,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: isEditing ? 'text' : 'move',
      userSelect: 'none',
      border: '2px solid',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      transition: isDragging ? 'none' : 'all 150ms',
      pointerEvents: isConnecting ? 'auto' : 'auto',
    };

    switch (node.type) {
      case 'start':
        return {
          ...baseStyle,
          // Força círculo perfeito usando o menor valor entre width e height
          width: Math.min(node.width, node.height),
          height: Math.min(node.width, node.height),
          backgroundColor: '#10B981',
          borderColor: '#047857',
          borderRadius: '50%',
          color: 'white',
        };
      case 'end':
        return {
          ...baseStyle,
          // Força círculo perfeito usando o menor valor entre width e height
          width: Math.min(node.width, node.height),
          height: Math.min(node.width, node.height),
          backgroundColor: '#EF4444',
          borderColor: '#DC2626',
          borderRadius: '50%',
          color: 'white',
        };
      case 'process':
        return {
          ...baseStyle,
          backgroundColor: '#3B82F6',
          borderColor: '#1D4ED8',
          borderRadius: '8px',
          color: 'white',
        };
      case 'decision':
        return {
          ...baseStyle,
          backgroundColor: '#F59E0B',
          borderColor: '#D97706',
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          color: 'white',
        };
      default:
        return {
          ...baseStyle,
          backgroundColor: '#6B7280',
          borderColor: '#4B5563',
          borderRadius: '8px',
          color: 'white',
        };
    }
  }, [node, isEditing, isConnecting, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Se clicou no botão de conexão, não inicia o arrasto
    if ((e.target as HTMLElement).closest('button[data-connection="true"]')) {
      return;
    }
    
    if (isEditing) return;
    
    // ⚡ NOVO: Só permite arrastar se Shift estiver pressionado
    if (!e.shiftKey) {
      // Apenas seleciona o nó sem arrastar
      e.stopPropagation();
      e.preventDefault();
      onSelect(node.id);
      return;
    }
    
    // Shift está pressionado - inicia arraste
    e.stopPropagation();
    e.preventDefault(); // Previne seleção de texto e outros comportamentos
    onSelect(node.id);
    setIsDragging(true);
    
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
    };
    originalPos.current = { ...node.position };

    console.log('🟢 Iniciando arraste do nó COM SHIFT:', node.id, {
      startPos: dragStart.current,
      originalPos: originalPos.current,
      shiftKey: e.shiftKey
    });

    // Adiciona listeners globais imediatamente
    const moveHandler = (me: MouseEvent) => {
      if (!dragStart.current) return;
      
      const deltaX = (me.clientX - dragStart.current.x) / zoom;
      const deltaY = (me.clientY - dragStart.current.y) / zoom;

      const newPosition = {
        x: originalPos.current.x + deltaX,
        y: originalPos.current.y + deltaY,
      };

      onMove(node.id, newPosition);
    };

    const upHandler = () => {
      console.log('🔴 Finalizando arraste do nó:', node.id);
      
      setIsDragging(false);
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Salva no histórico após finalizar o arraste
      if (typeof (onResize as any).savePositionToHistory === 'function') {
        (onResize as any).savePositionToHistory();
      }
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [node.id, node.position, isEditing, onSelect, zoom, onMove, onResize]);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (node.type !== 'start' && node.type !== 'end') {
      setIsEditing(true);
      setEditedText(node.text);
    }
  }, [node.type, node.text]);

  const handleTextSubmit = useCallback(() => {
    if (editedText.trim()) {
      onTextChange(node.id, editedText.trim());
    }
    setIsEditing(false);
  }, [editedText, node.id, onTextChange]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setEditedText(node.text);
      setIsEditing(false);
    }
  }, [handleTextSubmit, node.text]);

  const nodeStyle = useMemo(() => {
    const style = getNodeStyle();
    
    // Aplica estilos de estado
    if (isDragging) {
      style.opacity = 0.9;
      style.transform = 'scale(1.05)';
      style.zIndex = 1000;
      style.cursor = 'grabbing';
    } else if (isSelected) {
      style.outline = '2px solid #60A5FA';
      style.outlineOffset = '2px';
      style.zIndex = 100;
    }
    
    return style;
  }, [getNodeStyle, isDragging, isSelected]);

  const contentStyle = useMemo((): React.CSSProperties => {
    return node.type === 'decision' 
      ? {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '8px',
        }
      : {
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        };
  }, [node.type]);

  return (
    <div
      ref={nodeRef}
      style={nodeStyle}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      <div style={{
        ...contentStyle,
        pointerEvents: isEditing ? 'auto' : 'none',
      }}>
        {isEditing ? (
          <input
            type="text"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            onBlur={handleTextSubmit}
            onKeyDown={handleKeyPress}
            style={{
              width: '90%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: '500',
              pointerEvents: 'auto',
            }}
            autoFocus
            onMouseDown={(e) => e.stopPropagation()}
          />
        ) : (
          <div style={{
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500',
            wordBreak: 'break-word',
            lineHeight: '1.4',
            pointerEvents: 'none',
          }}>
            {node.text.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        )}
      </div>

      {isSelected && (
        <button
          data-connection="true"
          style={{
            position: 'absolute',
            right: '-8px',
            bottom: '-8px',
            width: '24px',
            height: '24px',
            backgroundColor: '#1F2937',
            color: 'white',
            borderRadius: '50%',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            zIndex: 20,
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('🔗 Botão de conexão clicado para o nó:', node.id);
            onStartConnection(node.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          title="Conectar com outro nó"
        >
          +
        </button>
      )}

      {isConnecting && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            cursor: 'crosshair',
            zIndex: 10,
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('🎯 Nó clicado para conexão:', node.id);
            onEndConnection(node.id);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        />
      )}
    </div>
  );
});

FlowchartNode.displayName = 'FlowchartNode';