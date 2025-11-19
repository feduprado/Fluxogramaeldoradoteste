import React, { useState, useEffect } from 'react';
import { AIParsedFlow, FlowNode } from '../types';
import { FlowInterpreter } from '../services/flowInterpreter';
import { AIService } from '../services/aiService';
import { Theme } from '../hooks/useTheme';
import { Sparkles, Check, X, AlertCircle, Settings } from 'lucide-react';
import { APIKeyManager } from './APIKeyManager';

interface AIModalEnhancedProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFlow: (flow: AIParsedFlow) => void;
  theme: Theme;
  existingNodes?: FlowNode[]; // 🆕 Nós existentes no canvas
}

export const AIModalEnhanced: React.FC<AIModalEnhancedProps> = ({
  isOpen,
  onClose,
  onApplyFlow,
  theme,
  existingNodes = [], // 🆕 Nós existentes (padrão vazio)
}) => {
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFlow, setPreviewFlow] = useState<AIParsedFlow | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('gemini');
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'ai' | 'examples'>('ai');
  const [error, setError] = useState<string | null>(null);
  const [showKeyManager, setShowKeyManager] = useState(false);

  const interpreter = FlowInterpreter.getInstance();
  const aiService = AIService.getInstance();

  useEffect(() => {
    const initAI = async () => {
      await aiService.initialize();
      const providers = aiService.getAvailableProviders();
      console.log('🔍 Provedores disponíveis:', providers);
      setAvailableProviders(providers);
      if (providers.length > 0 && !providers.includes(selectedProvider)) {
        console.log('🔄 Alterando provedor padrão para:', providers[0]);
        setSelectedProvider(providers[0]);
      }
    };
    initAI();
  }, []);

  const handleKeysUpdated = async () => {
    // Reinicializar o serviço de IA
    await aiService.reinitialize();
    const providers = aiService.getAvailableProviders();
    console.log('🔄 Provedores atualizados:', providers);
    setAvailableProviders(providers);
    
    // Selecionar o primeiro provedor real se disponível
    if (providers.length > 0) {
      const firstRealProvider = providers.find(p => p !== 'mock') || providers[0];
      setSelectedProvider(firstRealProvider);
    }
    
    setShowKeyManager(false);
  };

  const examplePrompts = [
    {
      title: '🚀 Processo de Login',
      description: 'Sistema de autenticação com validação e recuperação',
      prompt: 'Sistema de login com validação de email, verificação de 2 fatores e recuperação de senha',
    },
    {
      title: '🛒 E-commerce Completo',
      description: 'Fluxo de compra desde seleção até confirmação',
      prompt: 'Fluxo de compra em e-commerce desde a seleção do produto, carrinho, pagamento até confirmação',
    },
    {
      title: '📊 Dashboard Analítico',
      description: 'Sistema de dashboard com filtros e relatórios',
      prompt: 'Dashboard analítico com filtros, visualizações, exportação de dados e relatórios customizados',
    },
    {
      title: '🎯 Onboarding de Usuário',
      description: 'Processo de boas-vindas e configuração inicial',
      prompt: 'Onboarding de usuário com tutorial interativo, configuração inicial e personalização de preferências',
    },
    {
      title: '💳 Processo de Pagamento',
      description: 'Fluxo completo de checkout e pagamento',
      prompt: 'Processo de pagamento com validação de cartão, processamento seguro e confirmação de compra',
    },
    {
      title: '📱 Aplicativo Mobile',
      description: 'Fluxo principal de um app mobile',
      prompt: 'Fluxo principal de aplicativo mobile incluindo splash screen, login, home e navegação principal',
    },
  ];

  const handleGenerateWithAI = async () => {
    if (!text.trim()) {
      setError('Por favor, descreva o processo que você quer no fluxograma.');
      return;
    }

    if (availableProviders.length === 0) {
      setError('Nenhum provedor de IA disponível. Verifique suas configurações.');
      return;
    }

    setIsProcessing(true);
    setPreviewFlow(null);
    setError(null);

    try {
      console.log(`🤖 Gerando com ${selectedProvider}...`);
      const flowchartText = await aiService.generateFlowchart(text, selectedProvider);
      console.log('📝 Texto gerado:', flowchartText);
      
      // ⚡ NOVO: Passa nós existentes para evitar sobreposição
      console.log('📊 Nós existentes no canvas:', existingNodes.length);
      const flow = interpreter.interpretText(flowchartText, existingNodes);
      setPreviewFlow(flow);
      
      if (flow.nodes.length === 0) {
        setError('Nenhum nó foi gerado. Tente reformular sua descrição.');
      }
    } catch (error: any) {
      console.error('❌ Erro ao gerar fluxograma:', error);
      setError(error.message || 'Erro ao gerar fluxograma. Tente novamente.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUseExample = (prompt: string) => {
    setText(prompt);
    setActiveTab('ai');
  };

  const handleApply = () => {
    if (previewFlow) {
      onApplyFlow(previewFlow);
      onClose();
    }
  };

  const providerConfig = {
    gemini: { name: 'Gemini Flash', icon: '⚡', color: 'bg-blue-500' },
    chatgpt: { name: 'ChatGPT 4', icon: '🤖', color: 'bg-green-500' },
    deepseek: { name: 'DeepSeek', icon: '🔍', color: 'bg-purple-500' },
    mock: { name: 'Demo (Offline)', icon: '⚙️', color: 'bg-gray-500' },
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {/* API Key Manager Modal */}
      <APIKeyManager
        isOpen={showKeyManager}
        onClose={() => setShowKeyManager(false)}
        theme={theme}
        onKeysUpdated={handleKeysUpdated}
      />
      
      <div className={`${isDark ? 'bg-[#2C2C2C] text-gray-100' : 'bg-white text-gray-900'} rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <Sparkles className="w-6 h-6 text-purple-500" />
              Gerador de Fluxogramas com IA
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Descreva seu processo e a IA criará um fluxograma horizontal com containers automaticamente
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyManager(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              title="Configurar chaves de API"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-2xl transition-colors`}
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden flex">
          
          {/* Painel Esquerdo - Input */}
          <div className={`flex-1 p-6 border-r ${isDark ? 'border-gray-700' : 'border-gray-200'} flex flex-col`}>
            
            {/* Tabs */}
            <div className={`flex border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} mb-4`}>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'ai'
                    ? `border-b-2 border-purple-500 ${isDark ? 'text-purple-400' : 'text-purple-600'}`
                    : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Assistente IA
                </span>
              </button>
              <button
                onClick={() => setActiveTab('examples')}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === 'examples'
                    ? `border-b-2 border-purple-500 ${isDark ? 'text-purple-400' : 'text-purple-600'}`
                    : `${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`
                }`}
              >
                📋 Exemplos Prontos
              </button>
            </div>

            {activeTab === 'examples' ? (
              <div className="space-y-3 overflow-auto flex-1">
                <h3 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>
                  📋 Clique para usar um exemplo:
                </h3>
                {examplePrompts.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => handleUseExample(example.prompt)}
                    className={`w-full text-left p-4 border rounded-lg transition-all ${
                      isDark 
                        ? 'border-gray-700 hover:border-purple-500 hover:bg-gray-800' 
                        : 'border-gray-200 hover:border-purple-500 hover:bg-purple-50'
                    }`}
                  >
                    <div className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                      {example.title}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                      {example.description}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <>
                {/* Seletor de Provedor */}
                <div className="mb-4">
                  <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                    Escolha o provedor de IA:
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {availableProviders.map((provider) => (
                      <label 
                        key={provider} 
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedProvider === provider
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : isDark
                            ? 'border-gray-700 hover:border-gray-600'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => {
                          console.log('🖱️ Clicou no provedor:', provider);
                          console.log('📌 Provedor atual:', selectedProvider);
                          setSelectedProvider(provider);
                        }}
                      >
                        <input
                          type="radio"
                          value={provider}
                          checked={selectedProvider === provider}
                          onChange={(e) => setSelectedProvider(e.target.value)}
                          className="text-purple-600 focus:ring-purple-500 pointer-events-none"
                        />
                        <span className="text-lg">
                          {providerConfig[provider as keyof typeof providerConfig]?.icon}
                        </span>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                          {providerConfig[provider as keyof typeof providerConfig]?.name}
                        </span>
                      </label>
                    ))}
                  </div>
                  {availableProviders.length === 0 && (
                    <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        Nenhum provedor configurado. Configure as API keys nas variáveis de ambiente.
                      </p>
                    </div>
                  )}
                  {availableProviders.length === 1 && availableProviders.includes('mock') && (
                    <div className="mt-2 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                      <div className="flex items-start gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          💡 Quer usar IA real? Configure suas chaves de API!
                        </p>
                      </div>
                      <button
                        onClick={() => setShowKeyManager(true)}
                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Settings className="w-4 h-4" />
                        Configurar Chaves de API
                      </button>
                      <p className="text-xs text-blue-500 dark:text-blue-400 mt-2">
                        Suporta: Google Gemini 2.5 Pro (GRÁTIS) • ChatGPT 4 • DeepSeek
                      </p>
                    </div>
                  )}
                </div>

                <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                  Descreva o processo que você quer criar:
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Exemplo: Quero um fluxograma para um sistema de reservas de hotel com busca, seleção de quartos, pagamento e confirmação. Use containers para agrupar o processo de pagamento."
                  className={`flex-1 w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm ${
                    isDark 
                      ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                  rows={10}
                />
                
                {error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg flex items-start gap-2">
                    <X className="w-4 h-4 text-red-600 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                  </div>
                )}

                <div className="mt-4 flex justify-between items-center">
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {text.length} caracteres
                  </div>
                  <button
                    onClick={handleGenerateWithAI}
                    disabled={!text.trim() || isProcessing || availableProviders.length === 0}
                    className={`px-6 py-2.5 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                      !text.trim() || isProcessing || availableProviders.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Gerando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Gerar Fluxograma</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Painel Direito - Preview */}
          <div className="flex-1 p-6 flex flex-col">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-4`}>
              Prévia do Fluxograma
            </h3>
            
            {previewFlow ? (
              <div className={`flex-1 border rounded-lg p-4 overflow-auto ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="space-y-3">
                  {/* Containers */}
                  {previewFlow.containers && previewFlow.containers.map((container) => (
                    <div key={container.id} className={`flex items-start space-x-3 ${isDark ? 'bg-gray-900' : 'bg-white'} p-3 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                      <div className="w-4 h-4 rounded-full mt-1 flex-shrink-0 bg-purple-500" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                            📦 {container.name}
                          </div>
                          <span className="text-xs text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded">
                            Container
                          </span>
                        </div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
                          {container.nodes.length} nós • {container.size.width}x{container.size.height}px
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Nós */}
                  {previewFlow.nodes.map((node) => (
                    <div key={node.id} className={`flex items-start space-x-3 ${isDark ? 'bg-gray-900' : 'bg-white'} p-3 rounded-lg border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-sm`}>
                      <div className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                        node.type === 'start' ? 'bg-green-500' :
                        node.type === 'end' ? 'bg-red-500' :
                        node.type === 'decision' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div className={`text-sm font-medium ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                            {node.text}
                          </div>
                          <span className={`text-xs capitalize px-2 py-1 rounded ${
                            isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {node.type}
                          </span>
                        </div>
                        {node.containerId && (
                          <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                            Dentro de container
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Estatísticas */}
                <div className={`mt-4 p-3 rounded border ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                  <div className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    📊 Estatísticas do Fluxo:
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <div className="font-semibold text-green-700 dark:text-green-400">
                        {previewFlow.nodes.filter(n => n.type === 'start').length}
                      </div>
                      <div className="text-green-600 dark:text-green-500">Início</div>
                    </div>
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <div className="font-semibold text-blue-700 dark:text-blue-400">
                        {previewFlow.nodes.filter(n => n.type === 'process').length}
                      </div>
                      <div className="text-blue-600 dark:text-blue-500">Processos</div>
                    </div>
                    <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                      <div className="font-semibold text-yellow-700 dark:text-yellow-400">
                        {previewFlow.nodes.filter(n => n.type === 'decision').length}
                      </div>
                      <div className="text-yellow-600 dark:text-yellow-500">Decisões</div>
                    </div>
                    <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                      <div className="font-semibold text-purple-700 dark:text-purple-400">
                        {previewFlow.containers?.length || 0}
                      </div>
                      <div className="text-purple-600 dark:text-purple-500">Containers</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`flex-1 border rounded-lg p-8 flex items-center justify-center ${
                isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
              }`}>
                <div className="text-center">
                  <Sparkles className={`w-12 h-12 mx-auto mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    O fluxograma aparecerá aqui
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {activeTab === 'ai' 
                      ? 'Descreva o processo e clique em "Gerar Fluxograma"' 
                      : 'Escolha um exemplo para começar'}
                  </p>
                </div>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                disabled={!previewFlow}
                className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  !previewFlow
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg'
                }`}
              >
                <Check className="w-4 h-4" />
                Aplicar ao Canvas
              </button>
            </div>
          </div>
        </div>

        {/* Footer com Dicas */}
        <div className={`p-4 border-t ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-start space-x-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-purple-900/30' : 'bg-purple-100'
            }`}>
              <span className="text-purple-600 text-sm">💡</span>
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                Dicas para melhor uso da IA:
              </p>
              <ul className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1 space-y-1`}>
                <li>• Seja específico: "sistema de login com verificação em 2 etapas"</li>
                <li>• Mencione containers: "agrupe o processo de pagamento em um container"</li>
                <li>• Use os exemplos prontos para testar rapidamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};