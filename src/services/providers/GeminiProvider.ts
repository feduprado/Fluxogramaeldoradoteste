import { AIProvider } from '../aiService';

export class GeminiProvider implements AIProvider {
  name = 'Google Gemini';

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

## REGRAS CRÍTICAS

1. **HORIZONTAL**: Fluxo em linha reta horizontal
2. **CONTAINERS**: Agrupe processos relacionados
3. **TEXTO CURTO**: Máximo 40 caracteres
4. **OTIMIZADO**: 8-15 nós no total
5. **HOOKS CURTOS**: "Sim → OK" não "Sim → Sistema verifica..."

## EXEMPLO COMPLETO

[Início] App inicia

[Container] Login
[Processo] Exibe tela
[Decisão] "Credenciais OK?"
Sim → Acesso OK
Não → Erro
[Fim Container]

[Container] Dashboard
[Processo] Carrega dados
[Processo] Mostra UI
[Fim Container]

[Fim] App pronto

## QUANDO USAR CONTAINERS

✅ Autenticação, Pagamento, Módulos específicos
❌ Fluxos muito simples (2-3 nós)

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

    const apiKey = getEnvVar('VITE_GEMINI_API_KEY');
    if (!apiKey) {
      console.error('❌ Gemini: Chave não encontrada');
      console.log('localStorage:', localStorage.getItem('VITE_GEMINI_API_KEY'));
      console.log('import.meta.env:', import.meta?.env?.VITE_GEMINI_API_KEY);
      throw new Error('Chave da API Gemini não configurada. Defina VITE_GEMINI_API_KEY');
    }
    
    console.log('✅ Gemini: Chave encontrada, comprimento:', apiKey.length);
    
    // Usando Gemini 1.5 Flash (rápido e gratuito)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${this.getSystemPrompt()}

===

PROMPT DO USUÁRIO:
${prompt}

LEMBRE-SE:
- Layout HORIZONTAL compacto
- Use containers para agrupar
- Textos ultra curtos (máx 40 chars)
- 8-15 nós no total
- Inclua [Início] e [Fim]`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Erro na API Gemini: ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Gemini não retornou resultados');
    }

    const content = data.candidates[0].content.parts[0].text;
    return content;
  }
}