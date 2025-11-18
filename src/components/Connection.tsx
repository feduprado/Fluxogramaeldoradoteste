import React from 'react';
import { Connection, FlowNode, ConnectionVariant } from '../types';

interface ConnectionProps {
  connection: Connection;
  fromNode: FlowNode;
  toNode: FlowNode;
  isSelected?: boolean;
  onSelect?: (connectionId: string) => void;
  onToggleLabel?: (connectionId: string) => void;
}

const VARIANT_STYLES: Record<ConnectionVariant, {
  stroke: string;
  background: string;
  text: string;
  border: string;
}> = {
  positive: {
    stroke: '#10B981',
    background: 'rgba(16, 185, 129, 0.22)',
    text: '#064E3B',
    border: 'rgba(16, 185, 129, 0.5)',
  },
  negative: {
    stroke: '#EF4444',
    background: 'rgba(239, 68, 68, 0.22)',
    text: '#7F1D1D',
    border: 'rgba(239, 68, 68, 0.45)',
  },
  neutral: {
    stroke: '#4B5563',
    background: 'rgba(107, 114, 128, 0.18)',
    text: '#1F2937',
    border: 'rgba(75, 85, 99, 0.4)',
  },
};

const defaultLabelForVariant = (variant: ConnectionVariant) => {
  if (variant === 'positive') return 'Sim';
  if (variant === 'negative') return 'Não';
  return undefined;
};

export const Connection: React.FC<ConnectionProps> = ({
  connection,
  fromNode,
  toNode,
  isSelected = false,
  onSelect,
  onToggleLabel,
}) => {
  const calculateConnectionPath = () => {
    const startX = fromNode.position.x + fromNode.width / 2;
    const startY = fromNode.position.y + fromNode.height / 2;
    const endX = toNode.position.x + toNode.width / 2;
    const endY = toNode.position.y + toNode.height / 2;

    const dx = endX - startX;
    const dy = endY - startY;

    const controlX1 = startX + dx * 0.5;
    const controlY1 = startY;
    const controlX2 = startX + dx * 0.5;
    const controlY2 = endY;

    return {
      path: `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`,
      points: {
        startX,
        startY,
        controlX1,
        controlY1,
        controlX2,
        controlY2,
        endX,
        endY,
      },
    };
  };

  const { path, points } = calculateConnectionPath();

  const getPointOnCurve = (t: number) => {
    const invT = 1 - t;
    const x = invT ** 3 * points.startX +
      3 * invT ** 2 * t * points.controlX1 +
      3 * invT * t ** 2 * points.controlX2 +
      t ** 3 * points.endX;
    const y = invT ** 3 * points.startY +
      3 * invT ** 2 * t * points.controlY1 +
      3 * invT * t ** 2 * points.controlY2 +
      t ** 3 * points.endY;
    return { x, y };
  };

  const labelPosition = getPointOnCurve(0.5);
  const variant: ConnectionVariant = connection.variant || 'neutral';
  const colors = VARIANT_STYLES[variant];
  const labelText = connection.label || defaultLabelForVariant(variant);
  const labelWidth = labelText ? Math.max(36, labelText.length * 7 + 14) : 0;
  const labelHeight = 22;

  return (
    <>
      {/* Camada invisível mais grossa para facilitar clique */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth="12"
        fill="none"
        style={{
          pointerEvents: 'stroke',
          cursor: onToggleLabel ? 'pointer' : 'default'
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onToggleLabel) {
            onToggleLabel(connection.id);
          }
          if (onSelect) {
            onSelect(connection.id);
          }
        }}
        title="Clique para alternar o rótulo (Sim/Não/Neutro)"
      />

      {/* Conexão visual */}
      <path
        d={path}
        stroke={isSelected ? '#3B82F6' : colors.stroke}
        strokeWidth={isSelected ? '3' : '2'}
        fill="none"
        markerEnd="url(#arrowhead)"
        style={{ pointerEvents: 'none' }}
      />

      {labelText && (
        <g style={{ pointerEvents: 'none' }}>
          <rect
            x={labelPosition.x - labelWidth / 2}
            y={labelPosition.y - labelHeight / 2}
            width={labelWidth}
            height={labelHeight}
            rx={labelHeight / 2}
            fill={colors.background}
            stroke={colors.border}
            strokeWidth={1}
          />
          <text
            x={labelPosition.x}
            y={labelPosition.y + 4}
            fontSize={12}
            fontWeight={600}
            fill={colors.text}
            textAnchor="middle"
          >
            {labelText}
          </text>
        </g>
      )}
    </>
  );
};