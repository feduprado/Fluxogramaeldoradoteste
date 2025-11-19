import { FlowNode, NodeType } from '../types';

export class NodeFactory {
  private static getDefaultText(type: NodeType): string {
    switch (type) {
      case 'start':
        return '[Início] Novo fluxo';
      case 'process':
        return '[Processo] Nova ação';
      case 'decision':
        return '[Decisão] "Condição?"';
      case 'end':
        return '[Fim] Fluxo concluído';
      default:
        return 'Novo nó';
    }
  }

  private static getDefaultWidth(type: NodeType): number {
    switch (type) {
      case 'start':
        return 120;
      case 'process':
        return 180;
      case 'decision':
        return 140;
      case 'end':
        return 120;
      default:
        return 120;
    }
  }

  private static getDefaultHeight(type: NodeType): number {
    switch (type) {
      case 'start':
        return 120;
      case 'process':
        return 80;
      case 'decision':
        return 100;
      case 'end':
        return 120;
      default:
        return 80;
    }
  }

  static createNode(
    type: NodeType,
    position: { x: number; y: number },
    text?: string
  ): FlowNode {
    const baseNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position,
      text: text || this.getDefaultText(type),
      width: this.getDefaultWidth(type),
      height: this.getDefaultHeight(type),
    };

    switch (type) {
      case 'start':
        return { ...baseNode, type: 'start' as const };
      case 'process':
        return { ...baseNode, type: 'process' as const };
      case 'decision':
        return { ...baseNode, type: 'decision' as const };
      case 'end':
        return { ...baseNode, type: 'end' as const };
      default:
        throw new Error(`Tipo de nó desconhecido: ${type}`);
    }
  }

  static cloneNode(node: FlowNode, offset: { x: number; y: number } = { x: 20, y: 20 }): FlowNode {
    return {
      ...node,
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      position: {
        x: node.position.x + offset.x,
        y: node.position.y + offset.y
      }
    };
  }

  static validateNode(node: any): node is FlowNode {
    return (
      node &&
      typeof node.id === 'string' &&
      typeof node.type === 'string' &&
      ['start', 'process', 'decision', 'end'].includes(node.type) &&
      typeof node.position === 'object' &&
      typeof node.position.x === 'number' &&
      typeof node.position.y === 'number' &&
      typeof node.text === 'string' &&
      typeof node.width === 'number' &&
      typeof node.height === 'number'
    );
  }

  static sanitizeNode(node: any): FlowNode {
    if (!this.validateNode(node)) {
      throw new Error('Nó inválido');
    }

    return {
      id: String(node.id),
      type: node.type as NodeType,
      position: {
        x: Number(node.position.x),
        y: Number(node.position.y)
      },
      text: String(node.text),
      width: Number(node.width),
      height: Number(node.height)
    };
  }
}
