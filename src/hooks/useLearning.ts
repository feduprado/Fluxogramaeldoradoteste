import { useCallback, useEffect, useRef, useState } from 'react';
import { ADVANCED_FEATURES } from '../config/advanced';
import { AdaptiveUIChanges, Suggestion, UserAction } from '../types';
import { LearningService } from '../services/learningService';

interface UseLearningResult {
  suggestions: Suggestion[];
  adaptiveUI: AdaptiveUIChanges;
  trackAction: (action: Omit<UserAction, 'timestamp'>) => void;
  dismissSuggestion: (suggestionId: string) => void;
  reloadSuggestions: () => Promise<void>;
}

const disabledResult: UseLearningResult = {
  suggestions: [],
  adaptiveUI: {},
  trackAction: () => undefined,
  dismissSuggestion: () => undefined,
  reloadSuggestions: async () => undefined,
};

export const useLearning = (): UseLearningResult => {
  const enabled = ADVANCED_FEATURES.learning.enabled;
  const learningServiceRef = useRef<LearningService | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [adaptiveUI, setAdaptiveUI] = useState<AdaptiveUIChanges>({});

  useEffect(() => {
    if (!enabled) {
      return;
    }
    learningServiceRef.current = new LearningService();
    setAdaptiveUI(learningServiceRef.current.getAdaptiveUI());
    learningServiceRef.current
      .getPersonalizedSuggestions()
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [enabled]);

  const trackAction = useCallback(
    (action: Omit<UserAction, 'timestamp'>) => {
      if (!enabled || !learningServiceRef.current) {
        return;
      }
      learningServiceRef.current.trackAction(action);
      setAdaptiveUI(learningServiceRef.current.getAdaptiveUI());
    },
    [enabled]
  );

  const dismissSuggestion = useCallback((suggestionId: string) => {
    setSuggestions(prev => prev.filter(suggestion => suggestion.id !== suggestionId));
  }, []);

  const reloadSuggestions = useCallback(async () => {
    if (!enabled || !learningServiceRef.current) {
      return;
    }
    const list = await learningServiceRef.current.getPersonalizedSuggestions();
    setSuggestions(list);
  }, [enabled]);

  if (!enabled) {
    return disabledResult;
  }

  return {
    suggestions,
    adaptiveUI,
    trackAction,
    dismissSuggestion,
    reloadSuggestions,
  };
};
