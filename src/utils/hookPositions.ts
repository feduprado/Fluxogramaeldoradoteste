/**
 * Utilitário para calcular posições de hooks de conexão
 * Hooks ficam FORA dos nós, nas bordas externas
 */

import { HookDirection, FlowNode } from '../types';
import { Container } from '../types/container';

export interface HookPosition {
  x: number;
  y: number;
  direction: HookDirection;
}

// Tamanho padrão do hook (círculo)
export const HOOK_SIZE = 12;
export const HOOK_OFFSET = 8; // Distância do hook em relação à borda do nó

/**
 * Calcula a posição de um hook baseado na direção e no nó
 */
export function getHookPosition(
  node: FlowNode,
  direction: HookDirection,
  offset: number = 0.5 // 0-1 ao longo da borda
): HookPosition {
  const { position, width, height } = node;
  const x = position.x;
  const y = position.y;

  // Normaliza offset entre 0 e 1
  const normalizedOffset = Math.max(0, Math.min(1, offset));

  switch (direction) {
    case 'top':
      return {
        x: x + width * normalizedOffset,
        y: y - HOOK_OFFSET,
        direction,
      };

    case 'right':
      return {
        x: x + width + HOOK_OFFSET,
        y: y + height * normalizedOffset,
        direction,
      };

    case 'bottom':
      return {
        x: x + width * normalizedOffset,
        y: y + height + HOOK_OFFSET,
        direction,
      };

    case 'left':
      return {
        x: x - HOOK_OFFSET,
        y: y + height * normalizedOffset,
        direction,
      };

    case 'top-left':
      return {
        x: x - HOOK_OFFSET / 2,
        y: y - HOOK_OFFSET / 2,
        direction,
      };

    case 'top-right':
      return {
        x: x + width + HOOK_OFFSET / 2,
        y: y - HOOK_OFFSET / 2,
        direction,
      };

    case 'bottom-left':
      return {
        x: x - HOOK_OFFSET / 2,
        y: y + height + HOOK_OFFSET / 2,
        direction,
      };

    case 'bottom-right':
      return {
        x: x + width + HOOK_OFFSET / 2,
        y: y + height + HOOK_OFFSET / 2,
        direction,
      };

    default:
      return {
        x: x + width / 2,
        y: y + height / 2,
        direction: 'top',
      };
  }
}

/**
 * Calcula posição de hook para containers
 */
export function getContainerHookPosition(
  container: Container,
  direction: HookDirection,
  offset: number = 0.5
): HookPosition {
  const { position, size } = container;
  const x = position.x;
  const y = position.y;
  const width = size.width;
  const height = size.height;

  const normalizedOffset = Math.max(0, Math.min(1, offset));

  switch (direction) {
    case 'top':
      return {
        x: x + width * normalizedOffset,
        y: y - HOOK_OFFSET,
        direction,
      };

    case 'right':
      return {
        x: x + width + HOOK_OFFSET,
        y: y + height * normalizedOffset,
        direction,
      };

    case 'bottom':
      return {
        x: x + width * normalizedOffset,
        y: y + height + HOOK_OFFSET,
        direction,
      };

    case 'left':
      return {
        x: x - HOOK_OFFSET,
        y: y + height * normalizedOffset,
        direction,
      };

    case 'top-left':
      return {
        x: x - HOOK_OFFSET,
        y: y - HOOK_OFFSET,
        direction,
      };

    case 'top-right':
      return {
        x: x + width + HOOK_OFFSET,
        y: y - HOOK_OFFSET,
        direction,
      };

    case 'bottom-left':
      return {
        x: x - HOOK_OFFSET,
        y: y + height + HOOK_OFFSET,
        direction,
      };

    case 'bottom-right':
      return {
        x: x + width + HOOK_OFFSET,
        y: y + height + HOOK_OFFSET,
        direction,
      };

    default:
      return {
        x: x + width / 2,
        y: y + height / 2,
        direction: 'top',
      };
  }
}

