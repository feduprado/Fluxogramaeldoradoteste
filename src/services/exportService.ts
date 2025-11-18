import { GeminiAIService } from './geminiAI';
import {
  Documentation,
  ExportFormat,
  ExportOptions,
  ExportResult,
  FlowchartState,
} from '../types';

export class SmartExportService {
  private geminiAI: GeminiAIService;

  constructor(geminiAI: GeminiAIService) {
    this.geminiAI = geminiAI;
  }

  async exportWithDocumentation(
    flowchart: FlowchartState,
    options: ExportOptions
  ): Promise<ExportResult> {
    const documentation = options.includeDocumentation
      ? await this.geminiAI.generateDocumentation(flowchart)
      : undefined;

    switch (options.format) {
      case 'json':
        return this.exportJSON(flowchart, documentation);
      case 'svg':
        return this.exportSVG(flowchart, documentation);
      case 'markdown':
        return this.exportMarkdown(flowchart, documentation);
      default:
        throw new Error('Formato não suportado no momento.');
    }
  }

  private exportJSON(flowchart: FlowchartState, documentation?: Documentation): ExportResult {
    const enhancedData = {
      ...flowchart,
      metadata: {
        exportedAt: new Date().toISOString(),
        nodeCount: flowchart.nodes.length,
        connectionCount: flowchart.connections.length,
      },
      documentation,
    };

    const blob = new Blob([JSON.stringify(enhancedData, null, 2)], {
      type: 'application/json',
    });

    return {
      blob,
      filename: `fluxograma-${Date.now()}.json`,
      type: 'json',
      documentation,
    };
  }

  private exportMarkdown(flowchart: FlowchartState, documentation?: Documentation): ExportResult {
    const header = `# Documentação do Fluxograma\n\nNós: ${flowchart.nodes.length} | Conexões: ${flowchart.connections.length}`;
    const markdown = [header, documentation?.content].filter(Boolean).join('\n\n');

    const blob = new Blob([markdown], {
      type: 'text/markdown',
    });

    return {
      blob,
      filename: `fluxograma-${Date.now()}.md`,
      type: 'markdown',
      documentation,
    };
  }

  private exportSVG(flowchart: FlowchartState, documentation?: Documentation): ExportResult {
    const docComment = documentation ? `<!--\n${documentation.content}\n-->\n` : '';
    const nodes = JSON.stringify(flowchart.nodes);
    const connections = JSON.stringify(flowchart.connections);

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
${docComment}<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <title>Fluxograma Inteligente</title>
  <desc>Nós: ${nodes}\nConexões: ${connections}</desc>
</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });

    return {
      blob,
      filename: `fluxograma-${Date.now()}.svg`,
      type: 'svg',
      documentation,
    };
  }
}
