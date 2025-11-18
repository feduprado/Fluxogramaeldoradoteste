import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ADVANCED_FEATURES } from '../config/advanced';
import { Connection, FlowNode, CollaborationUser, FlowchartOperation } from '../types';
import {
  CollaborationService,
  CollaborationStateMessage,
} from '../services/collaborationService';

interface UseCollaborationOptions {
  roomId: string;
  flowSnapshot: { nodes: FlowNode[]; connections: Connection[] };
  selectedNodeId: string | null;
  onRemoteState?: (state: { nodes: FlowNode[]; connections: Connection[] }) => void;
}

const getFingerprint = (nodes: FlowNode[], connections: Connection[]) =>
  JSON.stringify({ n: nodes.map(node => ({ id: node.id, x: node.position.x, y: node.position.y, t: node.type })), c: connections.length });

export const useCollaboration = ({
  roomId,
  flowSnapshot,
  selectedNodeId,
  onRemoteState,
}: UseCollaborationOptions) => {
  const [collaborators, setCollaborators] = useState<CollaborationUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const serviceRef = useRef<CollaborationService | null>(null);
  const featureEnabled = ADVANCED_FEATURES.collaboration.enabled;
  const suppressBroadcastRef = useRef(false);

  useEffect(() => {
    if (!featureEnabled) {
      return;
    }

    const service = new CollaborationService(roomId, ADVANCED_FEATURES.collaboration.reconnectAttempts);
    service.onUsersUpdate = users => setCollaborators(users);
    service.onRemoteState = (message: CollaborationStateMessage) => {
      suppressBroadcastRef.current = true;
      onRemoteState?.({ nodes: message.nodes, connections: message.connections });
      setTimeout(() => {
        suppressBroadcastRef.current = false;
      }, 100);
    };

    serviceRef.current = service;
    service
      .connect()
      .then(connected => setIsConnected(Boolean(connected)))
      .catch(() => setIsConnected(false));

    return () => {
      service.disconnect();
      setIsConnected(false);
    };
  }, [featureEnabled, onRemoteState, roomId]);

  const fingerprint = useMemo(
    () => getFingerprint(flowSnapshot.nodes, flowSnapshot.connections),
    [flowSnapshot.connections, flowSnapshot.nodes]
  );

  useEffect(() => {
    if (!featureEnabled || !isConnected || suppressBroadcastRef.current) {
      return;
    }

    serviceRef.current?.sendState({
      nodes: flowSnapshot.nodes,
      connections: flowSnapshot.connections,
      updatedAt: Date.now(),
    });
  }, [featureEnabled, fingerprint, isConnected, flowSnapshot.connections, flowSnapshot.nodes]);

  useEffect(() => {
    if (!featureEnabled || !isConnected) {
      return;
    }
    serviceRef.current?.sendSelection(selectedNodeId);
  }, [featureEnabled, isConnected, selectedNodeId]);

  useEffect(() => {
    if (!featureEnabled || !isConnected) {
      return;
    }

    const handlePointerMove = (event: PointerEvent) => {
      serviceRef.current?.sendCursor({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('pointermove', handlePointerMove);
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [featureEnabled, isConnected]);

  const sendOperation = useCallback((operation: FlowchartOperation) => {
    if (!featureEnabled) {
      return;
    }
    serviceRef.current?.sendOperation(operation);
  }, [featureEnabled]);

  return {
    collaborators,
    isConnected: isConnected && featureEnabled,
    featureEnabled,
    roomId,
    sendOperation,
  };
};
