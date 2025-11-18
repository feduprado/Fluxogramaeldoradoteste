import React from 'react';
import { Suggestion } from '../types';
import { Theme } from '../hooks/useTheme';

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
  onDismiss: (id: string) => void;
  onApply: (suggestion: Suggestion) => void;
  theme: Theme;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({ suggestions, onDismiss, onApply, theme }) => {
  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className={`smart-suggestions ${theme}`}>
      <h3>💡 Sugestões inteligentes</h3>
      {suggestions.map(suggestion => (
        <div key={suggestion.id} className={`suggestion-card ${suggestion.priority}`}>
          <div className="suggestion-card-header">
            <span className="type">{suggestion.type}</span>
            <span className="priority">Prioridade: {suggestion.priority}</span>
          </div>
          <h4>{suggestion.title}</h4>
          <p>{suggestion.description}</p>
          <p className="reason">{suggestion.reason}</p>
          <div className="actions">
            <button onClick={() => onApply(suggestion)}>Aplicar</button>
            <button onClick={() => onDismiss(suggestion.id)}>Ignorar</button>
          </div>
        </div>
      ))}
    </div>
  );
};
