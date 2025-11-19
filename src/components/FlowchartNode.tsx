import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { FlowNode, HookDirection } from '../types';
import { getHookPosition, getDefaultNodeHooks, HOOK_SIZE, getVisibleHooks } from '../utils/hookManager';
import { HookColorSystem } from '../services/hookColorSystem';
import { HookManager } from './HookManager';

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
  onStartConnection: (nodeId: string) => void;
  onEndConnection: (nodeId: string) => void;
  onResize: (nodeId: string, newSize: { width: number; height: number }) => void;
  zoom: number;
  theme: Theme;
  containers: Container[];
  temporaryConnection?: { fromNodeId: string; x: number; y: number } | null; // 🆕 Para detectar conexões
  // 🆕 Hook management
  onAddHook?: (nodeId: string, direction: HookDirection) => void;
  onRemoveHook?: (nodeId: string, hookId: string) => void;
  onRedistributeHooks?: (nodeId: string, direction: HookDirection) => void;
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
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(node.text);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false); // Estado para hover
  const nodeRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0 });
  const originalPos = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // 🆕 Calcula se está em modo de conexão
  const isConnecting = temporaryConnection !== null && temporaryConnection !== undefined;

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
          // Força losango perfeito usando o menor valor entre width e height
          width: Math.min(node.width, node.height),
          height: Math.min(node.width, node.height),
          backgroundColor: '#F59E0B',
          borderColor: '#B45309',
          border: 'none', // Remove border porque clipPath corta
          clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          color: 'white',
          // Usa box-shadow para criar borda que não é cortada pelo clipPath
          boxShadow: `
            0 4px 6px -1px rgba(0, 0, 0, 0.1), 
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            inset 0 0 0 3px #B45309
          `,
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
    if ((e.target as HTMLElement).closest('button[data-connection=\"true\"]')) {
      return;
    }
    
    if (isEditing) return;
    
    // 🆕 Multi-seleção com Shift+Click
    if (onToggleSelection) {
      console.log('🎯 FlowchartNode chamando onToggleSelection:', node.id, 'Shift:', e.shiftKey);
      onToggleSelection(node.id, e.shiftKey);
    } else {
      onSelect(node.id);
    }
    
    // ⚡ NOVO: Só permite arrastar se Shift estiver pressionado
    if (!e.shiftKey) {
      // Apenas seleciona o nó sem arrastar
      e.stopPropagation();
      e.preventDefault();
      return;
    }
    
    // Shift está pressionado - inicia arraste
    e.stopPropagation();
    e.preventDefault(); // Previne seleção de texto e outros comportamentos
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

      // 🆕 ARRASTE MÚLTIPLO: Se há múltiplos nós selecionados, move todos juntos
      if (selectedNodeIds && selectedNodeIds.length > 1 && onMoveMultiple) {
        // Passa o delta TOTAL desde o início do arraste
        console.log('📍 Movendo múltiplos - Delta total:', { deltaX, deltaY });
        onMoveMultiple(selectedNodeIds, { x: deltaX, y: deltaY });
      } else {
        // Arraste simples de um único nó
        const newPosition = {
          x: originalPos.current.x + deltaX,
          y: originalPos.current.y + deltaY,
        };

        onMove(node.id, newPosition);
      }
    };

    const upHandler = () => {
      console.log('🔴 Finalizando arraste do nó:', node.id);
      
      setIsDragging(false);
      document.removeEventListener('mousemove', moveHandler);
      document.removeEventListener('mouseup', upHandler);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // 🆕 Limpa posições originais do arraste múltiplo
      if (onClearMultiDrag) {
        onClearMultiDrag();
      }
      
      // Salva no histórico após finalizar o arraste
      if (typeof (onResize as any).savePositionToHistory === 'function') {
        (onResize as any).savePositionToHistory();
      }
    };

    document.addEventListener('mousemove', moveHandler);
    document.addEventListener('mouseup', upHandler);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [node.id, node.position, isEditing, onSelect, zoom, onMove, onResize, onToggleSelection, onMoveMultiple, onClearMultiDrag, selectedNodeIds]);

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
      style.zIndex = 1000; // Máxima prioridade quando arrastando
      style.cursor = 'grabbing';
    } else if (isSelected) {
      style.outline = '2px solid #60A5FA';
      style.outlineOffset = '2px';
      style.zIndex = 100; // Alta prioridade quando selecionado
    } else if (isHovered && !isEditing) {
      // Efeito de hover em todos os nós
      style.transform = 'scale(1.03)';
      style.zIndex = 75;
      
      // Para o nó de decisão, intensifica a borda interna no hover
      if (node.type === 'decision') {
        style.boxShadow = `
          0 8px 12px -2px rgba(0, 0, 0, 0.2), 
          0 4px 8px -2px rgba(0, 0, 0, 0.1),
          inset 0 0 0 4px #D97706
        `;
      } else {
        style.boxShadow = '0 8px 12px -2px rgba(0, 0, 0, 0.2), 0 4px 8px -2px rgba(0, 0, 0, 0.1)';
      }
    } else {
      // ⚡ IMPORTANTE: zIndex base para garantir que nodes fiquem SEMPRE acima de containers
      style.zIndex = 50; // Containers têm zIndex 1-10, então 50 garante que nodes ficam acima
    }
    
    return style;
  }, [getNodeStyle, isDragging, isSelected, isHovered, isEditing, node.type]);

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

  // 🔧 WRAPPER STYLE: Container absoluto que envolve tudo (sem clipPath)
  const wrapperStyle: React.CSSProperties = {
    position: 'absolute',
    left: node.position.x,
    top: node.position.y,
    width: node.width,
    height: node.height,
    pointerEvents: 'none', // Não interfere nos eventos
  };

  return (
    <div style={wrapperStyle}>
      {/* NODE PRINCIPAL com clipPath */}
      <div
        ref={nodeRef}
        style={{
          ...nodeStyle,
          position: 'relative', // Muda de absolute para relative
          left: 0,
          top: 0,
          pointerEvents: 'auto',
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
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

      {/* 🎯 HOOKS DE CONEXÃO - nas 4 direções principais */}
      {(isSelected || isHovered) && getVisibleHooks(node).map((hook) => {
        const hookPos = getHookPosition(node, hook.direction, hook.offset);
        const hookColor = HookColorSystem.getInstance().getHookColor(
          node.id,
          false,
          [],
          []
        );
        
        // Posição relativa ao wrapper
        const relativeX = hookPos.x - node.position.x;
        const relativeY = hookPos.y - node.position.y;

        return (
          <div
            key={hook.id}
            style={{
              position: 'absolute',
              left: relativeX - HOOK_SIZE / 2,
              top: relativeY - HOOK_SIZE / 2,
              width: HOOK_SIZE,
              height: HOOK_SIZE,
              backgroundColor: 'white',
              border: `2px solid ${hookColor}`,
              borderRadius: '50%',
              cursor: 'crosshair',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              zIndex: 300,
              pointerEvents: 'auto',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onClick={(e) => {
              e.stopPropagation();
              console.log('🔗 Hook clicado para conexão:', hook.direction, node.id);
              onStartConnection(node.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'scale(1.3)';
              target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.transform = 'scale(1)';
              target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
            }}
            title={`Conectar (${hook.direction})`}
          >
            {/* Indicador de direção */}
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '8px',
                color: hookColor,
                fontWeight: 'bold',
                pointerEvents: 'none',
              }}
            >
              {hook.direction === 'top' && '↑'}
              {hook.direction === 'right' && '→'}
              {hook.direction === 'bottom' && '↓'}
              {hook.direction === 'left' && '←'}
            </div>
          </div>
        );
      })}

      {/* Indicador de fixação - mostra quando o nó está fixo em um container */}
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
          🔒
        </div>
      )}

      {/* Indicador de container - mostra quando o node está preso a um container */}
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
    </div>
  );
}));

FlowchartNode.displayName = 'FlowchartNode';