import { useState, useCallback, useRef } from 'react';
import { FlowchartState } from '../types';

export const useHistory = (initialState: FlowchartState) => {
  const [history, setHistory] = useState<FlowchartState[]>([initialState]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const historyRef = useRef(history);
  const currentIndexRef = useRef(currentIndex);

  // Atualiza refs quando state muda
  historyRef.current = history;
  currentIndexRef.current = currentIndex;

  const currentState = history[currentIndex] || initialState;

  const pushState = useCallback((newState: FlowchartState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndexRef.current + 1);
      return [...newHistory, newState];
    });
    setCurrentIndex(prev => prev + 1);
  }, []);

  const undo = useCallback(() => {
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, []);

  const redo = useCallback(() => {
    setCurrentIndex(prev => Math.min(historyRef.current.length - 1, prev + 1));
  }, []);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    currentState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
