/**
 * Componente visual para hooks de conexão
 * Renderiza círculos clicáveis nas bordas dos nós para iniciar conexões
 */

import React, { useState } from 'react';
import { HookDirection } from '../types';
import { HOOK_SIZE } from '../utils/hookPositions';

interface ConnectionHookProps {
  id: string;
  x: number;
  y: number;
  direction: HookDirection;
  color: string;
  isActive?: boolean; // Hook está sendo usado em uma conexão
  isHovered?: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
  onMouseEnter?: (e: React.MouseEvent) => void;
  onMouseLeave?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  zoom: number;
}

export const ConnectionHook: React.FC<ConnectionHookProps> = ({
  id,
  x,
  y,
  direction,
  color,
  isActive = false,
  isHovered = false,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
  zoom,
}) => {
  const [localHovered, setLocalHovered] = useState(false);

  const handleMouseEnter = (e: React.MouseEvent) => {
    setLocalHovered(true);
    onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setLocalHovered(false);
    onMouseLeave?.(e);
  };

  const isHighlighted = isHovered || localHovered || isActive;
  const size = isHighlighted ? HOOK_SIZE * 1.3 : HOOK_SIZE;
  const radius = size / 2;

  // Renderiza seta indicando direção
  const renderDirectionIndicator = () => {
    const arrowSize = 6;
    const offset = radius + 4;

    let arrowPath = '';
    let arrowX = x;
    let arrowY = y;

    switch (direction) {
      case 'top':
        arrowX = x;
        arrowY = y - offset;
        arrowPath = `M ${arrowX} ${arrowY} L ${arrowX - arrowSize/2} ${arrowY + arrowSize} L ${arrowX + arrowSize/2} ${arrowY + arrowSize} Z`;
        break;
      case 'right':
        arrowX = x + offset;
        arrowY = y;
        arrowPath = `M ${arrowX} ${arrowY} L ${arrowX - arrowSize} ${arrowY - arrowSize/2} L ${arrowX - arrowSize} ${arrowY + arrowSize/2} Z`;
        break;
      case 'bottom':
        arrowX = x;
        arrowY = y + offset;
        arrowPath = `M ${arrowX} ${arrowY} L ${arrowX - arrowSize/2} ${arrowY - arrowSize} L ${arrowX + arrowSize/2} ${arrowY - arrowSize} Z`;
        break;
      case 'left':
        arrowX = x - offset;
        arrowY = y;
        arrowPath = `M ${arrowX} ${arrowY} L ${arrowX + arrowSize} ${arrowY - arrowSize/2} L ${arrowX + arrowSize} ${arrowY + arrowSize/2} Z`;
        break;
      case 'top-left':
        arrowX = x - offset * 0.7;
        arrowY = y - offset * 0.7;
        arrowPath = `M ${arrowX} ${arrowY} L ${arrowX + arrowSize} ${arrowY} L ${arrowX} ${arrowY + arrowSize} Z`;
        break;
      case 'top-right':
        arrowX = x + offset * 0.7;
        arrowY = y - offset * 0.7;
        arrowPath = `M ${arrowX} ${arrowY} L ${arrowX - arrowSize} ${arrowY} L ${arrowX} ${arrowY + arrowSize} Z`;
        break;
      case 'bottom-left':
        arrowX = x - offset * 0.7;
        arrowY = y + offset * 0.7;
        arrowPath = `M ${arrowX} ${arrowY} L ${arrowX + arrowSize} ${arrowY} L ${arrowX} ${arrowY - arrowSize} Z`;
        break;
      case 'bottom-right':
        arrowX = x + offset * 0.7;
        arrowY = y + offset * 0.7;
        arrowPath = `M ${arrowX} ${arrowY} L ${arrowX - arrowSize} ${arrowY} L ${arrowX} ${arrowY - arrowSize} Z`;
        break;
      default:
        return null;
    }

    return (
      <path
        d={arrowPath}
        fill={color}
        opacity={isHighlighted ? 0.9 : 0.4}
        className="pointer-events-none"
      />
    );
  };

  return (
    <g
      id={id}
      className="connection-hook"
      style={{ cursor: 'crosshair' }}
      onMouseDown={onMouseDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {/* Área de clique aumentada (invisível) */}
      <circle
        cx={x}
        cy={y}
        r={HOOK_SIZE}
        fill="transparent"
        className="pointer-events-auto"
      />
      
      {/* Círculo externo (borda) */}
      <circle
        cx={x}
        cy={y}
        r={radius}
        fill="white"
        stroke={color}
        strokeWidth={isHighlighted ? 3 : 2}
        className="pointer-events-none transition-all duration-200"
        style={{
          filter: isHighlighted ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' : 'none',
        }}
      />

      {/* Círculo interno (preenchimento) */}
      <circle
        cx={x}
        cy={y}
        r={radius - (isHighlighted ? 3 : 2)}
        fill={isActive ? color : 'white'}
        opacity={isActive ? 0.3 : 1}
        className="pointer-events-none transition-all duration-200"
      />

      {/* Indicador de direção (seta) */}
      {isHighlighted && renderDirectionIndicator()}

      {/* Animação de pulso quando ativo */}
      {isActive && (
        <circle
          cx={x}
          cy={y}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={2}
          opacity={0}
          className="pointer-events-none"
        >
          <animate
            attributeName="r"
            from={radius}
            to={radius * 1.5}
            dur="1s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            from={0.6}
            to={0}
            dur="1s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
};
