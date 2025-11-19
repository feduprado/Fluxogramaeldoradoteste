export type NodeType = 'start' | 'process' | 'decision' | 'end';

// 🆕 Direções possíveis para hooks de conexão
export type HookDirection = 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// 🆕 Interface para hooks de conexão customizáveis
export interface ConnectionHook {
  id: string;
  direction: HookDirection;
  offset?: number; // Offset ao longo da borda (0-1)
  isVisible?: boolean; // Se deve ser renderizado
  color?: string; // Cor personalizada do hook
  size?: number; // Tamanho do hook em pixels
  style?: 'solid' | 'dashed' | 'gradient'; // Estilo visual do hook
  tooltip?: string; // Texto exibido ao passar o mouse
  arrowMode?: 'incoming' | 'outgoing' | 'bidirectional'; // Orientação da seta
}

import { Container } from './types/container';

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  text: string;
  width: number;
  height: number;
  containerId?: string; // ID do container que contém este nó
  isFixed?: boolean; // 🆕 Nó fixo no container (não se move individualmente)
  zIndex?: number; // Z-index para controle de camadas
  isLocked?: boolean; // Nó bloqueado (não pode ser editado/movido)
  hooks?: ConnectionHook[]; // 🆕 Hooks customizáveis do nó
}

export interface ConnectionStyle {
  type: 'straight' | 'curved' | 'elbow';
  curvature?: number; // 0-1 para controlar intensidade da curva
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
}

export interface Connection {
  id: string;
  fromNodeId: string; // Pode ser um node ou container ID
  toNodeId: string;   // Pode ser um node ou container ID
  fromType?: 'node' | 'container'; // Tipo da origem
  toType?: 'node' | 'container';   // Tipo do destino
  label?: string; // Label para conexões (ex: "Sim", "Não")
  style?: ConnectionStyle;
  points?: { x: number; y: number }[]; // Pontos de controle para hooks personalizados
  hooks?: ConnectionHook[]; // 🆕 Hooks de conexão customizáveis
}

export interface FlowchartState {
  nodes: FlowNode[];
  connections: Connection[];
  selectedNodeId: string | null; // 🔄 Mantido por compatibilidade (primeiro nó selecionado)
  selectedNodeIds: string[]; // 🆕 Array de nós selecionados (multi-seleção)
  selectedContainerId: string | null;
  selectedContainerIds: string[]; // 🆕 Array de containers selecionados
  containers: Container[]; // 🆕 Adicionado containers ao state
  temporaryConnection: { fromNodeId: string; x: number; y: number } | null;
  zoom: number;
  pan: { x: number; y: number };
}

export interface AIParsedFlow {
  nodes: FlowNode[];
  connections: Connection[];
  containers?: Container[];
}