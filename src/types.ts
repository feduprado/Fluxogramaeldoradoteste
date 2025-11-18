export type NodeType = 'start' | 'process' | 'decision' | 'end';

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  text: string;
  width: number;
  height: number;
}

export type ConnectionVariant = 'positive' | 'negative' | 'neutral';

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: string;
  variant?: ConnectionVariant;
}

export interface FlowchartState {
  nodes: FlowNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  temporaryConnection: { fromNodeId: string; x: number; y: number } | null;
  zoom: number;
  pan: { x: number; y: number };
}

export interface AIParsedFlow {
  nodes: FlowNode[];
  connections: Connection[];
}