import React, { useEffect, useState } from 'react';
import { Connection, FlowNode, OptimizationSuggestion, PerformanceMetrics } from '../types';
import { Theme } from '../hooks/useTheme';
import { usePerformanceAnalyzer } from '../hooks/usePerformanceAnalyzer';
import { ADVANCED_FEATURES } from '../config/advanced';

interface PerformanceDashboardProps {
  nodes: FlowNode[];
  connections: Connection[];
  theme: Theme;
  onApplyOptimization?: (suggestion: OptimizationSuggestion) => void;
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  nodes,
  connections,
  theme,
  onApplyOptimization,
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analyzer = usePerformanceAnalyzer();

  useEffect(() => {
    if (!ADVANCED_FEATURES.performance.enabled) {
      setMetrics(null);
      return;
    }

    let cancelled = false;
    const run = async () => {
      setIsAnalyzing(true);
      const result = await analyzer.analyzePerformance(nodes, connections);
      if (!cancelled) {
        setMetrics(result);
        setIsAnalyzing(false);
      }
    };

    run();
    const interval = setInterval(run, ADVANCED_FEATURES.performance.analysisInterval);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [analyzer, connections, nodes]);

  if (!ADVANCED_FEATURES.performance.enabled) {
    return (
      <div className={`performance-dashboard ${theme}`}>
        <p>Ative a análise avançada para visualizar insights.</p>
      </div>
    );
  }

  if (isAnalyzing && !metrics) {
    return (
      <div className={`performance-dashboard ${theme}`}>
        <div className="loading-spinner" />
        <p>Analisando fluxo...</p>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  const focusNode = (nodeId: string) => {
    console.info('Sugestão para focar no nó:', nodeId);
  };

  return (
    <div className={`performance-dashboard ${theme}`}>
      <div className="score-card">
        <h3>Score de Performance</h3>
        <div className="score-value">{metrics.performanceScore.toFixed(0)} / 100</div>
        <div className="complexity-row">
          <span>Ciclomática: {metrics.complexity.cyclomatic}</span>
          <span>Cognitiva: {metrics.complexity.cognitive}</span>
          <span>Manutenibilidade: {metrics.complexity.maintainability}%</span>
        </div>
      </div>

      <div className="bottlenecks-list">
        <h4>Gargalos</h4>
        {metrics.bottlenecks.length === 0 && <p>Sem gargalos críticos 🎉</p>}
        {metrics.bottlenecks.map(bottleneck => (
          <div key={`${bottleneck.nodeId}-${bottleneck.issue}`} className={`bottleneck ${bottleneck.severity}`}>
            <strong>{bottleneck.issue}</strong>
            <p>{bottleneck.impact}</p>
            <button className="insight-button" onClick={() => focusNode(bottleneck.nodeId)}>
              Focar no nó
            </button>
          </div>
        ))}
      </div>

      <div className="suggestions-list">
        <h4>Sugestões</h4>
        {metrics.optimizationSuggestions.map(suggestion => (
          <div key={suggestion.id} className="suggestion">
            <div className="suggestion-head">
              <span>{suggestion.type}</span>
              <span>Esforço: {suggestion.estimatedEffort}</span>
              <span>Impacto: {suggestion.expectedImpact}</span>
            </div>
            <p>{suggestion.description}</p>
            <ol>
              {suggestion.steps.map(step => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            {onApplyOptimization && (
              <button className="apply-button" onClick={() => onApplyOptimization(suggestion)}>
                Aplicar
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
