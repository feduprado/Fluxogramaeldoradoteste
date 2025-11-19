import React, { useState, useRef, useEffect } from 'react';
import { Container as ContainerType } from '../types/container';
import { CONTAINER_COLORS, CONTAINER_BORDER_COLORS } from '../types/container';
import { Maximize2, Minimize2, Lock, Unlock } from 'lucide-react';

interface ContainerProps {
  container: ContainerType;
  isSelected: boolean;
  onSelect: (containerId: string) => void;
  onMove: (containerId: string, newPosition: { x: number; y: number }) => void;
  onResize: (containerId: string, newSize: { width: number; height: number }) => void;
  onToggleCollapse: (containerId: string) => void;
  onRename?: (containerId: string, newName: string) => void;
  onStartConnection?: (containerId: string) => void; // Adicionado
  onEndConnection?: (containerId: string) => void;   // Adicionado
  isConnecting?: boolean; // Adicionado
  zoom: number;
  pan: { x: number; y: number };
}

export const Container: React.FC<ContainerProps> = ({
  container,
  isSelected,
  onSelect,
  onMove,
  onResize,
  onToggleCollapse,
  onRename,
  onStartConnection,
  onEndConnection,
  isConnecting = false,
  zoom,
  pan,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(container.name);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevenir seleção de texto
    e.preventDefault();
    
    // Não fazer nada se estiver editando
    if (isEditing) return;
    
    // Apenas iniciar drag se não estiver clicando no botão de colapsar
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    
    // Se clicar no input, não fazer nada
    if ((e.target as HTMLElement).tagName === 'INPUT') {
      return;
    }

    // Selecionar container
    onSelect(container.id);

    // Verificar se está clicando no handle de resize
    const isResizeHandle = (e.target as HTMLElement).classList.contains('resize-handle');
    
    if (isResizeHandle) {
      setIsResizing(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY,
      });
    } else {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - container.position.x * zoom - pan.x,
        y: e.clientY - container.position.y * zoom - pan.y,
      });
    }
  };
  
  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Só permitir edição se onRename foi fornecido e não está clicando em botões
    if (onRename && !(e.target as HTMLElement).closest('button')) {
      setIsEditing(true);
      setEditedName(container.name);
    }
  };
  
  const handleNameSubmit = () => {
    if (editedName.trim() && onRename) {
      onRename(container.id, editedName.trim());
    } else {
      setEditedName(container.name);
    }
    setIsEditing(false);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameSubmit();
    } else if (e.key === 'Escape') {
      setEditedName(container.name);
      setIsEditing(false);
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = (e.clientX - dragStart.x - pan.x) / zoom;
        const newY = (e.clientY - dragStart.y - pan.y) / zoom;
        onMove(container.id, { x: newX, y: newY });
      } else if (isResizing) {
        const deltaX = e.clientX - dragStart.x;
        const deltaY = e.clientY - dragStart.y;
        
        const newWidth = Math.max(200, container.size.width + deltaX / zoom);
        const newHeight = Math.max(150, container.size.height + deltaY / zoom);
        
        onResize(container.id, { width: newWidth, height: newHeight });
        
        setDragStart({
          x: e.clientX,
          y: e.clientY,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, container, onMove, onResize, zoom, pan]);

  const backgroundColor = CONTAINER_COLORS[container.type];
  const borderColor = CONTAINER_BORDER_COLORS[container.type];

  return (
    <div
      ref={containerRef}
      className={`absolute cursor-move select-none transition-shadow ${
        isSelected ? 'shadow-xl' : 'shadow-md'
      }`}
      style={{
        left: container.position.x,
        top: container.position.y,
        width: container.size.width,
        height: container.isCollapsed ? 40 : container.size.height,
        backgroundColor,
        border: `2px ${isSelected ? 'solid' : 'dashed'} ${borderColor}`,
        borderRadius: '8px',
        zIndex: container.zIndex,
        pointerEvents: 'auto',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header do container */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-move"
        style={{
          backgroundColor: `${borderColor}20`,
          borderBottom: container.isCollapsed ? 'none' : `1px solid ${borderColor}40`,
          borderRadius: '6px 6px 0 0',
        }}
      >
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: borderColor }}
          />
          {isEditing ? (
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={handleKeyPress}
              className="flex-1 bg-white/50 border-b border-gray-300 focus:border-blue-500 font-medium text-sm outline-none px-1"
              style={{ color: borderColor }}
              autoFocus
              onMouseDown={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span
                className="font-medium text-sm"
                style={{ color: borderColor }}
              >
                {container.name}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: `${borderColor}30`,
                  color: borderColor,
                }}
              >
                {container.type}
              </span>
            </>
          )}
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleCollapse(container.id);
          }}
          className="p-1 rounded hover:bg-white/50 transition-colors"
          title={container.isCollapsed ? 'Expandir' : 'Colapsar'}
        >
          {container.isCollapsed ? (
            <Maximize2 className="w-3 h-3" style={{ color: borderColor }} />
          ) : (
            <Minimize2 className="w-3 h-3" style={{ color: borderColor }} />
          )}
        </button>
      </div>

      {/* Área de conteúdo */}
      {!container.isCollapsed && (
        <div className="p-3 h-full">
          {/* Os nós serão renderizados aqui pelo Canvas */}
        </div>
      )}

      {/* Handle de resize no canto inferior direito */}
      {!container.isCollapsed && (
        <div
          className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          style={{
            borderRight: `2px solid ${borderColor}`,
            borderBottom: `2px solid ${borderColor}`,
            borderBottomRightRadius: '6px',
          }}
        />
      )}

      {/* Borda de seleção */}
      {isSelected && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            border: `3px solid ${borderColor}`,
            borderRadius: '8px',
            boxShadow: `0 0 0 2px white, 0 0 0 4px ${borderColor}`,
          }}
        />
      )}

      {/* Pontos de conexão - visíveis apenas quando selecionado ou em modo de conexão */}
      {(isSelected || isConnecting) && onStartConnection && onEndConnection && (
        <>
          {/* Ponto de conexão à direita */}
          <button
            data-connection="true"
            style={{
              position: 'absolute',
              right: '-12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '24px',
              backgroundColor: borderColor,
              color: 'white',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 20,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isConnecting) {
                onEndConnection(container.id);
              } else {
                onStartConnection(container.id);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title={isConnecting ? 'Conectar aqui' : 'Iniciar conexão'}
          >
            {isConnecting ? '○' : '+'}
          </button>

          {/* Ponto de conexão à esquerda */}
          <button
            data-connection="true"
            style={{
              position: 'absolute',
              left: '-12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '24px',
              height: '24px',
              backgroundColor: borderColor,
              color: 'white',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 20,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isConnecting) {
                onEndConnection(container.id);
              } else {
                onStartConnection(container.id);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title={isConnecting ? 'Conectar aqui' : 'Iniciar conexão'}
          >
            {isConnecting ? '○' : '+'}
          </button>

          {/* Ponto de conexão em cima */}
          <button
            data-connection="true"
            style={{
              position: 'absolute',
              left: '50%',
              top: '-12px',
              transform: 'translateX(-50%)',
              width: '24px',
              height: '24px',
              backgroundColor: borderColor,
              color: 'white',
              borderRadius: '50%',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              zIndex: 20,
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (isConnecting) {
                onEndConnection(container.id);
              } else {
                onStartConnection(container.id);
              }
            }}
            onMouseDown={(e) => e.stopPropagation()}
            title={isConnecting ? 'Conectar aqui' : 'Iniciar conexão'}
          >
            {isConnecting ? '○' : '+'}
          </button>

          {/* Ponto de conexão embaixo */}
          {!container.isCollapsed && (
            <button
              data-connection="true"
              style={{
                position: 'absolute',
                left: '50%',
                bottom: '-12px',
                transform: 'translateX(-50%)',
                width: '24px',
                height: '24px',
                backgroundColor: borderColor,
                color: 'white',
                borderRadius: '50%',
                border: '2px solid white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                zIndex: 20,
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (isConnecting) {
                  onEndConnection(container.id);
                } else {
                  onStartConnection(container.id);
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              title={isConnecting ? 'Conectar aqui' : 'Iniciar conexão'}
            >
              {isConnecting ? '○' : '+'}
            </button>
          )}
        </>
      )}
    </div>
  );
};