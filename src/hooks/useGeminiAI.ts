import { useCallback, useMemo, useState } from 'react';
import { GeminiAIService } from '../services/geminiAI';
import { GEMINI_CONFIG } from '../config/gemini';
import {
  AIAnalysis,
  AISuggestion,
  Connection,
  FlowNode,
  FlowchartState,
} from '../types';

export const useGeminiAI = () => {
  const service = useMemo(() => new GeminiAIService(GEMINI_CONFIG), []);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const analyzeFlowchart = useCallback(
    async (nodes: FlowNode[], connections: Connection[]) => {
      setIsProcessing(true);
      setLastError(null);
      try {
        const result = await service.analyzeFlowchart(nodes, connections);
        setAnalysis(result);
        return result;
      } catch (error) {
        console.error('Erro na análise da IA:', error);
        setLastError('Não foi possível analisar o fluxograma com a IA.');
        throw error;
      } finally {
        setIsProcessing(false);
      }
    },
    [service]
  );

  const getSuggestions = useCallback(
    async (flowchart: FlowchartState): Promise<AISuggestion[]> => {
      try {
        return await service.suggestImprovements(flowchart);
      } catch (error) {
        console.error('Erro ao obter sugestões da IA:', error);
        setLastError('Falha ao obter sugestões da IA.');
        return [];
      }
    },
    [service]
  );

  return {
    analyzeFlowchart,
    getSuggestions,
    isProcessing,
    analysis,
    lastError,
    service,
  };
};
