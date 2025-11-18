import { GEMINI_CONFIG } from '../config/gemini';
import {
  AIAnalysis,
  AISuggestion,
  Connection,
  Documentation,
  FlowNode,
  FlowchartState,
} from '../types';

export interface GeminiAIConfig {
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens?: number;
  safetySettings?: Array<Record<string, string>>;
}

const FALLBACK_ANALYSIS: AIAnalysis = {
  complexity: 'média',
  suggestions: [
    {
      type: 'optimization',
      message: 'Conecte todos os nós de decisão a ramos Sim/Não para evitar fluxos órfãos.',
      priority: 'medium',
    },
  ],
  estimatedTime: '1-2 dias de ajustes',
  potentialIssues: ['Nós desconectados', 'Caminhos sem saída'],
};

export class GeminiAIService {
  private config: GeminiAIConfig;

  constructor(config: GeminiAIConfig = GEMINI_CONFIG) {
    this.config = config;
  }

  private hasValidKey() {
    return Boolean(this.config.apiKey);
  }

  private buildPromptHeader() {
    return `Você é o Gemini 2.5 Pro atuando como especialista em fluxogramas e UX.`;
  }

  private async performFetch(prompt: string) {
    const body = {
      contents: [
        {
          parts: [
            {
              text: `${this.buildPromptHeader()}\n\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: this.config.temperature,
        maxOutputTokens: this.config.maxTokens ?? 2048,
      },
      safetySettings: this.config.safetySettings,
    };

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API respondeu com status ${response.status}`);
    }

    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text as string;
  }

  public async callGeminiAPI(prompt: string) {
    if (!this.hasValidKey()) {
      console.warn('⚠️ VITE_GEMINI_API_KEY não configurada. Usando fallback local.');
      return this.generateLocalFallback(prompt);
    }

    try {
      const result = await this.performFetch(prompt);
      return result || this.generateLocalFallback(prompt);
    } catch (error) {
      console.error('Erro ao chamar Gemini API:', error);
      return this.generateLocalFallback(prompt);
    }
  }

  private generateLocalFallback(prompt: string) {
    return JSON.stringify(FALLBACK_ANALYSIS, null, 2);
  }

  private createAnalysisPrompt(nodes: FlowNode[], connections: Connection[]): string {
    return `Analise o fluxograma abaixo e responda em JSON válido.
NÓS: ${JSON.stringify(nodes)}
CONEXÕES: ${JSON.stringify(connections)}

Informe: complexidade (baixa/média/alta), sugestões com tipo/prioridade e possíveis riscos.`;
  }

  public async analyzeFlowchart(nodes: FlowNode[], connections: Connection[]): Promise<AIAnalysis> {
    if (nodes.length === 0) {
      return { ...FALLBACK_ANALYSIS, complexity: 'baixa' };
    }

    const prompt = this.createAnalysisPrompt(nodes, connections);
    const response = await this.callGeminiAPI(prompt);

    try {
      return JSON.parse(response) as AIAnalysis;
    } catch {
      return FALLBACK_ANALYSIS;
    }
  }

  public async suggestImprovements(flowchart: FlowchartState): Promise<AISuggestion[]> {
    const prompt = `Como especialista em UX, sugira melhorias para o fluxograma a seguir.
Retorne em JSON de array com { "type", "message", "priority" }.
Fluxograma: ${JSON.stringify(flowchart)}`;

    const response = await this.callGeminiAPI(prompt);

    try {
      return JSON.parse(response) as AISuggestion[];
    } catch {
      return FALLBACK_ANALYSIS.suggestions;
    }
  }

  public async generateDocumentation(flowchart: FlowchartState): Promise<Documentation> {
    const prompt = `Gere documentação em Markdown profissional para este fluxograma:
${JSON.stringify(flowchart)}

Inclua: visão geral, fluxo principal, decisões críticas, exceções e requisitos.`;

    const response = await this.callGeminiAPI(prompt);
    return {
      content: response,
      generatedAt: new Date().toISOString(),
      version: '1.0',
    };
  }
}
