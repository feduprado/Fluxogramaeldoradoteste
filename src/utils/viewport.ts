import { FlowNode } from '../types';

export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Verifica se um nó está visível no viewport
 */
export const isNodeInViewport = (
  node: FlowNode,
  pan: { x: number; y: number },
  zoom: number,
  viewport: Viewport
): boolean => {
  // Calcular posição do nó no viewport transformado
  const nodeScreenX = (node.position.x * zoom) + pan.x;
  const nodeScreenY = (node.position.y * zoom) + pan.y;
  const nodeScreenWidth = node.width * zoom;
  const nodeScreenHeight = node.height * zoom;

  // Verificar se o nó está dentro do viewport (com margem de segurança)
  const margin = 100; // pixels de margem
  
  return (
    nodeScreenX + nodeScreenWidth >= -margin &&
    nodeScreenX <= viewport.width + margin &&
    nodeScreenY + nodeScreenHeight >= -margin &&
    nodeScreenY <= viewport.height + margin
  );
};

/**
 * Calcula o bounding box de um conjunto de nós
 */
export const calculateBoundingBox = (nodes: FlowNode[]): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} => {
  if (nodes.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: 0,
      maxY: 0,
      width: 0,
      height: 0,
      centerX: 0,
      centerY: 0
    };
  }

  const minX = Math.min(...nodes.map(n => n.position.x));
  const minY = Math.min(...nodes.map(n => n.position.y));
  const maxX = Math.max(...nodes.map(n => n.position.x + n.width));
  const maxY = Math.max(...nodes.map(n => n.position.y + n.height));

  const width = maxX - minX;
  const height = maxY - minY;
  const centerX = minX + width / 2;
  const centerY = minY + height / 2;

  return { minX, minY, maxX, maxY, width, height, centerX, centerY };
};

/**
 * Centraliza a view em um conjunto de nós
 */
export const centerViewOnNodes = (
  nodes: FlowNode[],
  canvasWidth: number,
  canvasHeight: number,
  zoom: number = 1
): { pan: { x: number; y: number }; zoom: number } => {
  if (nodes.length === 0) {
    return { pan: { x: 0, y: 0 }, zoom: 1 };
  }

  const bbox = calculateBoundingBox(nodes);
  
  // Calcular zoom ideal para caber todos os nós
  const padding = 50; // pixels de padding
  const zoomX = (canvasWidth - padding * 2) / bbox.width;
  const zoomY = (canvasHeight - padding * 2) / bbox.height;
  const idealZoom = Math.min(zoomX, zoomY, 1); // Não fazer zoom maior que 1

  // Calcular pan para centralizar
  const pan = {
    x: (canvasWidth / 2) - (bbox.centerX * idealZoom),
    y: (canvasHeight / 2) - (bbox.centerY * idealZoom)
  };

  return { pan, zoom: idealZoom };
};

/**
 * Filtra nós visíveis no viewport (para virtualização)
 */
export const getVisibleNodes = (
  nodes: FlowNode[],
  pan: { x: number; y: number },
  zoom: number,
  viewport: Viewport
): FlowNode[] => {
  return nodes.filter(node => isNodeInViewport(node, pan, zoom, viewport));
};

/**
 * Calcula a viewport a partir de um container
 */
export const getViewportFromElement = (element: HTMLElement | null): Viewport => {
  if (!element) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height
  };
};
