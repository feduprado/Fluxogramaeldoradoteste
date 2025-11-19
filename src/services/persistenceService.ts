import { FlowchartState, FlowNode, Connection } from '../types';
import { NodeFactory } from '../utils/nodeFactory';

export class FlowchartPersistenceService {
  validateFlowchart(flowchart: any): flowchart is FlowchartState {
    if (!flowchart || typeof flowchart !== 'object') {
      return false;
    }

    if (!Array.isArray(flowchart.nodes) || !Array.isArray(flowchart.connections)) {
      return false;
    }

    // Validar todos os nós
    const nodesValid = flowchart.nodes.every((node: any) => 
      NodeFactory.validateNode(node)
    );

    if (!nodesValid) {
      return false;
    }

    // Validar todas as conexões
    const connectionsValid = flowchart.connections.every((conn: any) => 
      this.validateConnection(conn, flowchart.nodes)
    );

    return connectionsValid;
  }

  private validateConnection(conn: any, nodes: FlowNode[]): boolean {
    if (!conn || typeof conn !== 'object') {
      return false;
    }

    if (typeof conn.id !== 'string' ||
        typeof conn.fromNodeId !== 'string' ||
        typeof conn.toNodeId !== 'string') {
      return false;
    }

    // Verificar se os nós referenciados existem
    const fromNodeExists = nodes.some(n => n.id === conn.fromNodeId);
    const toNodeExists = nodes.some(n => n.id === conn.toNodeId);

    return fromNodeExists && toNodeExists;
  }

  async exportAsJSON(flowchart: FlowchartState): Promise<Blob> {
    if (!this.validateFlowchart(flowchart)) {
      throw new Error('Fluxograma inválido para exportação');
    }

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      flowchart: flowchart
    };

    return new Blob(
      [JSON.stringify(exportData, null, 2)],
      { type: 'application/json' }
    );
  }

  async importFromJSON(file: File): Promise<FlowchartState> {
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // Verificar se é um export novo (com metadata) ou antigo
      const flowchart = data.flowchart || data;

      if (!this.validateFlowchart(flowchart)) {
        throw new Error('Arquivo JSON inválido ou corrompido');
      }

      // Sanitizar os dados
      return this.sanitizeFlowchartData(flowchart);
    } catch (error) {
      console.error('Erro ao importar fluxograma:', error);
      throw new Error('Não foi possível importar o arquivo. Verifique se é um JSON válido.');
    }
  }

  sanitizeFlowchartData(data: any): FlowchartState {
    const sanitizedNodes = data.nodes.map((node: any) => 
      NodeFactory.sanitizeNode(node)
    );

    const sanitizedConnections = data.connections.map((conn: any) => ({
      id: String(conn.id),
      fromNodeId: String(conn.fromNodeId),
      toNodeId: String(conn.toNodeId),
      label: conn.label ? String(conn.label) : undefined
    }));

    return {
      nodes: sanitizedNodes,
      connections: sanitizedConnections
    };
  }

  // Auto-save para localStorage
  autoSave(flowchart: FlowchartState, key: string = 'flowchart_autosave'): void {
    try {
      const data = {
        flowchart,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erro ao salvar automaticamente:', error);
    }
  }

  // Recuperar auto-save
  loadAutoSave(key: string = 'flowchart_autosave'): FlowchartState | null {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;

      const data = JSON.parse(saved);
      
      if (!this.validateFlowchart(data.flowchart)) {
        console.warn('Auto-save inválido, ignorando');
        return null;
      }

      return this.sanitizeFlowchartData(data.flowchart);
    } catch (error) {
      console.error('Erro ao carregar auto-save:', error);
      return null;
    }
  }

  // Limpar auto-save
  clearAutoSave(key: string = 'flowchart_autosave'): void {
    localStorage.removeItem(key);
  }
}

// Singleton instance
export const persistenceService = new FlowchartPersistenceService();
