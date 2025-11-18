import { Connection, ConnectionVariant, FlowNode, NodeType } from '../types';

export interface FlowchartDataPayload {
  nodes: FlowNode[];
  connections: Connection[];
}

const NODE_DEFAULT_TEXT: Record<NodeType, string> = {
  start: 'Início',
  process: 'Processo',
  decision: 'Decisão',
  end: 'Fim',
};

const NODE_DEFAULT_SIZE: Record<NodeType, { width: number; height: number }> = {
  start: { width: 120, height: 120 },
  process: { width: 140, height: 80 },
  decision: { width: 120, height: 120 },
  end: { width: 120, height: 120 },
};

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isNodeType = (type: unknown): type is NodeType =>
  type === 'start' || type === 'process' || type === 'decision' || type === 'end';

const isConnectionVariant = (variant: unknown): variant is ConnectionVariant =>
  variant === 'positive' || variant === 'negative' || variant === 'neutral';

const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const sanitizePosition = (value: any) => ({
  x: isFiniteNumber(value?.x) ? value.x : 0,
  y: isFiniteNumber(value?.y) ? value.y : 0,
});

const sanitizeText = (value: any, fallback: string) => {
  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }

  return trimmed.slice(0, 280);
};

const sanitizeNode = (node: any): FlowNode => {
  const type = isNodeType(node?.type) ? node.type : 'process';
  const defaultSize = NODE_DEFAULT_SIZE[type];

  const width = isFiniteNumber(node?.width)
    ? clamp(node.width, 60, 600)
    : defaultSize.width;
  const height = isFiniteNumber(node?.height)
    ? clamp(node.height, 60, 600)
    : defaultSize.height;

  return {
    id: typeof node?.id === 'string' && node.id.trim() ? node.id.trim() : generateId('node'),
    type,
    position: sanitizePosition(node?.position),
    text: sanitizeText(node?.text, NODE_DEFAULT_TEXT[type]),
    width,
    height,
  };
};

const sanitizeConnection = (connection: any, validNodeIds: Set<string>): Connection | null => {
  const fromNodeId = typeof connection?.fromNodeId === 'string' ? connection.fromNodeId : '';
  const toNodeId = typeof connection?.toNodeId === 'string' ? connection.toNodeId : '';

  if (!validNodeIds.has(fromNodeId) || !validNodeIds.has(toNodeId) || fromNodeId === toNodeId) {
    return null;
  }

  const sanitized: Connection = {
    id: typeof connection?.id === 'string' && connection.id.trim()
      ? connection.id.trim()
      : generateId('conn'),
    fromNodeId,
    toNodeId,
  };

  if (typeof connection?.label === 'string' && connection.label.trim()) {
    sanitized.label = connection.label.trim().slice(0, 80);
  }

  if (isConnectionVariant(connection?.variant)) {
    sanitized.variant = connection.variant;
  }

  return sanitized;
};

export const validateFlowchartData = (data: unknown): data is FlowchartDataPayload => {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const maybeData = data as Partial<FlowchartDataPayload>;
  return Array.isArray(maybeData.nodes) && Array.isArray(maybeData.connections);
};

export const sanitizeFlowchartData = (data: FlowchartDataPayload): FlowchartDataPayload => {
  const nodes = data.nodes.map(sanitizeNode);
  const nodeIds = new Set(nodes.map(node => node.id));
  const connections: Connection[] = [];

  data.connections.forEach(connection => {
    const sanitized = sanitizeConnection(connection, nodeIds);
    if (sanitized) {
      connections.push(sanitized);
    }
  });

  return { nodes, connections };
};

export const ensureFlowchartData = (data: unknown): FlowchartDataPayload | null => {
  if (!validateFlowchartData(data)) {
    return null;
  }

  return sanitizeFlowchartData(data);
};
