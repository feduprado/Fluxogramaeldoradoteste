import { FlowchartState, TemplateCategory } from '../types';
import { GeminiAIService } from './geminiAI';

const DEFAULT_TEMPLATE: FlowchartState = {
  nodes: [
    {
      id: 'node-start',
      type: 'start',
      position: { x: 200, y: 100 },
      text: 'Início',
      width: 100,
      height: 100,
    },
    {
      id: 'node-process',
      type: 'process',
      position: { x: 200, y: 260 },
      text: 'Primeiro passo',
      width: 160,
      height: 80,
    },
    {
      id: 'node-end',
      type: 'end',
      position: { x: 200, y: 420 },
      text: 'Fim',
      width: 100,
      height: 100,
    },
  ],
  connections: [
    { id: 'conn-1', fromNodeId: 'node-start', toNodeId: 'node-process' },
    { id: 'conn-2', fromNodeId: 'node-process', toNodeId: 'node-end' },
  ],
  selectedNodeId: null,
  temporaryConnection: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

export class FlowTemplateService {
  private geminiAI: GeminiAIService;

  constructor(geminiAI: GeminiAIService) {
    this.geminiAI = geminiAI;
  }

  async generateTemplate(templateType: string, customRequirements?: string): Promise<FlowchartState> {
    const prompt = `Gere um template de fluxograma para: ${templateType}.
${customRequirements ? `Requisitos adicionais: ${customRequirements}` : ''}

Use nós de início/processo/decisão/fim, conecte decisões com rótulos Sim/Não e retorne JSON com nodes/connections.`;

    const response = await this.geminiAI.callGeminiAPI(prompt);

    try {
      const data = JSON.parse(response) as FlowchartState;
      return {
        ...data,
        nodes: data.nodes || DEFAULT_TEMPLATE.nodes,
        connections: data.connections || DEFAULT_TEMPLATE.connections,
      };
    } catch (error) {
      console.warn('Falha ao gerar template com IA, usando default.', error);
      return DEFAULT_TEMPLATE;
    }
  }

  getPredefinedTemplates(): TemplateCategory[] {
    return [
      {
        id: 'auth',
        name: 'Autenticação',
        templates: [
          {
            id: 'login-flow',
            name: 'Fluxo de Login',
            description: 'Login com validação e exceções',
            complexity: 'Média',
          },
          {
            id: 'registration-flow',
            name: 'Cadastro de Usuário',
            description: 'Etapas completas de cadastro',
            complexity: 'Alta',
          },
        ],
      },
      {
        id: 'ecommerce',
        name: 'E-commerce',
        templates: [
          {
            id: 'purchase-flow',
            name: 'Processo de Compra',
            description: 'Checkout completo com validações',
            complexity: 'Alta',
          },
          {
            id: 'support-flow',
            name: 'Atendimento',
            description: 'Triagem e resolução de tickets',
            complexity: 'Média',
          },
        ],
      },
    ];
  }
}
