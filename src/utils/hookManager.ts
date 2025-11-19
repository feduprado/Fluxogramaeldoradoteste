import { ConnectionHook, HookDirection, FlowNode } from '../types';

export const HOOK_SIZE = 12; // Tamanho do hook (raio do círculo)
export const HOOK_SPACING = 30; // Espaçamento mínimo entre hooks

// 🆕 Gera hooks padrão para um nó (1 hook por direção principal)
export function getDefaultNodeHooks(nodeId: string): ConnectionHook[] {
  return [
    { id: `${nodeId}-hook-top-0`, direction: 'top', offset: 0.5, isVisible: true },
    { id: `${nodeId}-hook-right-0`, direction: 'right', offset: 0.5, isVisible: true },
    { id: `${nodeId}-hook-bottom-0`, direction: 'bottom', offset: 0.5, isVisible: true },
    { id: `${nodeId}-hook-left-0`, direction: 'left', offset: 0.5, isVisible: true },
  ];
}

// 🆕 Adiciona um novo hook em uma direção específica
export function addHook(
  node: FlowNode,
  direction: HookDirection,
  offset?: number
): ConnectionHook[] {
  const currentHooks = node.hooks || getDefaultNodeHooks(node.id);
  
  // Filtra hooks da mesma direção para calcular próximo index
  const hooksInDirection = currentHooks.filter(h => h.direction === direction);
  const nextIndex = hooksInDirection.length;
  
  // Calcula offset automático se não fornecido
  const calculatedOffset = offset ?? calculateAutoOffset(hooksInDirection.length + 1, nextIndex);
  
  const newHook: ConnectionHook = {
    id: `${node.id}-hook-${direction}-${nextIndex}`,
    direction,
    offset: calculatedOffset,
    isVisible: true,
  };
  
  return [...currentHooks, newHook];
}

// 🆕 Remove um hook específico
export function removeHook(node: FlowNode, hookId: string): ConnectionHook[] {
  const currentHooks = node.hooks || getDefaultNodeHooks(node.id);
  return currentHooks.filter(h => h.id !== hookId);
}

// 🆕 Calcula offset automático para distribuir hooks uniformemente
function calculateAutoOffset(totalHooks: number, index: number): number {
  if (totalHooks === 1) return 0.5;
  
  // Distribui uniformemente entre 0.15 e 0.85
  const minOffset = 0.15;
  const maxOffset = 0.85;
  const range = maxOffset - minOffset;
  
  return minOffset + (range * index) / (totalHooks - 1);
}

// 🆕 Redistribui hooks de uma direção uniformemente
export function redistributeHooks(
  node: FlowNode,
  direction: HookDirection
): ConnectionHook[] {
  const currentHooks = node.hooks || getDefaultNodeHooks(node.id);
  
  const hooksInDirection = currentHooks.filter(h => h.direction === direction);
  const otherHooks = currentHooks.filter(h => h.direction !== direction);
  
  // Redistribui offsets
  const redistributed = hooksInDirection.map((hook, index) => ({
    ...hook,
    offset: calculateAutoOffset(hooksInDirection.length, index),
  }));
  
  return [...otherHooks, ...redistributed];
}

// 🆕 Calcula posição de um hook no canvas
export function getHookPosition(
  node: FlowNode,
  direction: HookDirection,
  offset: number = 0.5
): { x: number; y: number } {
  const { x, y } = node.position;
  const { width, height } = node;
  
  switch (direction) {
    case 'top':
      return { x: x + width * offset, y: y };
    case 'right':
      return { x: x + width, y: y + height * offset };
    case 'bottom':
      return { x: x + width * offset, y: y + height };
    case 'left':
      return { x: x, y: y + height * offset };
    case 'top-left':
      return { x: x + width * 0.25, y: y };
    case 'top-right':
      return { x: x + width * 0.75, y: y };
    case 'bottom-left':
      return { x: x + width * 0.25, y: y + height };
    case 'bottom-right':
      return { x: x + width * 0.75, y: y + height };
    default:
      return { x: x + width / 2, y: y + height / 2 };
  }
}

// 🆕 Encontra o hook mais próximo de uma posição
export function findNearestHook(
  node: FlowNode,
  position: { x: number; y: number },
  maxDistance: number = 30
): ConnectionHook | null {
  const hooks = node.hooks || getDefaultNodeHooks(node.id);
  
  let nearestHook: ConnectionHook | null = null;
  let minDistance = maxDistance;
  
  hooks.forEach(hook => {
    const hookPos = getHookPosition(node, hook.direction, hook.offset);
    const distance = Math.sqrt(
      Math.pow(hookPos.x - position.x, 2) + Math.pow(hookPos.y - position.y, 2)
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearestHook = hook;
    }
  });
  
  return nearestHook;
}

// 🆕 Valida se um hook pode ser adicionado em uma direção
export function canAddHook(node: FlowNode, direction: HookDirection): boolean {
  const currentHooks = node.hooks || getDefaultNodeHooks(node.id);
  const hooksInDirection = currentHooks.filter(h => h.direction === direction);
  
  // Limita a 5 hooks por direção para evitar sobreposição
  const MAX_HOOKS_PER_DIRECTION = 5;
  return hooksInDirection.length < MAX_HOOKS_PER_DIRECTION;
}

// 🆕 Obtém hooks visíveis de um nó
export function getVisibleHooks(node: FlowNode): ConnectionHook[] {
  const hooks = node.hooks || getDefaultNodeHooks(node.id);
  return hooks.filter(h => h.isVisible !== false);
}
