import { AdaptiveUIChanges, Suggestion, UserAction } from '../types';
import { ADVANCED_FEATURES } from '../config/advanced';

interface StoredBehavior {
  actions: UserAction[];
  skillLevel: 'beginner' | 'intermediate' | 'expert';
}

const STORAGE_KEY = 'fluxograma-learning';

const defaultBehavior: StoredBehavior = {
  actions: [],
  skillLevel: 'beginner',
};

export class LearningService {
  private behavior: StoredBehavior = defaultBehavior;

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.behavior = { ...defaultBehavior, ...JSON.parse(stored) };
      }
    }
  }

  trackAction(action: Omit<UserAction, 'timestamp'>) {
    if (!ADVANCED_FEATURES.learning.enabled) {
      return;
    }

    const fullAction: UserAction = { ...action, timestamp: Date.now() };
    this.behavior.actions = [...this.behavior.actions.slice(-100), fullAction];
    this.behavior.skillLevel = this.inferSkillLevel();
    this.persist();
  }

  async getPersonalizedSuggestions(): Promise<Suggestion[]> {
    if (!ADVANCED_FEATURES.learning.enabled) {
      return [];
    }

    const suggestions: Suggestion[] = [];
    const frequentNodeAdds = this.behavior.actions.filter(action => action.type === 'node_added').length;
    const hasShortcuts = this.behavior.actions.some(action => action.type.includes('shortcut'));

    if (frequentNodeAdds > 3 && !hasShortcuts) {
      suggestions.push({
        id: 'shortcut-copy-flow',
        type: 'shortcut',
        title: 'Use atalhos para acelerar',
        description: 'Pressione Ctrl + D para duplicar nós rapidamente.',
        reason: 'Detectamos várias adições repetidas de nós semelhantes.',
        priority: 'medium',
        action: 'shortcut:duplicate-node',
      });
    }

    if (!this.behavior.actions.some(action => action.type === 'template_applied')) {
      suggestions.push({
        id: 'template-starter',
        type: 'template',
        title: 'Experimente um template pronto',
        description: 'Os templates otimizam fluxos comuns como onboarding ou suporte.',
        reason: 'Nenhum template foi aplicado ainda.',
        priority: 'low',
        action: 'template:onboarding',
      });
    }

    if (this.behavior.skillLevel === 'expert') {
      suggestions.push({
        id: 'optimize-workflow',
        type: 'optimization',
        title: 'Agrupe ações repetitivas',
        description: 'Use o menu de múltipla seleção para mover blocos inteiros.',
        reason: 'Usuários avançados costumam se beneficiar de macros.',
        priority: 'high',
        action: 'feature:batch-edit',
      });
    }

    return suggestions;
  }

  getAdaptiveUI(): AdaptiveUIChanges {
    switch (this.behavior.skillLevel) {
      case 'expert':
        return {
          showTutorials: false,
          simplifiedToolbar: false,
          contextHelp: false,
          advancedFeatures: true,
          expertShortcuts: true,
        };
      case 'intermediate':
        return {
          showTutorials: false,
          simplifiedToolbar: false,
          contextHelp: true,
          advancedFeatures: true,
        };
      default:
        return {
          showTutorials: true,
          simplifiedToolbar: true,
          contextHelp: true,
          advancedFeatures: false,
        };
    }
  }

  private inferSkillLevel(): StoredBehavior['skillLevel'] {
    const shortcutActions = this.behavior.actions.filter(action => action.type.includes('shortcut')).length;
    if (shortcutActions > 5) {
      return 'expert';
    }
    if (shortcutActions > 2) {
      return 'intermediate';
    }
    return 'beginner';
  }

  private persist() {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.behavior));
  }
}
