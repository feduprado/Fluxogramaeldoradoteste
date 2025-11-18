import React from 'react';
import { ExportFormat } from '../../types';
import { Theme } from '../../hooks/useTheme';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => Promise<void>;
  isExporting: boolean;
  theme: Theme;
}

const exportOptions: { label: string; format: ExportFormat; icon: string }[] = [
  { label: 'JSON com documentação', format: 'json', icon: '📊' },
  { label: 'SVG anotado', format: 'svg', icon: '🖼️' },
  { label: 'Markdown completo', format: 'markdown', icon: '📝' },
];

export const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, isExporting, theme }) => {
  return (
    <div className={`rounded-xl shadow-lg p-4 border ${theme === 'dark' ? 'border-gray-700 bg-[#1b1b1b]' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">📤 Exportação Inteligente</h3>
        {isExporting && <span className="text-xs text-purple-400 animate-pulse">Gerando arquivo...</span>}
      </div>
      <div className="space-y-2">
        {exportOptions.map(option => (
          <button
            key={option.format}
            onClick={() => onExport(option.format)}
            disabled={isExporting}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium border ${
              theme === 'dark'
                ? 'border-gray-600 hover:bg-white/5 text-gray-200'
                : 'border-gray-200 hover:bg-gray-50 text-gray-700'
            } ${isExporting ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <span className="flex items-center gap-2">
              <span>{option.icon}</span>
              {option.label}
            </span>
            <span className="text-xs">{isExporting ? '...' : 'Exportar'}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
