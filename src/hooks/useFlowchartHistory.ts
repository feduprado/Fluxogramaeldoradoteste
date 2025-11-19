import { useState, useCallback, useRef } from 'react';
import { FlowchartState } from '../types';

interface HistoryEntry {
  state: FlowchartState;
  timestamp: number;
  description?: string;
}

export const useFlowchartHistory = (
  initialState: FlowchartState,
  maxHistorySize: number = 50
) => {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { state: initialState, timestamp: Date.now() }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const isBatchingRef = useRef(false);
  const batchedChangesRef = useRef<FlowchartState | null>(null);

  const saveToHistory = useCallback((
    state: FlowchartState,
    description?: string
  ) => {
    if (isBatchingRef.current) {
      batchedChangesRef.current = state;
      return;
    }

    setHistory(prev => {
      // Remove estados futuros quando salvamos um novo estado
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Adiciona o novo estado
      const entry: HistoryEntry = {
        state: { ...state },
        timestamp: Date.now(),
        description
      };
      
      newHistory.push(entry);

      // Limita o tamanho do histórico
      if (newHistory.length > maxHistorySize) {
        return newHistory.slice(-maxHistorySize);
      }

      return newHistory;
    });

    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [currentIndex, maxHistorySize]);

  const undo = useCallback((): FlowchartState | null => {
    if (currentIndex <= 0) return null;

    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    return history[newIndex].state;
  }, [currentIndex, history]);

  const redo = useCallback((): FlowchartState | null => {
    if (currentIndex >= history.length - 1) return null;

    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    return history[newIndex].state;
  }, [currentIndex, history]);

  const canUndo = useCallback(() => {
    return currentIndex > 0;
  }, [currentIndex]);

  const canRedo = useCallback(() => {
    return currentIndex < history.length - 1;
  }, [currentIndex, history]);

  const getCurrentState = useCallback(() => {
    return history[currentIndex]?.state || null;
  }, [currentIndex, history]);

  const getHistory = useCallback(() => {
    return history;
  }, [history]);

  const clearHistory = useCallback(() => {
    const currentState = history[currentIndex];
    setHistory([currentState]);
    setCurrentIndex(0);
  }, [currentIndex, history]);

  // Batch operations para agrupar múltiplas alterações
  const startBatch = useCallback(() => {
    isBatchingRef.current = true;
    batchedChangesRef.current = null;
  }, []);

  const endBatch = useCallback((description?: string) => {
    isBatchingRef.current = false;
    if (batchedChangesRef.current) {
      saveToHistory(batchedChangesRef.current, description);
      batchedChangesRef.current = null;
    }
  }, [saveToHistory]);

  const cancelBatch = useCallback(() => {
    isBatchingRef.current = false;
    batchedChangesRef.current = null;
  }, []);

  return {
    saveToHistory,
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),
    getCurrentState,
    getHistory,
    clearHistory,
    startBatch,
    endBatch,
    cancelBatch,
    historySize: history.length,
    currentIndex
  };
};
