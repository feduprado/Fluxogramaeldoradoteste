import React from 'react';
import { AIAnalysis, AISuggestion, FlowNode } from '../../types';
import { Theme } from '../../hooks/useTheme';

interface AIAnalysisPanelProps {
  nodes: FlowNode[];
  analysis: AIAnalysis | null;
  suggestions: AISuggestion[];
  onAnalyze: () => Promise<void>;
  onGetSuggestions: () => Promise<void>;
  isProcessing: boolean;
  theme: Theme;
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({
  nodes,
  analysis,
  suggestions,
  onAnalyze,
  onGetSuggestions,
  isProcessing,
  theme,
}) => {
  const isDisabled = nodes.length === 0 || isProcessing;
  const baseCard = theme === 'dark' ? 'bg-[#1E1E1E] text-gray-200' : 'bg-white text-gray-800';

  return (
    <div className={`rounded-xl shadow-lg p-4 border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} ${baseCard}`}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-purple-400">Gemini 2.5 Pro</p>
          <h3 className="text-lg font-semibold">Análise Inteligente</h3>
        </div>
        <button
          onClick={onAnalyze}
          disabled={isDisabled}
          className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
            isDisabled
              ? 'bg-purple-300 text-white cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-500 text-white'
          }`}
        >
          {isProcessing ? 'Analisando...' : 'Analisar Fluxo'}
        </button>
      </div>

      {analysis ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>Complexidade estimada</span>
            <strong className="text-purple-400 uppercase">{analysis.complexity}</strong>
          </div>
          {analysis.estimatedTime && (
            <div className="text-sm text-gray-400">
              Tempo estimado de ajustes: <strong className="text-white">{analysis.estimatedTime}</strong>
            </div>
          )}
          <div>
            <h4 className="text-sm font-semibold mb-2">Alertas</h4>
            <div className="space-y-2">
              {analysis.potentialIssues?.map((issue, index) => (
                <div key={index} className="text-xs px-3 py-2 rounded-lg bg-red-500/10 text-red-300">
                  ⚠️ {issue}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Solicite a análise para receber feedback estruturado.</p>
      )}

      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold">Sugestões da IA</h4>
          <button
            onClick={onGetSuggestions}
            className="text-xs text-purple-400 hover:text-purple-300"
            disabled={isProcessing || nodes.length === 0}
          >
            Atualizar sugestões
          </button>
        </div>
        {suggestions.length === 0 ? (
          <p className="text-sm text-gray-400">Nenhuma sugestão disponível ainda.</p>
        ) : (
          <div className="space-y-2 max-h-40 overflow-auto pr-1">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className={`text-sm px-3 py-2 rounded-lg border ${
                  suggestion.priority === 'high'
                    ? 'border-red-500/50 text-red-300'
                    : suggestion.priority === 'medium'
                    ? 'border-yellow-500/50 text-yellow-200'
                    : 'border-emerald-500/50 text-emerald-200'
                }`}
              >
                <strong className="uppercase mr-2">{suggestion.type}</strong>
                {suggestion.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
