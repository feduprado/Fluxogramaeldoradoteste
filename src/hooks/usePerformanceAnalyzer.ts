import { useMemo } from 'react';
import { PerformanceAnalyzer } from '../services/performanceAnalyzer';

export const usePerformanceAnalyzer = () => {
  return useMemo(() => new PerformanceAnalyzer(), []);
};
