import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FlowNode, HookDirection, ConnectionHook } from '../types';
import { Container } from '../types/container';
import { Theme } from '../hooks/useTheme';
import {
  getHookPosition,
  getDefaultNodeHooks,
  HOOK_SIZE,
  clampHookSize,
} from '../utils/hookManager';
import { HookManager } from './HookManager';
import { HookContextMenu } from './HookContextMenu';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const hexToRgb = (hex?: string) => {
  if (!hex) return null;
  const normalized = hex.replace('#', '');
  if (![3, 6].includes(normalized.length)) return null;
  const value = normalized.length === 3
    ? normalized.split('').map(char => char + char).join('')
    : normalized;
  const num = Number.parseInt(value, 16);
  if (Number.isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b].map(channel => channel.toString(16).padStart(2, '0')).join('')}`;

const lightenColor = (hex: string, amount = 20) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const factor = amount / 100;
  const adjust = (channel: number) => clamp(Math.round(channel + (255 - channel) * factor), 0, 255);
  return rgbToHex(adjust(rgb.r), adjust(rgb.g), adjust(rgb.b));
};

const getAdaptiveTextColor = (hex: string, theme: Theme) => {
  const rgb = hexToRgb(hex);
  if (!rgb) {
    return theme === 'dark' ? '#E2E8F0' : '#0F172A';
  }
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminance > 0.6 ? '#0F172A' : '#F8FAFC';
};

const HOOK_SYMBOLS: Record<HookDirection, string> = {
  top: '↑',
  right: '→',
  bottom: '↓',
  left: '←',
  'top-left': '↖',
  'top-right': '↗',
  'bottom-left': '↙',
  'bottom-right': '↘',
};

type HookMenuState = {
  hookId: string;
  position: { x: number; y: number };
};

interface FlowchartNodeProps {
  node: FlowNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onToggleSelection?: (nodeId: string, isShiftPressed: boolean) => void; // 🆕 Multi-seleção
  onMove: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onMoveMultiple?: (nodeIds: string[], delta: { x: number; y: number }) => void; // 🆕 Arraste múltiplo COM DELTA
  onClearMultiDrag?: () => void; // 🆕 Limpa posições originais
  selectedNodeIds?: string[]; // 🆕 Para saber quais nós estão selecionados
  onTextChange: (nodeId: string, newText: string) => void;
  onStartConnection: (nodeId: string, hookId?: string) => void;
  onEndConnection: (nodeId: string, hookId?: string) => void;
  onResize: (nodeId: string, newSize: { width: number; height: number }) => void;
  zoom: number;
  theme: Theme;
  containers: Container[];
  temporaryConnection?: { fromNodeId: string; fromHookId?: string; x: number; y: number } | null; // 🆕 Para detectar conexões
  // 🆕 Hook management
  onAddHook?: (nodeId: string, direction: HookDirection) => void;
  onRemoveHook?: (nodeId: string, hookId: string) => void;
  onRedistributeHooks?: (nodeId: string, direction: HookDirection) => void;
  onUpdateHook?: (nodeId: string, hookId: string, updates: Partial<ConnectionHook>) => void;
}

export const FlowchartNode: React.FC<FlowchartNodeProps> = React.memo((({
  node,
  isSelected,
  onSelect,
  onToggleSelection, // 🆕
  onMove,
  onMoveMultiple, // 🆕
  onClearMultiDrag, // 🆕
  selectedNodeIds, // 🆕
  onTextChange,
  onStartConnection,
  onEndConnection,
  onResize,
  zoom,
  theme,
  containers,
  temporaryConnection, // 🆕
  onAddHook, // 🆕
  onRemoveHook, // 🆕
  onRedistributeHooks, // 🆕
  onUpdateHook, // 🆕
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(node.text);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Estado para hover
  const [hoveredHookId, setHoveredHookId] = useState<string | null>(null);
  const [hookMenuState, setHookMenuState] = useState<HookMenuState | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const originalPos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // 🆕 Calcula se está em modo de conexão
  const isConnecting = temporaryConnection !== null && temporaryConnection !== undefined;
  const connectingFromThisNode = temporaryConnection?.fromNodeId === node.id;
  const activeHookId = connectingFromThisNode ? temporaryConnection?.fromHookId : undefined;
  const canReceiveConnection = Boolean(isConnecting && !connectingFromThisNode);
  const allHooks = useMemo(() => node.hooks || getDefaultNodeHooks(node.id), [node.hooks, node.id]);
  const visibleHooks = useMemo(() => allHooks.filter(h => h.isVisible !== false), [allHooks]);
  const contextMenuHook = hookMenuState ? allHooks.find(h => h.id === hookMenuState.hookId) : undefined;
  const shouldRenderHooks = isSelected || isHovered || isConnecting;

  useEffect(() => {
    if (!isSelected) {
      setHookMenuState(null);
    }
  }, [isSelected]);

  useEffect(() => {
    if (hookMenuState && !contextMenuHook) {
      setHookMenuState(null);
    }
  }, [hookMenuState, contextMenuHook]);

  const handleHookMouseDown = useCallback((event: React.MouseEvent, hook: ConnectionHook) => {
    if (event.button === 2) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();

    if (isConnecting && temporaryConnection?.fromNodeId !== node.id) {
      onEndConnection(node.id, hook.id);
      return;
    }

    onStartConnection(node.id, hook.id);
  }, [isConnecting, temporaryConnection, node.id, onEndConnection, onStartConnection]);

  const handleHookMouseUp = useCallback((event: React.MouseEvent, hook: ConnectionHook) => {
    if (event.button === 2) {
      return;
    }

    if (!isConnecting || temporaryConnection?.fromNodeId === node.id) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onEndConnection(node.id, hook.id);
  }, [isConnecting, temporaryConnection, node.id, onEndConnection]);

  const handleHookContextMenu = useCallback((event: React.MouseEvent, hook: ConnectionHook) => {
    if (!onUpdateHook) return;
    event.preventDefault();
    event.stopPropagation();
    setHookMenuState({ hookId: hook.id, position: { x: event.clientX, y: event.clientY } });
  }, [onUpdateHook]);

  const handleHookMenuChange = useCallback((updates: Partial<ConnectionHook>) => {
    if (!contextMenuHook || !onUpdateHook) return;
    onUpdateHook(node.id, contextMenuHook.id, updates);
  }, [contextMenuHook, node.id, onUpdateHook]);

  const handleHookRemoval = useCallback(() => {
    if (!contextMenuHook || !onRemoveHook) return;
    onRemoveHook(node.id, contextMenuHook.id);
    setHookMenuState(null);
  }, [contextMenuHook, node.id, onRemoveHook]);

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
          borderColor: '#B91C1C',
          borderRadius: '50%',
          color: 'white',
        };
      case 'decision':
        return {
          ...baseStyle,
          backgroundColor: '#F59E0B',
          borderColor: '#D97706',
          transform: 'rotate(45deg)',
          color: 'white',
        };
      case 'process':
      default:
        return {
          ...baseStyle,
          backgroundColor: theme === 'dark' ? '#3B82F6' : '#60A5FA',
          borderColor: '#2563EB',
          borderRadius: '8px',
          color: 'white',
        };
    }
  }, [node.type, node.width, node.height, node.position, isEditing, isDragging, theme, isConnecting]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;

    e.preventDefault(); // Previne seleção de texto
    e.stopPropagation();

    // 🆕 Detecta se Shift está pressionado para multi-seleção
    if (e.shiftKey && onToggleSelection) {
      onToggleSelection(node.id, true);
    } else {
      onSelect(node.id);
    }

    // Previne arrastar se nó está fixo
    if (node.isFixed) {
      console.log('🔒 Nó está fixado, não pode ser arrastado');
      return;
    }

    setIsDragging(true);
    
    // Posição inicial do cursor
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
    };
    
    // Posição original do nó
    originalPos.current = {
      x: node.position.x,
      y: node.position.y,
    };
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, [isEditing, node, onSelect, onToggleSelection]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      if (!animationFrameRef.current) {
        animationFrameRef.current = requestAnimationFrame(() => {
          const dx = (lastMousePos.current.x - dragStart.current.x) / zoom;
          const dy = (lastMousePos.current.y - dragStart.current.y) / zoom;

          // 🆕 Detecta se deve mover múltiplos nós
          const shouldMoveMultiple = selectedNodeIds && selectedNodeIds.length > 1 && selectedNodeIds.includes(node.id);
          
          if (shouldMoveMultiple && onMoveMultiple) {
            // 🎯 ARRASTE MÚLTIPLO - Envia DELTA para aplicar às posições originais
            onMoveMultiple(selectedNodeIds, { x: dx, y: dy });
          } else {
            // Arraste individual
            const newPosition = {
              x: originalPos.current.x + dx,
              y: originalPos.current.y + dy,
            };
            onMove(node.id, newPosition);
          }
          
          animationFrameRef.current = null;
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      onClearMultiDrag?.(); // 🆕 Limpa as posições originais do arraste múltiplo
      
      // Cancela qualquer animation frame pendente
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isDragging, node, onMove, onMoveMultiple, onClearMultiDrag, selectedNodeIds, zoom]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedText(e.target.value);
  };

  const handleTextBlur = () => {
    onTextChange(node.id, editedText);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditedText(node.text);
      setIsEditing(false);
    }
    e.stopPropagation();
  };

  // Controles de resize
  const handleResizeMouseDown = (e: React.MouseEvent, direction: 'nw' | 'ne' | 'sw' | 'se') => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = node.width;
    const startHeight = node.height;
    const startPosX = node.position.x;
    const startPosY = node.position.y;

    const handleResizeMove = (moveEvent: MouseEvent) => {
      const deltaX = (moveEvent.clientX - startX) / zoom;
      const deltaY = (moveEvent.clientY - startY) / zoom;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newPosX = startPosX;
      let newPosY = startPosY;

      if (direction.includes('e')) {
        newWidth = Math.max(100, startWidth + deltaX);
      }
      if (direction.includes('s')) {
        newHeight = Math.max(50, startHeight + deltaY);
      }
      if (direction.includes('w')) {
        newWidth = Math.max(100, startWidth - deltaX);
        newPosX = startPosX + (startWidth - newWidth);
      }
      if (direction.includes('n')) {
        newHeight = Math.max(50, startHeight - deltaY);
        newPosY = startPosY + (startHeight - newHeight);
      }

      onResize(node.id, { width: newWidth, height: newHeight });
      if (newPosX !== startPosX || newPosY !== startPosY) {
        onMove(node.id, { x: newPosX, y: newPosY });
      }
    };

    const handleResizeUp = () => {
      document.removeEventListener('mousemove', handleResizeMove);
      document.removeEventListener('mouseup', handleResizeUp);
    };

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeUp);
  };

  return (
    <div
      ref={nodeRef}
      style={{
        position: 'absolute',
        left: node.position.x,
        top: node.position.y,
        width: node.width,
        height: node.height,
        pointerEvents: 'auto',
        zIndex: isSelected ? 200 : 100,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={getNodeStyle()}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
      >
        {/* Conteúdo do nó */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            padding: '12px',
            transform: node.type === 'decision' ? 'rotate(-45deg)' : 'none',
            overflow: 'hidden',
          }}
        >
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={handleTextChange}
              onBlur={handleTextBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                width: '100%',
                height: '100%',
                background: 'transparent',
                border: 'none',
                color: 'white',
                textAlign: 'center',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div style={{
              width: '100%',
              textAlign: 'center',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}>
              {node.text.split('\n').map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
          )}
        </div>

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
            onMouseUp={(e) => {
              if (e.button === 2) return;
              if (!isConnecting || connectingFromThisNode) return;
              e.stopPropagation();
              onEndConnection(node.id);
            }}
          />
        )}
      </div>

      {/* 🎯 HOOKS DE CONEXÃO - customizáveis */}
      {shouldRenderHooks && visibleHooks.map(hook => {
        const hookPos = getHookPosition(node, hook.direction, hook.offset);
        const relativeX = hookPos.x - node.position.x;
        const relativeY = hookPos.y - node.position.y;
        const hookSize = clampHookSize(hook.size ?? HOOK_SIZE);
        const fallbackColor = theme === 'dark' ? '#60A5FA' : '#2563EB';
        const baseColor = hook.color?.startsWith('#') ? hook.color : fallbackColor;
        const isActiveHook = activeHookId === hook.id;
        const isHoveredHook = hoveredHookId === hook.id;
        const isTargetHighlight = canReceiveConnection && isHoveredHook;
        const shouldHighlight = isActiveHook || isHoveredHook;
        const highlightAccent = '#3B82F6';
        const backgroundIsGradient = hook.style === 'gradient';
        const gradientBackground = backgroundIsGradient
          ? `linear-gradient(135deg, ${lightenColor(baseColor, 35)}, ${baseColor})`
          : undefined;
        const backgroundColor = gradientBackground
          ? undefined
          : theme === 'dark'
            ? 'rgba(15,23,42,0.95)'
            : '#FFFFFF';
        const arrowColor = shouldHighlight || isTargetHighlight
          ? '#E0F2FE'
          : getAdaptiveTextColor(baseColor, theme);
        const dropShadow = shouldHighlight || isTargetHighlight
          ? 'drop-shadow(0 10px 18px rgba(59,130,246,0.45))'
          : 'drop-shadow(0 6px 12px rgba(15,23,42,0.35))';
        const ringShadow = shouldHighlight || isTargetHighlight
          ? `0 0 0 2px ${highlightAccent}40`
          : '0 0 0 1px rgba(15,23,42,0.18)';
        const cursor = canReceiveConnection
          ? 'copy'
          : 'crosshair';
        const label = HOOK_SYMBOLS[hook.direction] || '•';
        const tooltip = hook.tooltip || (canReceiveConnection
          ? 'Clique para finalizar a conexão aqui'
          : 'Clique e arraste para iniciar uma conexão. Botão direito: configurações.');

        return (
          <div
            key={hook.id}
            data-connection-hook="true"
            role="button"
            aria-label={`Hook ${hook.direction}`}
            title={tooltip}
            style={{
              position: 'absolute',
              left: relativeX - hookSize / 2,
              top: relativeY - hookSize / 2,
              width: hookSize,
              height: hookSize,
              borderRadius: '50%',
              border: `2px ${hook.style === 'dashed' ? 'dashed' : 'solid'} ${baseColor}`,
              backgroundColor,
              background: gradientBackground,
              color: arrowColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: Math.max(8, hookSize * 0.35),
              cursor,
              boxShadow: ringShadow,
              filter: dropShadow,
              pointerEvents: 'auto',
              userSelect: 'none',
              zIndex: 300,
              transform: `scale(${shouldHighlight || isTargetHighlight ? 1.1 : 1})`,
              transformOrigin: 'center',
              transition: 'transform 0.15s ease, filter 0.15s ease, box-shadow 0.15s ease',
              backgroundClip: 'padding-box',
            }}
            onMouseDown={(e) => handleHookMouseDown(e, hook)}
            onMouseUp={(e) => handleHookMouseUp(e, hook)}
            onMouseEnter={() => setHoveredHookId(hook.id)}
            onMouseLeave={() => setHoveredHookId(prev => (prev === hook.id ? null : prev))}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => handleHookContextMenu(e, hook)}
            draggable={false}
          >
            {label}
          </div>
        );
      })}

      {/* Indicador de fixação - mostra quando o nó est fixo em um container */}
      {node.isFixed && (
        <div
          style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            width: '20px',
            height: '20px',
            backgroundColor: '#8B5CF6',
            borderRadius: '50%',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            zIndex: 260,
            pointerEvents: 'none',
          }}
          title="Nó fixado no container"
        >
          📌
        </div>
      )}

      {/* Indicador de container - mostra quando o nó está preso em um container */}
      {node.containerId && !node.isFixed && (
        <div
          style={{
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            width: '16px',
            height: '16px',
            backgroundColor: '#8B5CF6',
            borderRadius: '50%',
            border: '2px solid white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            zIndex: 260,
            pointerEvents: 'none',
          }}
          title="Node está preso a um container"
        >
          📦
        </div>
      )}

      {/* 🆕 HOOK MANAGER - Gerenciamento de hooks */}
      {isSelected && onAddHook && onRemoveHook && onRedistributeHooks && (
        <HookManager
          node={node}
          onAddHook={onAddHook}
          onRemoveHook={onRemoveHook}
          onRedistributeHooks={onRedistributeHooks}
        />
      )}

      {hookMenuState && contextMenuHook && onUpdateHook && (
        <HookContextMenu
          hook={contextMenuHook}
          position={hookMenuState.position}
          onClose={() => setHookMenuState(null)}
          onChange={handleHookMenuChange}
          onRemove={onRemoveHook ? handleHookRemoval : undefined}
        />
      )}

      {/* Handles de resize - apenas visíveis quando selecionado */}
      {isSelected && !isEditing && (
        <>
          <div
            style={{
              position: 'absolute',
              top: -4,
              left: -4,
              width: 8,
              height: 8,
              backgroundColor: '#3B82F6',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'nw-resize',
              zIndex: 250,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              width: 8,
              height: 8,
              backgroundColor: '#3B82F6',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'ne-resize',
              zIndex: 250,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              left: -4,
              width: 8,
              height: 8,
              backgroundColor: '#3B82F6',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'sw-resize',
              zIndex: 250,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -4,
              right: -4,
              width: 8,
              height: 8,
              backgroundColor: '#3B82F6',
              border: '2px solid white',
              borderRadius: '50%',
              cursor: 'se-resize',
              zIndex: 250,
            }}
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />
        </>
      )}
    </div>
  );
}));

FlowchartNode.displayName = 'FlowchartNode';