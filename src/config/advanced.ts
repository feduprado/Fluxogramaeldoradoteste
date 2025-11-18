export const ADVANCED_FEATURES = {
  collaboration: {
    enabled: (import.meta.env.VITE_COLLABORATION_ENABLED ?? 'true') === 'true',
    serverUrl: import.meta.env.VITE_WS_SERVER_URL || '',
    maxUsers: Number(import.meta.env.VITE_COLLABORATION_MAX_USERS || 50),
    reconnectAttempts: Number(import.meta.env.VITE_COLLABORATION_RECONNECTS || 5),
  },
  learning: {
    enabled: (import.meta.env.VITE_LEARNING_ENABLED ?? 'true') === 'true',
    dataCollection: (import.meta.env.VITE_COLLECT_ANONYMOUS_DATA ?? 'false') === 'true',
    suggestionInterval: Number(import.meta.env.VITE_SUGGESTION_INTERVAL || 30 * 60 * 1000),
  },
  performance: {
    enabled: (import.meta.env.VITE_PERFORMANCE_ANALYSIS_ENABLED ?? 'true') === 'true',
    analysisInterval: Number(import.meta.env.VITE_PERFORMANCE_INTERVAL || 2 * 60 * 1000),
    maxBottlenecks: Number(import.meta.env.VITE_MAX_BOTTLENECKS || 10),
  },
} as const;
