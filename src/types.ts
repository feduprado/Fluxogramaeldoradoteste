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
export type FlowchartOperationType =
  | 'ADD_NODE'
  | 'MOVE_NODE'
  | 'DELETE_NODE'
  | 'UPDATE_NODE'
  | 'SYNC_FLOW';

export interface FlowchartOperation {
  type: FlowchartOperationType;
  node?: FlowNode;
  nodeId?: string;
  position?: { x: number; y: number };
  patch?: Partial<FlowNode>;
  flow?: { nodes: FlowNode[]; connections: Connection[] };
}

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  avatar?: string;
  cursorPosition?: { x: number; y: number };
  selectedNodeId?: string | null;
  lastSeen?: number;
}

export interface PerformanceComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  maintainability: number;
}

export interface Bottleneck {
  nodeId: string;
  type: 'decision' | 'process' | 'connection';
  issue: string;
  severity: 'low' | 'medium' | 'high';
  impact: string;
  suggestedFix: string;
}

export interface OptimizationSuggestion {
  id: string;
  type: 'refactor' | 'simplify' | 'restructure';
  description: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  expectedImpact: 'low' | 'medium' | 'high';
  steps: string[];
}

export interface PerformanceMetrics {
  complexity: PerformanceComplexityMetrics;
  bottlenecks: Bottleneck[];
  optimizationSuggestions: OptimizationSuggestion[];
  performanceScore: number;
}

export interface Suggestion {
  id: string;
  type: 'shortcut' | 'template' | 'feature' | 'optimization';
  title: string;
  description: string;
  reason: string;
  priority: 'low' | 'medium' | 'high';
  action: string;
}

export interface AdaptiveUIChanges {
  showTutorials?: boolean;
  simplifiedToolbar?: boolean;
  contextHelp?: boolean;
  advancedFeatures?: boolean;
  expertShortcuts?: boolean;
}

export interface ActionContext {
  [key: string]: unknown;
}

export interface UserAction {
  type: string;
  timestamp: number;
  duration?: number;
  context?: ActionContext;
  success?: boolean;
}
