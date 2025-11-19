import React, { useState, useEffect } from 'react';
import { Theme } from '../hooks/useTheme';
import { Key, Check, X, AlertCircle, Eye, EyeOff, ExternalLink } from 'lucide-react';

interface APIKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  onKeysUpdated: () => void;
}

interface APIKeyConfig {
  provider: string;
  name: string;
  icon: string;
  placeholder: string;
  url: string;
  description: string;
  isFree: boolean;
}

const API_CONFIGS: APIKeyConfig[] = [
  {
    provider: 'gemini',
    name: 'Google Gemini Flash',
    icon: '⚡',
    placeholder: 'AIzaSy...',
    url: 'https://aistudio.google.com/app/apikey',
    description: 'GRÁTIS - Modelo rápido e eficiente do Google',
    isFree: true,
  },
  {
    provider: 'chatgpt',
    name: 'ChatGPT 4 (OpenAI)',
    icon: '🤖',
    placeholder: 'sk-...',
    url: 'https://platform.openai.com/api-keys',
    description: 'PAGO - Requer créditos na conta OpenAI',
    isFree: false,
  },
  {
    provider: 'deepseek',
    name: 'DeepSeek',
    icon: '🔍',
    placeholder: 'sk-...',
    url: 'https://platform.deepseek.com/api_keys',
    description: 'GRATUITO/PAGO - Alternativa interessante',
    isFree: true,
  },
];

export const APIKeyManager: React.FC<APIKeyManagerProps> = ({
  isOpen,
  onClose,
  theme,
  onKeysUpdated,
}) => {
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Carregar chaves do localStorage
      const loadedKeys: Record<string, string> = {};
      API_CONFIGS.forEach(config => {
        const key = localStorage.getItem(`VITE_${config.provider.toUpperCase()}_API_KEY`);
        if (key) {
          loadedKeys[config.provider] = key;
        }
      });
      setKeys(loadedKeys);
    }
  }, [isOpen]);

  const handleKeyChange = (provider: string, value: string) => {
    setKeys(prev => ({
      ...prev,
      [provider]: value,
    }));
  };

  const handleSave = () => {
    // Salvar no localStorage
    API_CONFIGS.forEach(config => {
      const key = keys[config.provider];
      const storageKey = `VITE_${config.provider.toUpperCase()}_API_KEY`;
      
      if (key && key.trim()) {
        localStorage.setItem(storageKey, key.trim());
        console.log(`✅ Salvando chave ${storageKey}:`, key.trim().substring(0, 10) + '...');
      } else {
        localStorage.removeItem(storageKey);
        console.log(`🗑️ Removendo chave ${storageKey}`);
      }
    });

    // Verificar o que foi salvo
    console.log('📦 localStorage após salvar:', {
      gemini: localStorage.getItem('VITE_GEMINI_API_KEY'),
      chatgpt: localStorage.getItem('VITE_OPENAI_API_KEY'),
      deepseek: localStorage.getItem('VITE_DEEPSEEK_API_KEY'),
    });

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
    
    // Notificar que as chaves foram atualizadas
    onKeysUpdated();
  };

  const handleClear = (provider: string) => {
    setKeys(prev => ({
      ...prev,
      [provider]: '',
    }));
    localStorage.removeItem(`VITE_${provider.toUpperCase()}_API_KEY`);
    onKeysUpdated();
  };

  const toggleShowKey = (provider: string) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider],
    }));
  };

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className={`${isDark ? 'bg-[#2C2C2C] text-gray-100' : 'bg-white text-gray-900'} rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl`}>
        
        {/* Header */}
        <div className={`flex justify-between items-center p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
              <Key className="w-6 h-6 text-purple-500" />
              Configurar Chaves de API
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Configure suas chaves de API para usar IA real ao gerar fluxogramas
            </p>
          </div>
          <button
            onClick={onClose}
            className={`${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'} text-2xl transition-colors`}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="space-y-4">
            {/* Info Box */}
            <div className={`p-4 rounded-lg border ${isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-blue-300' : 'text-blue-800'}`}>
                    🔒 Suas chaves são armazenadas apenas no seu navegador
                  </p>
                  <p className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'} mt-1`}>
                    As chaves ficam salvas no localStorage do navegador e nunca são enviadas para nenhum servidor externo (exceto as APIs oficiais).
                  </p>
                </div>
              </div>
            </div>

            {/* API Key Inputs */}
            {API_CONFIGS.map((config) => (
              <div
                key={config.provider}
                className={`p-4 rounded-lg border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{config.icon}</span>
                    <div>
                      <h3 className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        {config.name}
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {config.isFree && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded">
                      GRÁTIS
                    </span>
                  )}
                </div>

                {/* API Key Input */}
                <div className="space-y-2">
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Chave da API:
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showKeys[config.provider] ? 'text' : 'password'}
                        value={keys[config.provider] || ''}
                        onChange={(e) => handleKeyChange(config.provider, e.target.value)}
                        placeholder={config.placeholder}
                        className={`w-full px-3 py-2 pr-10 rounded-lg border ${
                          isDark
                            ? 'bg-gray-900 border-gray-600 text-gray-100 placeholder-gray-500'
                            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                        } focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm`}
                      />
                      <button
                        onClick={() => toggleShowKey(config.provider)}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 ${
                          isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        {showKeys[config.provider] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {keys[config.provider] && (
                      <button
                        onClick={() => handleClear(config.provider)}
                        className={`px-3 py-2 rounded-lg ${
                          isDark
                            ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        } transition-colors`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Get API Key Link */}
                <a
                  href={config.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 text-xs mt-2 ${
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                  } transition-colors`}
                >
                  <ExternalLink className="w-3 h-3" />
                  Obter chave da API
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
          <div className="flex items-center gap-2">
            {savedMessage && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <Check className="w-4 h-4" />
                <span>Chaves salvas com sucesso!</span>
              </div>
            )}
          </div>
          <div className="flex gap-3">
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
              onClick={handleSave}
              className="px-6 py-2 rounded-lg font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              Salvar Chaves
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};