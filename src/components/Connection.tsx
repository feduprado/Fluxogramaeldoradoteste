import React from 'react';
import { Connection, FlowNode } from '../types';
import { calculateConnectionLabelPosition } from '../utils/geometry';

interface ConnectionProps {
  connection: Connection;
  fromNode: FlowNode;
  toNode: FlowNode;
  isSelected?: boolean;
  onSelect?: (connectionId: string) => void;
  theme?: 'light' | 'dark';
}

export const Connection: React.FC<ConnectionProps> = ({
  connection,
  fromNode,
  toNode,
  isSelected = false,
  onSelect,
  theme = 'light'
}) => {
  const calculateConnectionPath = () => {
    const startX = fromNode.position.x + fromNode.width / 2;
    const startY = fromNode.position.y + fromNode.height / 2;
    const endX = toNode.position.x + toNode.width / 2;
    const endY = toNode.position.y + toNode.height / 2;

    const dx = endX - startX;
    const controlX = startX + dx * 0.5;

    return `M ${startX} ${startY} Q ${controlX} ${startY - 50} ${endX} ${endY}`;
  };

  const path = calculateConnectionPath();
  const labelPosition = calculateConnectionLabelPosition(fromNode, toNode);

  const getLabelStyles = () => ({
    fontSize: '12px',
    fontWeight: 'bold',
    textAnchor: 'middle' as const,
    dominantBaseline: 'middle' as const,
    pointerEvents: 'none' as const,
    userSelect: 'none' as const,
    fill:
      connection.label === 'Sim'
        ? theme === 'dark'
          ? '#10B981'
          : '#059669'
        : theme === 'dark'
          ? '#EF4444'
          : '#DC2626',
  });

  const getBackgroundRect = () => {
    const label = connection.label ?? '';
    const textWidth = label.length * 7;
    const rectWidth = Math.max(textWidth + 16, 40);
    const rectHeight = 20;

    return {
      x: labelPosition.x - rectWidth / 2,
      y: labelPosition.y - rectHeight / 2,
      width: rectWidth,
      height: rectHeight,
      rx: 10,
      fill:
        theme === 'dark' ? 'rgba(30, 30, 30, 0.9)' : 'rgba(255, 255, 255, 0.9)',
      stroke:
        connection.label === 'Sim'
          ? theme === 'dark'
            ? '#10B981'
            : '#059669'
          : theme === 'dark'
            ? '#EF4444'
            : '#DC2626',
      strokeWidth: 1,
    };
  };

  return (
    <g>
      <path
        d={path}
        stroke="transparent"
        strokeWidth="16"
        fill="none"
        style={{
          pointerEvents: 'stroke',
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(connection.id);
        }}
      />

      <path
        d={path}
        stroke={isSelected ? '#3B82F6' : '#6B7280'}
        strokeWidth={isSelected ? 3 : 2}
        fill="none"
        markerEnd="url(#arrowhead)"
        style={{ pointerEvents: 'none' }}
      />

      {connection.label && (
        <g>
          <rect {...getBackgroundRect()} />
          <text x={labelPosition.x} y={labelPosition.y} style={getLabelStyles()}>
            {connection.label}
          </text>
        </g>
      )}
    </g>
  );
};