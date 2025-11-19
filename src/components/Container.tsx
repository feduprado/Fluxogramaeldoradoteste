import React, { useState, useRef, useEffect } from 'react';
import { Container as ContainerType } from '../types/container';
import { CONTAINER_COLORS, CONTAINER_BORDER_COLORS } from '../types/container';
import { Maximize2, Minimize2 } from 'lucide-react';

interface ContainerProps {
  container: ContainerType;
  isSelected: boolean;
  onSelect: (containerId: string) => void;
  onMove: (containerId: string, newPosition: { x: number; y: number }) => void;
  onResize: (containerId: string, newSize: { width: number; height: number }) => void;
  onToggleCollapse: (containerId: string) => void;
  onRename?: (containerId: string, newName: string) => void;
  onStartConnection?: (containerId: string, hookId?: string) => void;
  onEndConnection?: (containerId: string, hookId?: string) => void;
  isConnecting?: boolean;
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

  // 🐛 DEBUG: Log quando as props mudam
  useEffect(() => {
    if (isSelected || isConnecting) {
      console.log(`📦 Container ${container.id}:`, {
        isSelected,
        isConnecting,
        hasStartConnection: !!onStartConnection,
        hasEndConnection: !!onEndConnection,
        position: container.position
      });
    }
  }, [isSelected, isConnecting, container.id, container.position, onStartConnection, onEndConnection]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Se estiver editando, não fazer nada
    if (isEditing) return;
    
    const target = e.target as HTMLElement;
    
    // 🔥 IMPORTANTE: Não interferir com hooks de conexão
    if (target.closest('[data-connection-hook="true"]')) {
      console.log('🎯 Clique em hook detectado, ignorando drag');
      return;
    }
    
    // Não fazer nada se estiver clicando em botões
    if (target.closest('button')) {
      return;
    }
    
    // Se clicar no input, não fazer nada
    if (target.tagName === 'INPUT') {
      return;
    }

    e.preventDefault();
    
    // Selecionar container
    onSelect(container.id);

    // Verificar se está clicando no handle de resize
    const isResizeHandle = target.classList.contains('resize-handle');
    
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
    const target = e.target as HTMLElement;
    
    // Só permitir edição se onRename foi fornecido e não está clicando em botões/hooks
    if (onRename && !target.closest('button') && !target.closest('[data-connection-hook="true"]')) {
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

  // 🔥 Handler dedicado para hooks de conexão
  const handleConnectionHookClick = (e: React.MouseEvent, position: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log(`🔘 Hook ${position} clicado!`, {
      containerId: container.id,
      isConnecting,
      hasStartConnection: !!onStartConnection,
      hasEndConnection: !!onEndConnection
    });
    
    if (!onStartConnection || !onEndConnection) {
      console.warn('⚠️ Handlers de conexão não fornecidos!');
      return;
    }
    
    if (isConnecting) {
      console.log('🎯 Finalizando conexão em container:', container.id);
      onEndConnection(container.id);
    } else {
      console.log('🔗 Iniciando conexão de container:', container.id);
      onStartConnection(container.id);
    }
  };

  // Estilo comum para todos os hooks
  const hookStyle: React.CSSProperties = {
    position: 'absolute',
    width: '28px',
    height: '28px',
    backgroundColor: borderColor,
    color: 'white',
    borderRadius: '50%',
    border: '3px solid white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 12px -2px rgba(0, 0, 0, 0.3)',
    zIndex: 1000,
    pointerEvents: 'auto',
    transition: 'transform 0.2s, box-shadow 0.2s',
  };

  const showHooks = (isSelected || isConnecting) && onStartConnection && onEndConnection;

  return (
    <div
      ref={containerRef}
      className={`absolute select-none transition-shadow ${
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
        overflow: 'visible',
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {/* Header do container */}
      <div
        className="flex items-center justify-between px-3 py-2"
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

      {/* 🔥 HOOKS DE CONEXÃO - Refatorados com handlers dedicados */}
      {showHooks && (
        <>
          {/* Hook Direita */}
          <div
            data-connection-hook="true"
            style={{
              ...hookStyle,
              right: '-14px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            onClick={(e) => handleConnectionHookClick(e, 'direita')}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.15)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px -2px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px -2px rgba(0, 0, 0, 0.3)';
            }}
            title={isConnecting ? 'Conectar aqui' : 'Iniciar conexão'}
          >
            {isConnecting ? '○' : '+'}
          </div>

          {/* Hook Esquerda */}
          <div
            data-connection-hook="true"
            style={{
              ...hookStyle,
              left: '-14px',
              top: '50%',
              transform: 'translateY(-50%)',
            }}
            onClick={(e) => handleConnectionHookClick(e, 'esquerda')}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1.15)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px -2px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-50%) scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px -2px rgba(0, 0, 0, 0.3)';
            }}
            title={isConnecting ? 'Conectar aqui' : 'Iniciar conexão'}
          >
            {isConnecting ? '○' : '+'}
          </div>

          {/* Hook Topo */}
          <div
            data-connection-hook="true"
            style={{
              ...hookStyle,
              left: '50%',
              top: '-14px',
              transform: 'translateX(-50%)',
            }}
            onClick={(e) => handleConnectionHookClick(e, 'topo')}
            onMouseDown={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateX(-50%) scale(1.15)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px -2px rgba(0, 0, 0, 0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'translateX(-50%) scale(1)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px -2px rgba(0, 0, 0, 0.3)';
            }}
            title={isConnecting ? 'Conectar aqui' : 'Iniciar conexão'}
          >
            {isConnecting ? '○' : '+'}
          </div>

          {/* Hook Base */}
          {!container.isCollapsed && (
            <div
              data-connection-hook="true"
              style={{
                ...hookStyle,
                left: '50%',
                bottom: '-14px',
                transform: 'translateX(-50%)',
              }}
              onClick={(e) => handleConnectionHookClick(e, 'base')}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateX(-50%) scale(1.15)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 16px -2px rgba(0, 0, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateX(-50%) scale(1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px -2px rgba(0, 0, 0, 0.3)';
              }}
              title={isConnecting ? 'Conectar aqui' : 'Iniciar conexão'}
            >
              {isConnecting ? '○' : '+'}
            </div>
          )}
        </>
      )}
    </div>
  );
};