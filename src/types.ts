export type NodeType = 'start' | 'process' | 'decision' | 'end';

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  text: string;
  width: number;
  height: number;
}

export interface Connection {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: 'Sim' | 'Não' | string;
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

export interface Point {
  x: number;
  y: number;
}

export interface AISuggestion {
  type: 'optimization' | 'warning' | 'improvement';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

export interface AIAnalysis {
  complexity: 'baixa' | 'média' | 'alta';
  suggestions: AISuggestion[];
  estimatedTime?: string;
  potentialIssues?: string[];
}

export interface ValidationIssue {
  type: 'warning' | 'error';
  message: string;
  elementId: string;
  severity: 'low' | 'medium' | 'high';
}

export interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  score: number;
}

export type ExportFormat = 'json' | 'svg' | 'markdown' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeDocumentation?: boolean;
}

export interface Documentation {
  content: string;
  generatedAt: string;
  version: string;
}

export interface ExportResult {
  blob: Blob;
  filename: string;
  type: ExportFormat;
  documentation?: Documentation;
}

export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
  complexity: 'Baixa' | 'Média' | 'Alta';
}

export interface TemplateCategory {
  id: string;
  name: string;
  templates: TemplateInfo[];
}