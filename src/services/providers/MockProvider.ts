import { AIProvider } from '../aiService';

export class MockProvider implements AIProvider {
  name = 'Demo (Offline)';

  private templates: Record<string, string> = {
    default: `[Início] Início do processo

[Processo] Analisar solicitação

[Decisão] "Solicitação válida?"
Sim → Processar dados
Não → Rejeitar

[Container] Processamento
[Processo] Validar informações
[Processo] Executar ação
[Processo] Registrar resultado
[Fim Container]

[Decisão] "Sucesso?"
Sim → Finalizar
Não → Tratamento de erro

[Container] Finalização
[Processo] Gerar relatório
[Processo] Notificar usuário
[Fim Container]

[Fim] Processo concluído`,

    login: `[Início] Acessar sistema

[Processo] Exibir tela de login

[Decisão] "Credenciais válidas?"
Sim → Autenticar
Não → Mostrar erro

[Container] Autenticação
[Processo] Verificar senha
[Processo] Gerar token
[Processo] Criar sessão
[Fim Container]

[Decisão] "2FA habilitado?"
Sim → Verificar código
Não → Login completo

[Processo] Redirecionar para dashboard

[Fim] Usuário autenticado`,

    compra: `[Início] Iniciar compra

[Container] Carrinho
[Processo] Adicionar produto
[Processo] Calcular total
[Fim Container]

[Decisão] "Finalizar compra?"
Sim → Processar pagamento
Não → Continuar comprando

[Container] Pagamento
[Processo] Validar forma de pagamento
[Processo] Processar transação
[Processo] Confirmar pagamento
[Fim Container]

[Decisão] "Pagamento aprovado?"
Sim → Confirmar pedido
Não → Tentar novamente

[Processo] Enviar confirmação

[Fim] Compra finalizada`,

    cadastro: `[Início] Iniciar cadastro

[Processo] Preencher formulário

[Container] Validação
[Decisão] "Dados válidos?"
Sim → Continuar
Não → Corrigir erros

[Processo] Verificar e-mail único
[Processo] Validar CPF
[Fim Container]

[Decisão] "E-mail já cadastrado?"
Sim → Mostrar erro
Não → Criar conta

[Container] Criação de Conta
[Processo] Criptografar senha
[Processo] Salvar no banco
[Processo] Enviar e-mail confirmação
[Fim Container]

[Fim] Cadastro concluído`,

    aprovacao: `[Início] Solicitar aprovação

[Processo] Criar solicitação

[Container] Análise Inicial
[Decisão] "Valor < R$ 1000?"
Sim → Aprovação automática
Não → Análise manual
[Fim Container]

[Container] Aprovação Manual
[Processo] Enviar para gestor
[Decisão] "Gestor aprovou?"
Sim → Processar
Não → Rejeitar
[Fim Container]

[Processo] Notificar solicitante

[Fim] Processo finalizado`
  };

  async generateFlowchart(prompt: string): Promise<string> {
    // Simula latência de API
    await new Promise(resolve => setTimeout(resolve, 800));

    const lowerPrompt = prompt.toLowerCase();

    // Detecta template baseado em keywords
    if (lowerPrompt.includes('login') || lowerPrompt.includes('autenticar')) {
      return this.templates.login;
    }
    if (lowerPrompt.includes('compra') || lowerPrompt.includes('carrinho') || lowerPrompt.includes('pagamento')) {
      return this.templates.compra;
    }
    if (lowerPrompt.includes('cadastro') || lowerPrompt.includes('registro') || lowerPrompt.includes('usuário')) {
      return this.templates.cadastro;
    }
    if (lowerPrompt.includes('aprovação') || lowerPrompt.includes('aprovar')) {
      return this.templates.aprovacao;
    }

    // Template padrão personalizado com o prompt
    return `[Início] ${this.truncate(prompt, 30)}

[Processo] Receber requisição

[Container] Processamento Principal
[Decisão] "Dados válidos?"
Sim → Processar
Não → Retornar erro

[Processo] Executar lógica de negócio
[Processo] Validar resultado
[Fim Container]

[Decisão] "Sucesso?"
Sim → Finalizar
Não → Tratamento de erro

[Container] Finalização
[Processo] Preparar resposta
[Processo] Registrar log
[Fim Container]

[Fim] Processo concluído`;
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
}
