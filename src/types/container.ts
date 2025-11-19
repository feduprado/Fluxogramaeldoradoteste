export interface Container {
  id: string;
  type: 'swimlane' | 'module' | 'layer' | 'scenario';
  name: string; // Nome editável do container
  title: string; // Título exibido (pode ser sincronizado com name)
  position: { x: number; y: number };
  size: { width: number; height: number };
  color: string;
  nodes: string[]; // IDs dos nós contidos
  children: string[]; // IDs dos containers filhos
  parentId: string | null; // ID do container pai (para nesting)
  isCollapsed: boolean;
  isLocked: boolean; // Se está bloqueado (nós não podem sair)
  zIndex: number;
}

// Cores padrão para cada tipo de container
export const CONTAINER_COLORS = {
  swimlane: '#E3F2FD', // Azul claro
  module: '#E8F5E9',   // Verde claro
  layer: '#FFF3E0',    // Laranja claro
  scenario: '#F3E5F5'  // Roxo claro
};

export const CONTAINER_BORDER_COLORS = {
  swimlane: '#2196F3', // Azul
  module: '#4CAF50',   // Verde
  layer: '#FF9800',    // Laranja
  scenario: '#9C27B0'  // Roxo
};