import { useCallback, useState } from 'react';
import {
  AIAnalysis,
  Connection,
  FlowNode,
  ValidationIssue,
  ValidationResult,
} from '../types';

interface UseFlowValidationOptions {
  aiAnalyzer?: (nodes: FlowNode[], connections: Connection[]) => Promise<AIAnalysis>;
}

const calculateFlowQualityScore = (nodes: FlowNode[], connections: Connection[]) => {
  if (nodes.length === 0) return 0;
  const connectedNodes = new Set(connections.flatMap(conn => [conn.fromNodeId, conn.toNodeId]));
  const ratio = connectedNodes.size / nodes.length;
  return Math.round(ratio * 100);
};

export const useFlowValidation = (
  nodes: FlowNode[],
  connections: Connection[],
  options?: UseFlowValidationOptions
) => {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const performBasicValidation = useCallback((): ValidationIssue[] => {
    const detectedIssues: ValidationIssue[] = [];

    const connectedNodeIds = new Set<string>();
    connections.forEach(conn => {
      connectedNodeIds.add(conn.fromNodeId);
      connectedNodeIds.add(conn.toNodeId);
    });

    nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id) && nodes.length > 1) {
        detectedIssues.push({
          type: 'warning',
          message: `Nó "${node.text}" não está conectado.`,
          elementId: node.id,
          severity: 'medium',
        });
      }
    });

    connections.forEach(conn => {
      const fromNode = nodes.find(n => n.id === conn.fromNodeId);
      if (fromNode?.type === 'decision' && !conn.label) {
        detectedIssues.push({
          type: 'error',
          message: `Decisão "${fromNode.text}" precisa de rótulos Sim/Não.`,
          elementId: conn.id,
          severity: 'high',
        });
      }
    });

    return detectedIssues;
  }, [connections, nodes]);

  const convertAIToIssues = useCallback((analysis: AIAnalysis): ValidationIssue[] => {
    return (analysis.suggestions || []).map((suggestion, index) => ({
      type: suggestion.type === 'warning' ? 'warning' : 'error',
      message: suggestion.message,
      elementId: `ai-${index}`,
      severity: suggestion.priority === 'high' ? 'high' : suggestion.priority === 'medium' ? 'medium' : 'low',
    }));
  }, []);

  const validateFlowchart = useCallback(async (): Promise<ValidationResult> => {
    setIsValidating(true);
    const baseIssues = performBasicValidation();
    let combinedIssues = [...baseIssues];

    if (options?.aiAnalyzer && nodes.length > 5) {
      try {
        const aiAnalysis = await options.aiAnalyzer(nodes, connections);
        combinedIssues = [...combinedIssues, ...convertAIToIssues(aiAnalysis)];
      } catch (error) {
        console.warn('Validação IA indisponível, mantendo validação básica.', error);
      }
    }

    setIssues(combinedIssues);
    setIsValidating(false);

    return {
      isValid: combinedIssues.every(issue => issue.severity !== 'high'),
      issues: combinedIssues,
      score: calculateFlowQualityScore(nodes, connections),
    };
  }, [connections, convertAIToIssues, nodes, options?.aiAnalyzer, performBasicValidation]);

  const clearIssues = useCallback(() => setIssues([]), []);

  return {
    issues,
    validateFlowchart,
    clearIssues,
    isValidating,
  };
};
