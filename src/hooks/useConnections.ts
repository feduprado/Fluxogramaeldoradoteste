import { useState, useCallback } from 'react';
import { Connection } from '../types';

export const useConnections = (initialConnections: Connection[] = []) => {
  const [connections, setConnections] = useState<Connection[]>(initialConnections);

  const addConnection = useCallback((
    fromNodeId: string,
    toNodeId: string,
    label?: string
  ) => {
    const newConnection: Connection = {
      id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      fromNodeId,
      toNodeId,
      label
    };
    setConnections(prev => [...prev, newConnection]);
    return newConnection;
  }, []);

  const removeConnection = useCallback((connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
  }, []);

  const removeConnections = useCallback((connectionIds: string[]) => {
    setConnections(prev => prev.filter(c => !connectionIds.includes(c.id)));
  }, []);

  const removeConnectionsForNode = useCallback((nodeId: string) => {
    setConnections(prev => prev.filter(
      c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId
    ));
  }, []);

  const removeConnectionsForNodes = useCallback((nodeIds: string[]) => {
    setConnections(prev => prev.filter(
      c => !nodeIds.includes(c.fromNodeId) && !nodeIds.includes(c.toNodeId)
    ));
  }, []);

  const updateConnection = useCallback((
    connectionId: string,
    updates: Partial<Connection>
  ) => {
    setConnections(prev => prev.map(conn =>
      conn.id === connectionId ? { ...conn, ...updates } : conn
    ));
  }, []);

  const updateConnectionLabel = useCallback((connectionId: string, label: string) => {
    setConnections(prev => prev.map(conn =>
      conn.id === connectionId ? { ...conn, label } : conn
    ));
  }, []);

  const getConnection = useCallback((connectionId: string) => {
    return connections.find(c => c.id === connectionId);
  }, [connections]);

  const getConnectionsFromNode = useCallback((nodeId: string) => {
    return connections.filter(c => c.fromNodeId === nodeId);
  }, [connections]);

  const getConnectionsToNode = useCallback((nodeId: string) => {
    return connections.filter(c => c.toNodeId === nodeId);
  }, [connections]);

  const getConnectionsBetween = useCallback((fromNodeId: string, toNodeId: string) => {
    return connections.filter(c => 
      c.fromNodeId === fromNodeId && c.toNodeId === toNodeId
    );
  }, [connections]);

  const hasConnection = useCallback((fromNodeId: string, toNodeId: string) => {
    return connections.some(c => 
      c.fromNodeId === fromNodeId && c.toNodeId === toNodeId
    );
  }, [connections]);

  const clearConnections = useCallback(() => {
    setConnections([]);
  }, []);

  return {
    connections,
    setConnections,
    addConnection,
    removeConnection,
    removeConnections,
    removeConnectionsForNode,
    removeConnectionsForNodes,
    updateConnection,
    updateConnectionLabel,
    getConnection,
    getConnectionsFromNode,
    getConnectionsToNode,
    getConnectionsBetween,
    hasConnection,
    clearConnections
  };
};
