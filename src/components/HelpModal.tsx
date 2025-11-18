import React from 'react';
import { Theme } from '../hooks/useTheme';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, theme }) => {
  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const shortcuts = [
    { category: 'Adicionar Nós', items: [
      { keys: 'Ctrl + 1', description: 'Adicionar nó Início' },
      { keys: 'Ctrl + 2', description: 'Adicionar nó Processo' },
      { keys: 'Ctrl + 3', description: 'Adicionar nó Decisão' },
      { keys: 'Ctrl + 4', description: 'Adicionar nó Fim' },
    ]},
    { category: 'Edição', items: [
      { keys: 'Ctrl + Z', description: 'Desfazer última ação' },
      { keys: 'Ctrl + Y', description: 'Refazer ação' },
      { keys: 'Ctrl + Shift + Z', description: 'Refazer ação (alternativo)' },
      { keys: 'Delete / Backspace', description: 'Excluir nó selecionado' },
      { keys: 'Ctrl + D', description: 'Duplicar nó selecionado' },
      { keys: 'Duplo Clique', description: 'Editar texto do nó' },
    ]},
    { category: 'Navegação', items: [
      { keys: 'Tab', description: 'Selecionar próximo nó' },
      { keys: 'Shift + Tab', description: 'Selecionar nó anterior' },
      { keys: 'Shift + Mouse', description: 'Arrastar nó com o mouse 🖱️' },
      { keys: 'Botão do Meio 🖱️', description: 'Arrastar canvas (scroll do mouse)' },
      { keys: 'Setas ← → ↑ ↓', description: 'Mover nó selecionado (10px) 🚀' },
      { keys: 'Shift + Setas', description: 'Mover nó RÁPIDO (50px) ⚡' },
    ]},
    { category: 'Visualização', items: [
      { keys: 'Ctrl + +', description: 'Zoom in' },
      { keys: 'Ctrl + -', description: 'Zoom out' },
      { keys: 'Ctrl + 0', description: 'Resetar zoom e centralizar' },
      { keys: 'Ctrl + ↑ ↓', description: 'Zoom in/out (alternativo)' },
    ]},
    { category: 'Conexões', items: [
      { keys: 'Botão + no nó', description: 'Iniciar conexão' },
      { keys: 'Clicar em outro nó', description: 'Finalizar conexão' },
      { keys: 'Esc', description: 'Cancelar conexão temporária' },
    ]},
    { category: 'Arquivo', items: [
      { keys: 'Ctrl + S', description: 'Exportar fluxograma (JSON)' },
      { keys: 'Ctrl + O', description: 'Importar fluxograma (JSON)' },
    ]},
    { category: 'Ajuda', items: [
      { keys: 'F1', description: 'Abrir esta janela de ajuda' },
    ]},
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className={`rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-[#1E1E1E]' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
            ⌨️ Atalhos do Teclado
          </h2>
          <button
            onClick={onClose}
            className={`text-2xl w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
              isDark 
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
            }`}
          >
            ×
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {shortcuts.map((section, idx) => (
            <div key={idx}>
              <h3 className={`mb-3 pb-2 border-b font-medium ${
                isDark 
                  ? 'text-gray-300 border-gray-700' 
                  : 'text-gray-700 border-gray-200'
              }`}>
                {section.category}
              </h3>
              <div className="space-y-2">
                {section.items.map((shortcut, index) => (
                  <div key={index} className="flex justify-between items-center py-1.5">
                    <kbd className={`px-2 py-1 border rounded text-xs font-mono ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-gray-300' 
                        : 'bg-gray-100 border-gray-300 text-gray-700'
                    }`}>
                      {shortcut.keys}
                    </kbd>
                    <span className={`text-sm ml-3 flex-1 text-right ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {shortcut.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className={`mt-6 pt-4 border-t flex justify-between items-center ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}>
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            💡 Dica: No Mac, use Cmd ao invés de Ctrl
          </div>
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg transition-colors font-medium ${
              isDark 
                ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
