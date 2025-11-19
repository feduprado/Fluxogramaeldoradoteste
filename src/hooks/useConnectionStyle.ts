import { useState, useCallback } from 'react';
import { Connection, ConnectionStyle } from '../types';

export const useConnectionStyle = () => {
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectionStyle, setConnectionStyle] = useState<ConnectionStyle>({
    type: 'elbow',
    color: '#3B82F6',
    strokeWidth: 2,
    dashed: false,
    curvature: 0.5
  });

  const updateConnectionStyle = useCallback((updates: Partial<ConnectionStyle>) => {
    setConnectionStyle(prev => ({ ...prev, ...updates }));
  }, []);

  const applyStyleToConnection = useCallback((
    connections: Connection[], 
    connectionId: string, 
    style: Partial<ConnectionStyle>
  ): Connection[] => {
    return connections.map(conn => 
      conn.id === connectionId 
        ? { ...conn, style: { ...conn.style, ...style } as ConnectionStyle }
        : conn
    );
  }, []);

  const applyStyleToAllConnections = useCallback((
    connections: Connection[], 
    style: Partial<ConnectionStyle>
  ): Connection[] => {
    return connections.map(conn => ({ 
      ...conn, 
      style: { ...conn.style, ...style } as ConnectionStyle
    }));
  }, []);

  const updateConnectionPoints = useCallback((
    connections: Connection[], 
    connectionId: string, 
    points: { x: number; y: number }[]
  ): Connection[] => {
    return connections.map(conn => 
      conn.id === connectionId 
        ? { ...conn, points } 
        : conn
    );
  }, []);

  const selectConnection = useCallback((connectionId: string | null) => {
    setSelectedConnectionId(connectionId);
  }, []);

  const getSelectedConnection = useCallback((connections: Connection[]) => {
    return connections.find(conn => conn.id === selectedConnectionId) || null;
  }, [selectedConnectionId]);

  return {
    selectedConnectionId,
    connectionStyle,
    updateConnectionStyle,
    applyStyleToConnection,
    applyStyleToAllConnections,
    updateConnectionPoints,
    selectConnection,
    getSelectedConnection,
    setConnectionStyle,
  };
};
