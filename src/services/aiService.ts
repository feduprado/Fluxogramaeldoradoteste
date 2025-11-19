export interface AIProvider {
  name: string;
  generateFlowchart(prompt: string): Promise<string>;
}

export class AIService {
  private static instance: AIService;
  private providers: Map<string, AIProvider> = new Map();
  private initialized = false;

  private constructor() {}

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  public async initialize() {
    if (this.initialized) return;

    // Função auxiliar segura para acessar env (prioriza localStorage)
    const getEnvVar = (key: string): string | undefined => {
      // 1. Tentar localStorage primeiro (configuração do usuário via interface)
      try {
        const localValue = localStorage.getItem(key);
        if (localValue) {
          console.log(`✅ Usando chave do localStorage para ${key}`);
          return localValue;
        }
      } catch {
        // localStorage pode não estar disponível
      }

      // 2. Fallback para variável de ambiente
      try {
        const envValue = import.meta?.env?.[key];
        if (envValue) {
          console.log(`✅ Usando chave do .env para ${key}`);
          return envValue;
        }
      } catch {
        // import.meta.env pode não estar disponível
      }

      return undefined;
    };

    let hasRealProvider = false;

    // Gemini - requer chave API externa
    const geminiKey = getEnvVar('VITE_GEMINI_API_KEY');
    if (geminiKey) {
      try {
        const { GeminiProvider } = await import('./providers/GeminiProvider');
        this.providers.set('gemini', new GeminiProvider());
        hasRealProvider = true;
        console.log('✅ Gemini Provider carregado');
      } catch (error) {
        console.log('⚠️ Gemini Provider não disponível');
      }
    }

    // ChatGPT - requer chave API externa
    const openaiKey = getEnvVar('VITE_OPENAI_API_KEY');
    if (openaiKey) {
      try {
        const { ChatGPTProvider } = await import('./providers/ChatGPTProvider');
        this.providers.set('chatgpt', new ChatGPTProvider());
        hasRealProvider = true;
        console.log('✅ ChatGPT Provider carregado');
      } catch (error) {
        console.log('⚠️ ChatGPT Provider não disponível');
      }
    }

    // DeepSeek - requer chave API externa
    const deepseekKey = getEnvVar('VITE_DEEPSEEK_API_KEY');
    if (deepseekKey) {
      try {
        const { DeepSeekProvider } = await import('./providers/DeepSeekProvider');
        this.providers.set('deepseek', new DeepSeekProvider());
        hasRealProvider = true;
        console.log('✅ DeepSeek Provider carregado');
      } catch (error) {
        console.log('⚠️ DeepSeek Provider não disponível');
      }
    }

    // Mock Provider - sempre disponível como fallback
    try {
      const { MockProvider } = await import('./providers/MockProvider');
      this.providers.set('mock', new MockProvider());
      console.log(hasRealProvider ? 'ℹ️ Mock Provider disponível como alternativa' : '✅ Mock Provider carregado (modo demo)');
    } catch (error) {
      console.log('⚠️ Mock Provider não disponível');
    }

    this.initialized = true;
  }

  public getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  public async generateFlowchart(
    prompt: string, 
    provider: string = 'gemini'
  ): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    const aiProvider = this.providers.get(provider);
    
    if (!aiProvider) {
      throw new Error(`Provedor ${provider} não disponível. Use: ${this.getAvailableProviders().join(', ')}`);
    }

    try {
      console.log(`🔄 Gerando fluxograma com ${provider}...`);
      const result = await aiProvider.generateFlowchart(prompt);
      console.log(`✅ Fluxograma gerado com sucesso por ${provider}`);
      return result;
    } catch (error) {
      console.error(`❌ Erro com ${provider}:`, error);
      throw error;
    }
  }

  public async generateWithFallback(prompt: string): Promise<string> {
    if (!this.initialized) {
      await this.initialize();
    }

    const providers = this.getAvailableProviders();
    
    if (providers.length === 0) {
      throw new Error('Nenhum provedor de IA disponível');
    }

    for (const provider of providers) {
      try {
        console.log(`🔄 Tentando com ${provider}...`);
        return await this.generateFlowchart(prompt, provider);
      } catch (error) {
        console.warn(`❌ ${provider} falhou, tentando próximo...`);
        continue;
      }
    }
    
    throw new Error('Todos os provedores de IA falharam');
  }

  public async reinitialize() {
    this.initialized = false;
    this.providers.clear();
    console.log('🔄 Reinicializando serviço de IA...');
    await this.initialize();
  }
}