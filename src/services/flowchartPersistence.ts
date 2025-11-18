import { Connection, FlowNode } from '../types';
import { ensureFlowchartData, FlowchartDataPayload, sanitizeFlowchartData, validateFlowchartData } from '../utils/flowchartValidation';

const DOWNLOAD_PREFIX = 'fluxograma';

export interface ExportMetadata {
  version: string;
  exportedAt: string;
}

export type PersistedFlowchart = FlowchartDataPayload & { metadata?: ExportMetadata };

export class FlowchartPersistenceService {
  validateFlowchart(data: unknown): data is FlowchartDataPayload {
    return validateFlowchartData(data);
  }

  sanitizeFlowchart(data: FlowchartDataPayload): FlowchartDataPayload {
    return sanitizeFlowchartData(data);
  }

  parse(jsonString: string): FlowchartDataPayload {
    const parsed = JSON.parse(jsonString);
    const sanitized = ensureFlowchartData(parsed);

    if (!sanitized) {
      throw new Error('Fluxograma inválido');
    }

    return sanitized;
  }

  exportAsJSON(flowchart: { nodes: FlowNode[]; connections: Connection[] }): void {
    const sanitized = this.sanitizeFlowchart({
      nodes: flowchart.nodes,
      connections: flowchart.connections,
    });

    const payload: PersistedFlowchart = {
      ...sanitized,
      metadata: {
        version: '1.0',
        exportedAt: new Date().toISOString(),
      },
    };

    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${DOWNLOAD_PREFIX}-${Date.now()}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }
}

export const flowchartPersistenceService = new FlowchartPersistenceService();
