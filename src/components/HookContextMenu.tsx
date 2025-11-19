import React, { useEffect } from 'react';
import { ConnectionHook, HookDirection } from '../types';

interface HookContextMenuProps {
  hook: ConnectionHook;
  position: { x: number; y: number };
  onClose: () => void;
  onChange: (updates: Partial<ConnectionHook>) => void;
  onRemove?: () => void;
}

const DIRECTION_OPTIONS: HookDirection[] = [
  'top',
  'right',
  'bottom',
  'left',
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right'
];

export const HookContextMenu: React.FC<HookContextMenuProps> = ({
  hook,
  position,
  onClose,
  onChange,
  onRemove,
}) => {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-hook-context-menu="true"]')) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleOffsetButton = (value: number) => {
    onChange({ offset: value });
  };

  return (
    <div
      data-hook-context-menu="true"
      style={{
        position: 'fixed',
        top: position.y,
        left: position.x,
        background: 'rgba(17, 24, 39, 0.95)',
        border: '1px solid rgba(148, 163, 184, 0.4)',
        borderRadius: '8px',
        padding: '12px',
        color: 'white',
        width: '240px',
        zIndex: 5000,
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.45)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', letterSpacing: '0.05em' }}>
        Configurar Hook
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '10px' }}>
        Cor
        <input
          type="color"
          value={hook.color || '#ffffff'}
          onChange={(e) => onChange({ color: e.target.value })}
          style={{ width: '100%', height: '32px', border: 'none', borderRadius: '6px', padding: 0, background: 'transparent' }}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '10px' }}>
        Tamanho
        <input
          type="range"
          min={8}
          max={28}
          value={hook.size ?? 12}
          onChange={(e) => onChange({ size: Number(e.target.value) })}
        />
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '10px' }}>
        Estilo
        <select
          value={hook.style || 'solid'}
          onChange={(e) => onChange({ style: e.target.value as ConnectionHook['style'] })}
          style={{
            background: '#1f2937',
            borderRadius: '6px',
            border: '1px solid rgba(148,163,184,0.4)',
            padding: '6px 8px',
            color: 'white',
          }}
        >
          <option value="solid">Sólido</option>
          <option value="dashed">Tracejado</option>
          <option value="gradient">Gradiente</option>
        </select>
      </label>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '10px' }}>
        Tooltip
        <input
          type="text"
          value={hook.tooltip || ''}
          onChange={(e) => onChange({ tooltip: e.target.value })}
          placeholder="Texto exibido ao passar o mouse"
          style={{
            background: '#1f2937',
            borderRadius: '6px',
            border: '1px solid rgba(148,163,184,0.4)',
            padding: '6px 8px',
            color: 'white',
          }}
        />
      </label>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '10px' }}>
        <span>Visível</span>
        <input
          type="checkbox"
          checked={hook.isVisible !== false}
          onChange={(e) => onChange({ isVisible: e.target.checked })}
        />
      </div>

      <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '10px' }}>
        Direção
        <select
          value={hook.direction}
          onChange={(e) => onChange({ direction: e.target.value as HookDirection })}
          style={{
            background: '#1f2937',
            borderRadius: '6px',
            border: '1px solid rgba(148,163,184,0.4)',
            padding: '6px 8px',
            color: 'white',
          }}
        >
          {DIRECTION_OPTIONS.map(direction => (
            <option key={direction} value={direction}>
              {direction.toUpperCase()}
            </option>
          ))}
        </select>
      </label>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ fontSize: '12px', marginBottom: '4px' }}>Direção da seta (atalhos A / D / B)</div>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '6px',
              border: hook.arrowMode === 'outgoing' ? '1px solid #3B82F6' : '1px solid transparent',
              background: '#111827',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={() => onChange({ arrowMode: 'outgoing' })}
          >
            →
          </button>
          <button
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '6px',
              border: hook.arrowMode === 'incoming' ? '1px solid #3B82F6' : '1px solid transparent',
              background: '#111827',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={() => onChange({ arrowMode: 'incoming' })}
          >
            ←
          </button>
          <button
            style={{
              flex: 1,
              padding: '6px',
              borderRadius: '6px',
              border: hook.arrowMode === 'bidirectional' ? '1px solid #3B82F6' : '1px solid transparent',
              background: '#111827',
              color: 'white',
              cursor: 'pointer',
            }}
            onClick={() => onChange({ arrowMode: 'bidirectional' })}
          >
            ↔
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '4px', fontSize: '12px' }}>Fixar posição (rápido)</div>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
        {[0.25, 0.5, 0.75].map(value => (
          <button
            key={value}
            style={{
              flex: 1,
              padding: '4px 6px',
              borderRadius: '6px',
              border: hook.offset === value ? '1px solid #3B82F6' : '1px solid rgba(148,163,184,0.4)',
              background: '#111827',
              color: 'white',
              fontSize: '12px',
              cursor: 'pointer',
            }}
            onClick={() => handleOffsetButton(value)}
          >
            {Math.round(value * 100)}%
          </button>
        ))}
      </div>

      <div style={{ fontSize: '11px', color: '#94A3B8' }}>
        Dica: Use Shift durante o arraste para travar em 25%, 50% ou 75%.
      </div>

      {onRemove && (
        <button
          style={{
            marginTop: '10px',
            padding: '6px 8px',
            borderRadius: '6px',
            border: '1px solid #EF4444',
            background: '#111827',
            color: '#EF4444',
            cursor: 'pointer',
            fontSize: '12px',
          }}
          onClick={onRemove}
        >
          Remover Hook
        </button>
      )}
    </div>
  );
};