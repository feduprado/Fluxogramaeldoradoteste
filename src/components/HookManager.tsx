import React from 'react';
import { Plus, Minus, RotateCw } from 'lucide-react';
import { FlowNode, HookDirection } from '../types';
import { getVisibleHooks, canAddHook } from '../utils/hookManager';

interface HookManagerProps {
  node: FlowNode;
  onAddHook: (nodeId: string, direction: HookDirection) => void;
  onRemoveHook: (nodeId: string, hookId: string) => void;
  onRedistributeHooks: (nodeId: string, direction: HookDirection) => void;
}

export const HookManager: React.FC<HookManagerProps> = React.memo(({
  node,
  onAddHook,
  onRemoveHook,
  onRedistributeHooks,
}) => {
  const hooks = getVisibleHooks(node);
  
  // Agrupa hooks por direção
  const hooksByDirection: Record<string, typeof hooks> = {
    top: hooks.filter(h => h.direction === 'top'),
    right: hooks.filter(h => h.direction === 'right'),
    bottom: hooks.filter(h => h.direction === 'bottom'),
    left: hooks.filter(h => h.direction === 'left'),
  };

  const renderDirectionControls = (direction: HookDirection, position: React.CSSProperties) => {
    const hooksInDirection = hooksByDirection[direction] || [];
    const canAdd = canAddHook(node, direction);

    return (
      <div
        style={{
          position: 'absolute',
          ...position,
          display: 'flex',
          flexDirection: direction === 'top' || direction === 'bottom' ? 'column' : 'row',
          gap: '4px',
          zIndex: 400,
          pointerEvents: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Botão adicionar hook */}
        {canAdd && (
          <button
            onClick={() => onAddHook(node.id, direction)}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#10B981',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={`Adicionar hook ${direction}`}
          >
            <Plus className="w-3 h-3" color="white" />
          </button>
        )}

        {/* Contador de hooks */}
        {hooksInDirection.length > 1 && (
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#3B82F6',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              fontWeight: 'bold',
              color: 'white',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
            }}
            title={`${hooksInDirection.length} hooks em ${direction}`}
          >
            {hooksInDirection.length}
          </div>
        )}

        {/* Botão redistribuir (se mais de 2 hooks) */}
        {hooksInDirection.length >= 2 && (
          <button
            onClick={() => onRedistributeHooks(node.id, direction)}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#F59E0B',
              border: '2px solid white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={`Redistribuir ${hooksInDirection.length} hooks`}
          >
            <RotateCw className="w-2.5 h-2.5" color="white" />
          </button>
        )}
      </div>
    );
  };

  const halfWidth = node.width / 2;
  const halfHeight = node.height / 2;

  return (
    <>
      {/* Top */}
      {renderDirectionControls('top', {
        top: '-40px',
        left: `${halfWidth - 12}px`,
      })}

      {/* Right */}
      {renderDirectionControls('right', {
        right: '-80px',
        top: `${halfHeight - 12}px`,
      })}

      {/* Bottom */}
      {renderDirectionControls('bottom', {
        bottom: '-40px',
        left: `${halfWidth - 12}px`,
      })}

      {/* Left */}
      {renderDirectionControls('left', {
        left: '-80px',
        top: `${halfHeight - 12}px`,
      })}
    </>
  );
}, (prevProps, nextProps) => {
  // Só re-renderiza se o node.id, node.width, node.height ou hooks mudarem
  return (
    prevProps.node.id === nextProps.node.id &&
    prevProps.node.width === nextProps.node.width &&
    prevProps.node.height === nextProps.node.height &&
    JSON.stringify(prevProps.node.hooks) === JSON.stringify(nextProps.node.hooks)
  );
});