/**
 * Gera hooks padrão para um nó (4 direções principais)
 */
export function getDefaultNodeHooks(nodeId: string): Array<{
  id: string;
  direction: HookDirection;
  offset: number;
}> {
  return [
    { id: `${nodeId}-hook-top`, direction: 'top', offset: 0.5 },
    { id: `${nodeId}-hook-right`, direction: 'right', offset: 0.5 },
    { id: `${nodeId}-hook-bottom`, direction: 'bottom', offset: 0.5 },
    { id: `${nodeId}-hook-left`, direction: 'left', offset: 0.5 },
  ];
}

/**
 * Gera hooks completos para um nó (8 direções)
 */
export function getFullNodeHooks(nodeId: string): Array<{
  id: string;
  direction: HookDirection;
  offset: number;
}> {
  return [
    { id: `${nodeId}-hook-top`, direction: 'top', offset: 0.5 },
    { id: `${nodeId}-hook-right`, direction: 'right', offset: 0.5 },
    { id: `${nodeId}-hook-bottom`, direction: 'bottom', offset: 0.5 },
    { id: `${nodeId}-hook-left`, direction: 'left', offset: 0.5 },
    { id: `${nodeId}-hook-top-left`, direction: 'top-left', offset: 0 },
    { id: `${nodeId}-hook-top-right`, direction: 'top-right', offset: 0 },
    { id: `${nodeId}-hook-bottom-left`, direction: 'bottom-left', offset: 0 },
    { id: `${nodeId}-hook-bottom-right`, direction: 'bottom-right', offset: 0 },
  ];
}

/**
 * Encontra o hook mais próximo de uma posição (x, y)
 */
export function findNearestHook(
  node: FlowNode,
  targetX: number,
  targetY: number,
  maxDistance: number = 30
): { direction: HookDirection; offset: number } | null {
  const hooks = getFullNodeHooks(node.id);
  let nearestHook: { direction: HookDirection; offset: number; distance: number } | null = null;

  for (const hook of hooks) {
    const hookPos = getHookPosition(node, hook.direction, hook.offset);
    const distance = Math.sqrt(
      Math.pow(hookPos.x - targetX, 2) + Math.pow(hookPos.y - targetY, 2)
    );

    if (distance <= maxDistance) {
      if (!nearestHook || distance < nearestHook.distance) {
        nearestHook = {
          direction: hook.direction,
          offset: hook.offset,
          distance,
        };
      }
    }
  }

  return nearestHook
    ? { direction: nearestHook.direction, offset: nearestHook.offset }
    : null;
}

/**
 * Calcula o ponto de conexão ideal baseado em dois nós
 * Retorna a direção do hook que melhor conecta os dois nós
 */
export function getBestConnectionDirection(
  fromNode: FlowNode,
  toNode: FlowNode
): { fromDirection: HookDirection; toDirection: HookDirection } {
  const fromCenter = {
    x: fromNode.position.x + fromNode.width / 2,
    y: fromNode.position.y + fromNode.height / 2,
  };

  const toCenter = {
    x: toNode.position.x + toNode.width / 2,
    y: toNode.position.y + toNode.height / 2,
  };

  const dx = toCenter.x - fromCenter.x;
  const dy = toCenter.y - fromCenter.y;

  // Determina direção dominante
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  let fromDirection: HookDirection;
  let toDirection: HookDirection;

  // Converte ângulo em direções de hooks
  if (angle >= -45 && angle < 45) {
    fromDirection = 'right';
    toDirection = 'left';
  } else if (angle >= 45 && angle < 135) {
    fromDirection = 'bottom';
    toDirection = 'top';
  } else if (angle >= -135 && angle < -45) {
    fromDirection = 'top';
    toDirection = 'bottom';
  } else {
    fromDirection = 'left';
    toDirection = 'right';
  }

  return { fromDirection, toDirection };
}
