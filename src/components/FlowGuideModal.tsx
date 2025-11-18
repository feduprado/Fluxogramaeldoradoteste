import React, { useState } from 'react';
import { Theme } from '../hooks/useTheme';

interface FlowGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onUseExample?: (text: string) => void;
}

export const FlowGuideModal: React.FC<FlowGuideModalProps> = ({ 
  isOpen, 
  onClose, 
  theme,
  onUseExample 
}) => {
  const [activeSection, setActiveSection] = useState<'basics' | 'examples' | 'tips' | 'prompt'>('basics');

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const aiPrompt = `Você é um assistente especializado em criar fluxogramas estruturados para uma aplicação web de diagramas de fluxo.

## FORMATO OBRIGATÓRIO

Use EXATAMENTE esta sintaxe para cada tipo de nó:

### 1. Nó de Início
\`\`\`
[Início] Descrição do estado inicial
\`\`\`

### 2. Nó de Processo
\`\`\`
[Processo] Descrição da ação ou etapa
\`\`\`

### 3. Nó de Decisão (SEMPRE com ramos Sim/Não)
\`\`\`
[Decisão] "Pergunta clara e objetiva?"
Sim → O que acontece se a resposta for afirmativa
Não → O que acontece se a resposta for negativa
\`\`\`

### 4. Nó de Fim
\`\`\`
[Fim] Descrição do estado final
\`\`\`

## REGRAS CRÍTICAS

1. **SEMPRE use colchetes**: \`[Tipo]\` nunca \`Tipo\`
2. **Acentuação obrigatória**: \`[Decisão]\` não \`[Decisao]\`
3. **Primeira letra maiúscula**: \`[Início]\` não \`[início]\`
4. **Use SEMPRE português**: Nunca \`[Start]\` ou \`[Process]\`
5. **Todo fluxo DEVE começar com \`[Início]\`**
6. **Todo fluxo DEVE terminar com \`[Fim]\`**
7. **TODA \`[Decisão]\` DEVE ter \`Sim →\` e \`Não →\` logo abaixo**
8. **Use → ou -> para indicar direção dos ramos**
9. **Texto curto**: Máximo 60 caracteres por linha (o nó tem tamanho fixo)
10. **Uma linha = Uma ação**: Seja específico mas conciso

## ESTRUTURA TÍPICA

\`\`\`
[Início] Estado inicial do sistema

[Processo] Primeira ação

[Processo] Segunda ação

[Decisão] "Condição é atendida?"
Sim → Continua no fluxo principal
Não → Trata exceção ou erro

[Processo] Próxima ação

[Decisão] "Outra verificação?"
Sim → Fluxo positivo
Não → Fluxo alternativo

[Processo] Ação final

[Fim] Estado final
\`\`\`

## EXEMPLO COMPLETO: Login

\`\`\`
[Início] Usuário acessa tela de login

[Processo] Exibe formulário com email e senha

[Processo] Usuário preenche credenciais

[Processo] Clica em "Entrar"

[Decisão] "Campos estão preenchidos?"
Não → Mostra mensagem de campos obrigatórios
Sim → Continua validação

[Processo] Sistema envia dados ao servidor

[Decisão] "Servidor respondeu com sucesso?"
Não → Exibe erro de conexão
Sim → Valida resposta

[Decisão] "Credenciais são válidas?"
Não → Mostra erro "Email ou senha incorretos"
Sim → Autentica usuário

[Processo] Token de sessão é salvo

[Processo] Redireciona para dashboard

[Fim] Usuário autenticado com sucesso
\`\`\`

## TAMANHO DOS NÓS (IMPORTANTE)

Os nós têm tamanho FIXO. Mantenha o texto curto:
- **Início/Fim**: 1 linha, ~20 caracteres
- **Processo**: 1-2 linhas, ~50-60 caracteres por linha
- **Decisão**: 1 linha na pergunta, ~40 caracteres
- **Ramos Sim/Não**: 1 linha, ~50 caracteres

Se precisar de mais detalhes, divida em múltiplos processos!

## DICAS

✅ **BOM**: \`[Processo] Usuário clica em "Finalizar Compra"\`
❌ **RUIM**: \`[Processo] O usuário visualiza o botão de finalizar compra localizado no canto inferior direito da tela e então clica nele para prosseguir\`

✅ **BOM**: 
\`\`\`
[Decisão] "Pagamento aprovado?"
Sim → Confirma pedido
Não → Exibe erro
\`\`\`

❌ **RUIM**:
\`\`\`
[Decisão] Verifica se o pagamento foi processado
(sem ramos Sim/Não)
\`\`\`

## SUA TAREFA

Quando eu pedir um fluxograma, você deve:
1. Entender o processo descrito
2. Dividir em etapas lógicas
3. Identificar pontos de decisão
4. Gerar o texto EXATAMENTE no formato acima
5. Usar textos curtos e concisos
6. SEMPRE incluir [Início] e [Fim]
7. SEMPRE adicionar Sim/Não para cada [Decisão]

Está pronto para gerar fluxogramas?`;

  const examples = {
    simple: `[Início] App de login

[Processo] Usuário insere email e senha

[Decisão] "Credenciais corretas?"
Sim → Autentica usuário
Não → Mostra erro

[Processo] Dashboard é carregado

[Fim] Usuário autenticado`,

    medium: `[Início] E-commerce - Processo de Compra

[Processo] Usuário navega pelos produtos

[Processo] Adiciona item ao carrinho

[Decisão] "Quer continuar comprando?"
Sim → Volta para lista de produtos
Não → Vai para carrinho

[Processo] Revisa itens do carrinho

[Decisão] "Confirma compra?"
Não → Volta para loja
Sim → Avança

[Processo] Preenche dados de entrega

[Processo] Seleciona forma de pagamento

[Decisão] "Pagamento aprovado?"
Não → Exibe erro
Sim → Confirma pedido

[Processo] Email de confirmação enviado

[Fim] Compra finalizada`,

    complex: `[Início] App de Banco - Transferência

[Decisão] "Usuário está autenticado?"
Não → Redireciona para login
Sim → Continua

[Processo] Acessa menu de transferências

[Processo] Seleciona tipo: PIX ou TED

[Decisão] "Selecionou PIX?"
Sim → Fluxo PIX
Não → Fluxo TED

[Processo] Preenche dados do destinatário

[Processo] Informa valor

[Decisão] "Valor disponível em conta?"
Não → Exibe saldo insuficiente
Sim → Continua

[Processo] Exibe resumo da transferência

[Decisão] "Confirma transferência?"
Não → Cancela operação
Sim → Processa

[Processo] Solicita senha ou biometria

[Decisão] "Autenticação válida?"
Não → Bloqueia por 3 tentativas
Sim → Executa transferência

[Processo] Transferência processada

[Decisão] "Transferência bem-sucedida?"
Não → Exibe erro e oferece tentar novamente
Sim → Confirma sucesso

[Processo] Comprovante é gerado

[Processo] Notificação enviada

[Fim] Transferência concluída`
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className={`rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${
          isDark ? 'bg-[#1E1E1E]' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b ${
          isDark 
            ? 'bg-gradient-to-r from-green-600 to-emerald-600 border-gray-700' 
            : 'bg-gradient-to-r from-green-500 to-emerald-500 border-gray-200'
        }`}>
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-white text-2xl flex items-center space-x-2 mb-2">
                <span>📚</span>
                <span>Guia: Como Escrever Fluxos</span>
              </h2>
              <p className="text-green-100 text-sm">
                Aprenda a sintaxe completa para criar fluxogramas perfeitos com a IA
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex border-b ${isDark ? 'border-gray-700 bg-[#252525]' : 'border-gray-200 bg-gray-50'}`}>
          <button
            onClick={() => setActiveSection('basics')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeSection === 'basics'
                ? `border-b-2 border-green-500 ${isDark ? 'text-green-400 bg-[#1E1E1E]' : 'text-green-600 bg-white'}`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🎯</span>
              <span>Básico</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('examples')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeSection === 'examples'
                ? `border-b-2 border-green-500 ${isDark ? 'text-green-400 bg-[#1E1E1E]' : 'text-green-600 bg-white'}`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>💡</span>
              <span>Exemplos</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('tips')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeSection === 'tips'
                ? `border-b-2 border-green-500 ${isDark ? 'text-green-400 bg-[#1E1E1E]' : 'text-green-600 bg-white'}`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🚀</span>
              <span>Dicas</span>
            </div>
          </button>
          <button
            onClick={() => setActiveSection('prompt')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeSection === 'prompt'
                ? `border-b-2 border-green-500 ${isDark ? 'text-green-400 bg-[#1E1E1E]' : 'text-green-600 bg-white'}`
                : `${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>💬</span>
              <span>Prompt p/ IA</span>
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeSection === 'basics' && (
            <div className="space-y-6">
              <section>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  📝 Os 4 Tipos de Nós
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Início */}
                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">🟢</span>
                      <code className={`px-2 py-1 rounded font-mono text-sm ${
                        isDark ? 'bg-gray-900 text-green-400' : 'bg-white text-green-600'
                      }`}>[Início]</code>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Marca o começo do fluxo
                    </p>
                    <div className={`mt-2 p-2 rounded text-xs font-mono ${
                      isDark ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-600'
                    }`}>
                      [Início] App aberto
                    </div>
                  </div>

                  {/* Processo */}
                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">🔵</span>
                      <code className={`px-2 py-1 rounded font-mono text-sm ${
                        isDark ? 'bg-gray-900 text-blue-400' : 'bg-white text-blue-600'
                      }`}>[Processo]</code>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Ação ou etapa do fluxo
                    </p>
                    <div className={`mt-2 p-2 rounded text-xs font-mono ${
                      isDark ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-600'
                    }`}>
                      [Processo] Valida login
                    </div>
                  </div>

                  {/* Decisão */}
                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">🟡</span>
                      <code className={`px-2 py-1 rounded font-mono text-sm ${
                        isDark ? 'bg-gray-900 text-yellow-400' : 'bg-white text-yellow-600'
                      }`}>[Decisão]</code>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Pergunta com 2+ respostas
                    </p>
                    <div className={`mt-2 p-2 rounded text-xs font-mono ${
                      isDark ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-600'
                    }`}>
                      [Decisão] "Login válido?"<br/>
                      Sim → Continua<br/>
                      Não → Mostra erro
                    </div>
                  </div>

                  {/* Fim */}
                  <div className={`p-4 rounded-lg border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-2xl">🔴</span>
                      <code className={`px-2 py-1 rounded font-mono text-sm ${
                        isDark ? 'bg-gray-900 text-red-400' : 'bg-white text-red-600'
                      }`}>[Fim]</code>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Marca o término do fluxo
                    </p>
                    <div className={`mt-2 p-2 rounded text-xs font-mono ${
                      isDark ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-600'
                    }`}>
                      [Fim] Processo concluído
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  ⚡ Regras Essenciais
                </h3>
                
                <div className={`space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <div>
                      <strong>Use sempre colchetes:</strong>
                      <code className={`ml-2 px-2 py-1 rounded text-sm ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>[Início]</code> não <code className={`ml-2 px-2 py-1 rounded text-sm ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>Início</code>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <div>
                      <strong>Decisões precisam de ramos:</strong>
                      <div className={`mt-1 p-2 rounded text-sm font-mono ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>
                        [Decisão] "Texto?"<br/>
                        Sim → Ação se sim<br/>
                        Não → Ação se não
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <div>
                      <strong>Sempre comece e termine:</strong> Todo fluxo deve ter <code className={`px-2 py-1 rounded text-sm ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>[Início]</code> e <code className={`px-2 py-1 rounded text-sm ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>[Fim]</code>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <div>
                      <strong>Uma linha = Uma ação:</strong> Seja específico e direto em cada processo
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <span className="text-green-500 text-xl">✅</span>
                    <div>
                      <strong>Use acentuação correta:</strong>
                      <code className={`ml-2 px-2 py-1 rounded text-sm ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>[Decisão]</code> não <code className={`ml-2 px-2 py-1 rounded text-sm ${
                        isDark ? 'bg-gray-800' : 'bg-gray-100'
                      }`}>[Decisao]</code>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'examples' && (
            <div className="space-y-6">
              <section>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  📝 Exemplo 1: Fluxo Simples
                </h3>
                <div className={`p-4 rounded-lg max-h-64 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <pre className={`text-sm font-mono overflow-x-auto ${ 
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>{examples.simple}</pre>
                </div>
                {onUseExample && (
                  <button
                    onClick={() => {
                      onUseExample(examples.simple);
                      onClose();
                    }}
                    className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    ✨ Usar este exemplo
                  </button>
                )}
              </section>

              <section>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  📝 Exemplo 2: Fluxo Intermediário
                </h3>
                <div className={`p-4 rounded-lg max-h-80 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <pre className={`text-sm font-mono overflow-x-auto ${ 
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>{examples.medium}</pre>
                </div>
                {onUseExample && (
                  <button
                    onClick={() => {
                      onUseExample(examples.medium);
                      onClose();
                    }}
                    className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    ✨ Usar este exemplo
                  </button>
                )}
              </section>

              <section>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  📝 Exemplo 3: Fluxo Complexo (LATAM 🌎)
                </h3>
                <div className={`p-4 rounded-lg max-h-96 overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <pre className={`text-sm font-mono overflow-x-auto ${ 
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>{examples.complex}</pre>
                </div>
                {onUseExample && (
                  <button
                    onClick={() => {
                      onUseExample(examples.complex);
                      onClose();
                    }}
                    className="mt-3 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    ✨ Usar este exemplo
                  </button>
                )}
              </section>
            </div>
          )}

          {activeSection === 'tips' && (
            <div className="space-y-6">
              <section>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  💎 Dicas de Ouro
                </h3>
                
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-l-4 border-blue-500 ${
                    isDark ? 'bg-blue-900/20' : 'bg-blue-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                      1. Use Perguntas Diretas nas Decisões
                    </h4>
                    <div className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div>
                        <span className="text-yellow-500">🤔 OK:</span>
                        <code className={`ml-2 px-2 py-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          [Decisão] Verificar autenticação
                        </code>
                      </div>
                      <div>
                        <span className="text-green-500">✅ MELHOR:</span>
                        <code className={`ml-2 px-2 py-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          [Decisão] "Usuário está autenticado?"
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-l-4 border-green-500 ${
                    isDark ? 'bg-green-900/20' : 'bg-green-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                      2. Seja Específico nos Processos
                    </h4>
                    <div className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <div>
                        <span className="text-yellow-500">🤔 VAGO:</span>
                        <code className={`ml-2 px-2 py-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          [Processo] Carrega dados
                        </code>
                      </div>
                      <div>
                        <span className="text-green-500">✅ ESPECÍFICO:</span>
                        <code className={`ml-2 px-2 py-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          [Processo] API retorna lista de produtos
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-l-4 border-purple-500 ${
                    isDark ? 'bg-purple-900/20' : 'bg-purple-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-purple-300' : 'text-purple-800'}`}>
                      3. Organize com Contexto
                    </h4>
                    <div className={`text-sm space-y-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p>Adicione contexto às ações para facilitar o entendimento:</p>
                      <code className={`block p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        [Processo] USUÁRIO: Clica em "Finalizar"<br/>
                        [Processo] SISTEMA: Valida carrinho<br/>
                        [Processo] API: Processa pagamento
                      </code>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-l-4 border-orange-500 ${
                    isDark ? 'bg-orange-900/20' : 'bg-orange-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-orange-300' : 'text-orange-800'}`}>
                      4. Indique Casos de Erro
                    </h4>
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <p className="mb-2">Sempre considere o caminho de erro:</p>
                      <code className={`block p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        [Decisão] "API respondeu com sucesso?"<br/>
                        Sim → Processa dados<br/>
                        Não → Exibe mensagem de erro e oferece tentar novamente
                      </code>
                    </div>
                  </div>

                  <div className={`p-4 rounded-lg border-l-4 border-pink-500 ${
                    isDark ? 'bg-pink-900/20' : 'bg-pink-50'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-pink-300' : 'text-pink-800'}`}>
                      5. Use Emojis para Clareza Visual (Opcional)
                    </h4>
                    <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <code className={`block p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        [Início] 🚀 App iniciado<br/>
                        [Processo] 👤 Usuário faz login<br/>
                        [Decisão] "✅ Login válido?"<br/>
                        Sim → 🎉 Acesso liberado<br/>
                        Não → ❌ Mostra erro
                      </code>
                    </div>
                  </div>
                </div>
              </section>

              <section>
                <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  ❌ Erros Comuns a Evitar
                </h3>
                
                <div className="space-y-3">
                  <div className={`p-3 rounded ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500">❌</span>
                      <div className={`flex-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Esquecer colchetes:</strong> Sempre use <code className={`px-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>[Tipo]</code>
                      </div>
                    </div>
                  </div>

                  <div className={`p-3 rounded ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500">❌</span>
                      <div className={`flex-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Decisão sem ramos:</strong> Toda <code className={`px-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>[Decisão]</code> precisa de Sim → e Não →
                      </div>
                    </div>
                  </div>

                  <div className={`p-3 rounded ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500">❌</span>
                      <div className={`flex-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Marcadores em inglês:</strong> Use <code className={`px-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>[Início]</code> não <code className={`px-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>[Start]</code>
                      </div>
                    </div>
                  </div>

                  <div className={`p-3 rounded ${isDark ? 'bg-red-900/20' : 'bg-red-50'}`}>
                    <div className="flex items-start space-x-2">
                      <span className="text-red-500">❌</span>
                      <div className={`flex-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <strong>Sem acentuação:</strong> Use <code className={`px-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>[Decisão]</code> não <code className={`px-1 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>[Decisao]</code>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeSection === 'prompt' && (
            <div className="space-y-6">
              <section>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className={`text-xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      💬 Prompt Pronto para IAs Externas
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Use em ChatGPT, Claude, Gemini ou qualquer outra IA
                    </p>
                  </div>
                  <button
  onClick={(e) => {
    const btn = e.currentTarget;
    const originalText = btn.textContent || 'Copiar Prompt';

    let copied = false;

    try {
      const textarea = document.createElement('textarea');
      textarea.value = aiPrompt;

      textarea.style.position = 'fixed';
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      textarea.style.opacity = '0';
      textarea.style.pointerEvents = 'none';
      textarea.setAttribute('readonly', '');

      document.body.appendChild(textarea);

      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, aiPrompt.length);

      copied = document.execCommand('copy');

      document.body.removeChild(textarea);
    } catch (error) {
      console.error('Erro ao copiar prompt com execCommand:', error);
      copied = false;
    }

    btn.textContent = copied ? '✅ Copiado!' : '⚠️ Copie manualmente';
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }}
  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium flex items-center space-x-2"
>
  <span>📋</span>
  <span>Copiar Prompt</span>
</button>

                </div>
                
                <div className={`rounded-lg border ${
                  isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div className="p-4">
                    <h4 className={`font-semibold mb-2 ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                      🎯 Como usar:
                    </h4>
                    <ol className={`text-sm space-y-1 list-decimal list-inside ${
                      isDark ? 'text-blue-200' : 'text-blue-700'
                    }`}>
                      <li>Clique em "Copiar Prompt" acima</li>
                      <li>Abra ChatGPT, Claude ou sua IA preferida</li>
                      <li>Cole o prompt copiado</li>
                      <li>Peça para a IA criar um fluxograma (ex: "Crie um fluxo de cadastro de usuário")</li>
                      <li>Copie a resposta da IA</li>
                      <li>Volte aqui e cole no modal de IA</li>
                      <li>Clique em "Interpretar com IA"</li>
                    </ol>
                  </div>
                </div>

                <div className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
                  <pre className={`text-sm font-mono overflow-x-auto whitespace-pre-wrap ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>{aiPrompt}</pre>
                </div>

                <div className={`p-4 rounded-lg border-l-4 border-green-500 ${
                  isDark ? 'bg-green-900/20' : 'bg-green-50'
                }`}>
                  <h4 className={`font-semibold mb-2 ${isDark ? 'text-green-300' : 'text-green-800'}`}>
                    💡 Exemplo de uso com ChatGPT:
                  </h4>
                  <div className={`text-sm space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <div>
                      <strong>Você:</strong>
                      <div className={`mt-1 p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <em>[Cole o prompt acima]</em>
                      </div>
                    </div>
                    <div>
                      <strong>ChatGPT:</strong>
                      <div className={`mt-1 p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        "Sim, estou pronto para gerar fluxogramas! Descreva o processo..."
                      </div>
                    </div>
                    <div>
                      <strong>Você:</strong>
                      <div className={`mt-1 p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        "Crie um fluxo de recuperação de senha para um app mobile"
                      </div>
                    </div>
                    <div>
                      <strong>ChatGPT:</strong>
                      <div className={`mt-1 p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                        <em>[Gerará o fluxo no formato correto que você pode copiar]</em>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t flex justify-between items-center ${
          isDark ? 'bg-[#252525] border-gray-700' : 'bg-gray-50 border-gray-200'
        }`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            💡 Dica: Comece com exemplos simples e aumente a complexidade gradualmente
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
          >
            Entendi!
          </button>
        </div>
      </div>
    </div>
  );
};