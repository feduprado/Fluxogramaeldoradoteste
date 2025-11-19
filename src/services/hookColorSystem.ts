/**
 * Sistema de cores para hooks baseado em tipo de conexão
 * 
 * Cores:
 * - Verde (#10B981) para conexões "Sim"
 * - Vermelho (#EF4444) para conexões "Não"
 * - Azul (#3B82F6) para hooks de containers
 * - Roxo (#8B5CF6) para hooks dentro de containers
 * - Cinza (#6B7280) para hooks neutros/padrão
 */

import { Connection, FlowNode } from '../types';
import { Container } from '../types/container';

export type HookColorType = 'yes' | 'no' | 'container' | 'inContainer' | 'neutral';

export class HookColorSystem {
  private static instance: HookColorSystem;

  private colorMap: Record<HookColorType, string> = {
    yes: '#10B981',        // Verde - conexões "Sim"
    no: '#EF4444',         // Vermelho - conexões "Não"
    container: '#3B82F6',  // Azul - hooks de containers
    inContainer: '#8B5CF6', // Roxo - hooks dentro de containers
    neutral: '#6B7280',    // Cinza - padrão
  };

  private constructor() {}

  public static getInstance(): HookColorSystem {
    if (!HookColorSystem.instance) {
      HookColorSystem.instance = new HookColorSystem();
    }
    return HookColorSystem.instance;
  }

  /**
   * Obtém a cor de um hook baseado no contexto
   */
  public getHookColor(
    elementId: string,
    isContainer: boolean,
    connections: Connection[],
    nodes: FlowNode[]
  ): string {
    // Hooks de containers sempre azuis
    if (isContainer) {
      return this.colorMap.container;
    }

    // Verifica se o nó está dentro de um container
    const node = nodes.find(n => n.id === elementId);
    if (node?.containerId) {
      // Verifica se tem conexão com label específico
      const connectionType = this.getNodeConnectionType(elementId, connections);
      if (connectionType === 'yes') return this.colorMap.yes;
      if (connectionType === 'no') return this.colorMap.no;
      
      // Hook dentro de container sem label específico
      return this.colorMap.inContainer;
    }

    // Verifica tipo de conexão por label
    const connectionType = this.getNodeConnectionType(elementId, connections);
    if (connectionType === 'yes') return this.colorMap.yes;
    if (connectionType === 'no') return this.colorMap.no;

    // Padrão
    return this.colorMap.neutral;
  }

  /**
   * Determina o tipo de conexão baseado nos labels
   */
  private getNodeConnectionType(
    nodeId: string,
    connections: Connection[]
  ): HookColorType {
    // Procura conexões saindo do nó
    const outgoingConnections = connections.filter(
      conn => conn.fromNodeId === nodeId && conn.label
    );

    if (outgoingConnections.length === 0) return 'neutral';

    // Se há pelo menos uma conexão "Sim", marca como yes
    const hasYes = outgoingConnections.some(
      conn => conn.label?.toLowerCase() === 'sim' || conn.label?.toLowerCase() === 's'
    );
    
    // Se há pelo menos uma conexão "Não", marca como no
    const hasNo = outgoingConnections.some(
      conn => conn.label?.toLowerCase() === 'não' || 
              conn.label?.toLowerCase() === 'nao' ||
              conn.label?.toLowerCase() === 'n'
    );

    // Se tem ambos, prioriza "yes" (decisões geralmente têm ambos)
    if (hasYes) return 'yes';
    if (hasNo) return 'no';

    return 'neutral';
  }

  /**
   * Obtém cor para uma conexão específica baseado no label
   */
  public getConnectionColor(connection: Connection): string {
    if (!connection.label) return this.colorMap.neutral;

    const label = connection.label.toLowerCase();
    
    if (label === 'sim' || label === 's') {
      return this.colorMap.yes;
    }
    
    if (label === 'não' || label === 'nao' || label === 'n') {
      return this.colorMap.no;
    }

    return this.colorMap.neutral;
  }

  /**
   * Obtém todas as cores disponíveis
   */
  public getColors(): Record<HookColorType, string> {
    return { ...this.colorMap };
  }

  /**
   * Atualiza uma cor específica
   */
  public setColor(type: HookColorType, color: string): void {
    this.colorMap[type] = color;
  }
}
