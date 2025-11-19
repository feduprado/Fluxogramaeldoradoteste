import React from 'react';
import { Theme } from '../hooks/useTheme';
import { Check, X } from 'lucide-react';

interface ConnectionContextMenuProps {
  position: { x: number; y: number };
  currentLabel?: string;
  onSetLabel: (label: string | undefined) => void;
  onClose: () => void;
  theme: Theme;
}

export const ConnectionContextMenu: React.FC<ConnectionContextMenuProps> = ({
  position,
  currentLabel,
  onSetLabel,
  onClose,
  theme,
}) => {
  const handleSetLabel = (label: string | undefined) => {
    onSetLabel(label);
    onClose();
  };

  return (
    <>
      {/* Overlay invisível para fechar o menu ao clicar fora */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />
      
      {/* Menu contextual */}
      <div
        className={`fixed z-50 rounded-lg shadow-xl border ${
          theme === 'dark' 
            ? 'bg-[#2C2C2C] border-gray-600' 
            : 'bg-white border-gray-200'
        } min-w-48`}
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="p-2">
          <div className={`text-xs font-medium px-2 py-1 mb-1 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            Label da Conexão:
          </div>
          
          <button
            onClick={() => handleSetLabel('Sim')}
            className={`w-full text-left px-3 py-2 text-xs rounded flex items-center justify-between transition-colors ${
              currentLabel === 'Sim'
                ? theme === 'dark' 
                  ? 'bg-green-900/40 text-green-300' 
                  : 'bg-green-100 text-green-700'
                : theme === 'dark' 
                  ? 'hover:bg-green-900/30 text-gray-300' 
                  : 'hover:bg-green-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="font-medium">Sim</span>
            </div>
            {currentLabel === 'Sim' && <Check className="w-4 h-4" />}
          </button>

          <button
            onClick={() => handleSetLabel('Não')}
            className={`w-full text-left px-3 py-2 text-xs rounded flex items-center justify-between transition-colors ${
              currentLabel === 'Não'
                ? theme === 'dark' 
                  ? 'bg-red-900/40 text-red-300' 
                  : 'bg-red-100 text-red-700'
                : theme === 'dark' 
                  ? 'hover:bg-red-900/30 text-gray-300' 
                  : 'hover:bg-red-50 text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="font-medium">Não</span>
            </div>
            {currentLabel === 'Não' && <Check className="w-4 h-4" />}
          </button>

          {currentLabel && (
            <>
              <div className={`my-2 h-px ${
                theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
              }`} />
              
              <button
                onClick={() => handleSetLabel(undefined)}
                className={`w-full text-left px-3 py-2 text-xs rounded flex items-center gap-2 transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-700/50 text-gray-400' 
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <X className="w-3 h-3" />
                <span>Remover label</span>
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};
