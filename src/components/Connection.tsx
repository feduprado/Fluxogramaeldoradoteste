import React from 'react';
import { Connection, FlowNode } from '../types';

interface ConnectionProps {
  connection: Connection;
  fromNode: FlowNode;
  toNode: FlowNode;
  isSelected?: boolean;
  onSelect?: (connectionId: string) => void;
}

export const Connection: React.FC<ConnectionProps> = ({ 
  connection, 
  fromNode, 
  toNode,
  isSelected = false,
  onSelect
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

    return `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
  };

  const path = calculateConnectionPath();

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
          cursor: 'pointer'
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onSelect) {
            onSelect(connection.id);
          }
        }}
      />
      
      {/* Conexão visual */}
      <path
        d={path}
        stroke={isSelected ? '#3B82F6' : '#4B5563'}
        strokeWidth={isSelected ? '3' : '2'}
        fill="none"
        markerEnd="url(#arrowhead)"
        style={{ pointerEvents: 'none' }}
      />
    </>
  );
};