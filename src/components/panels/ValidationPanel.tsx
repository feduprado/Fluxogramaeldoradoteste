import React from 'react';
import { ValidationIssue } from '../../types';
import { Theme } from '../../hooks/useTheme';

interface ValidationPanelProps {
  issues: ValidationIssue[];
  onValidate: () => Promise<void>;
  isValidating: boolean;
  theme: Theme;
}

export const ValidationPanel: React.FC<ValidationPanelProps> = ({
  issues,
  onValidate,
  isValidating,
  theme,
}) => {
  const hasIssues = issues.length > 0;

  return (
    <div className={`rounded-xl shadow-lg p-4 border ${theme === 'dark' ? 'border-gray-700 bg-[#111]' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">🔍 Validação do Fluxo</h3>
        <button
          onClick={onValidate}
          disabled={isValidating}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            isValidating ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {isValidating ? 'Validando...' : 'Validar agora'}
        </button>
      </div>

      {hasIssues ? (
        <div className="space-y-2 max-h-48 overflow-auto pr-1">
          {issues.map((issue, index) => (
            <div
              key={issue.elementId + index}
              className={`flex items-start gap-2 p-3 rounded-lg border ${
                issue.severity === 'high'
                  ? 'border-red-500/40 text-red-300'
                  : 'border-yellow-500/40 text-yellow-200'
              }`}
            >
              <span>{issue.severity === 'high' ? '❌' : '⚠️'}</span>
              <div>
                <p className="text-sm">{issue.message}</p>
                <p className="text-xs text-gray-400">ID: {issue.elementId}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-emerald-400">✅ Fluxograma válido e otimizado!</p>
      )}
    </div>
  );
};
