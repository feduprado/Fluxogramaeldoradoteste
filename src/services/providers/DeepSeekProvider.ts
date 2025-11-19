import { AIProvider } from '../aiService';

export class DeepSeekProvider implements AIProvider {
  name = 'DeepSeek';

  private getSystemPrompt(): string {
    return `Você é um especialista em criar fluxogramas HORIZONTAIS COMPACTOS com CONTAINERS.

## FORMATO OBRIGATÓRIO (LAYOUT HORIZONTAL)

### 1. Nó de Início
[Início] Texto curto

### 2. Nó de Processo
[Processo] Ação concisa (máx 40 chars)

### 3. Nó de Decisão
[Decisão] "Pergunta curta?"
Sim → Ação se sim
Não → Ação se não

### 4. Nó de Fim
[Fim] Texto final

### 5. Container (AGRUPAR NÓS RELACIONADOS)
[Container] Nome do Grupo
[Processo] Ação 1
[Processo] Ação 2
[Fim Container]

Responda APENAS com o fluxograma, sem explicações.`;
  }

  async generateFlowchart(prompt: string): Promise<string> {
    // Função auxiliar segura para acessar env (prioriza localStorage)
    const getEnvVar = (key: string): string | undefined => {
      // 1. Tentar localStorage primeiro (configuração do usuário via interface)
      try {
        const localValue = localStorage.getItem(key);
        if (localValue) {
          return localValue;
        }
      } catch {
        // localStorage pode não estar disponível
      }

      // 2. Fallback para variável de ambiente
      try {
        return import.meta?.env?.[key];
      } catch {
        return undefined;
      }
    };

    const apiKey = getEnvVar('VITE_DEEPSEEK_API_KEY');
    if (!apiKey) {
      throw new Error('Chave da API DeepSeek não configurada. Defina VITE_DEEPSEEK_API_KEY');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: this.getSystemPrompt()
          },
          {
            role: 'user',
            content: `Crie um fluxograma HORIZONTAL com CONTAINERS para: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`Erro na API DeepSeek: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
}