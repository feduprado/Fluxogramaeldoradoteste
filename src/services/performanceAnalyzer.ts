import { ADVANCED_FEATURES } from '../config/advanced';
import {
  Bottleneck,
  Connection,
  FlowNode,
  OptimizationSuggestion,
  PerformanceMetrics,
} from '../types';

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export class PerformanceAnalyzer {
  async analyzePerformance(nodes: FlowNode[], connections: Connection[]): Promise<PerformanceMetrics> {
    const complexity = this.calculateComplexity(nodes, connections);
    const bottlenecks = this.identifyBottlenecks(nodes, connections);
    const optimizationSuggestions = this.buildSuggestions(bottlenecks, nodes);
    const performanceScore = this.calculateScore(complexity, bottlenecks);

    return {
      complexity,
      bottlenecks: bottlenecks.slice(0, ADVANCED_FEATURES.performance.maxBottlenecks),
      optimizationSuggestions,
      performanceScore,
    };
  }

  private calculateComplexity(nodes: FlowNode[], connections: Connection[]) {
    const cyclomatic = connections.length - nodes.length + 2;
    const decisionNodes = nodes.filter(node => node.type === 'decision');
    const processNodes = nodes.filter(node => node.type === 'process');
    const cognitive = decisionNodes.length * 2 + processNodes.length * 0.5;
    const maintainabilityBase = 100 - (cyclomatic + cognitive * 1.5);
    const maintainability = clamp(maintainabilityBase, 0, 100);

    return {
      cyclomatic: clamp(cyclomatic, 0, 99),
      cognitive: Number(cognitive.toFixed(1)),
      maintainability,
    };
  }

  private identifyBottlenecks(nodes: FlowNode[], connections: Connection[]): Bottleneck[] {
    const bottlenecks: Bottleneck[] = [];
    const outgoingMap = new Map<string, number>();
    connections.forEach(connection => {
      outgoingMap.set(connection.fromNodeId, (outgoingMap.get(connection.fromNodeId) || 0) + 1);
    });

    nodes.forEach(node => {
      if (node.type === 'decision') {
        const outgoing = outgoingMap.get(node.id) || 0;
        if (outgoing > 3) {
          bottlenecks.push({
            nodeId: node.id,
            type: 'decision',
            issue: 'Decisão com muitas ramificações',
            severity: outgoing > 5 ? 'high' : 'medium',
            impact: 'Fluxos complexos dificultam entendimento',
            suggestedFix: 'Divida a decisão em blocos menores ou valide os caminhos críticos.',
          });
        }
      }
    });

    const isolatedNodes = nodes.filter(
      node => !connections.some(conn => conn.fromNodeId === node.id || conn.toNodeId === node.id)
    );
    isolatedNodes.forEach(node => {
      bottlenecks.push({
        nodeId: node.id,
        type: node.type === 'decision' ? 'decision' : 'process',
        issue: 'Nó isolado sem conexões',
        severity: 'medium',
        impact: 'Fluxos desconectados podem indicar passos faltantes',
        suggestedFix: 'Conecte este nó a outro passo ou remova-o se for redundante.',
      });
    });

    return bottlenecks;
  }

  private buildSuggestions(bottlenecks: Bottleneck[], nodes: FlowNode[]): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = [];

    if (bottlenecks.length === 0 && nodes.length > 0) {
      suggestions.push({
        id: 'balanced-flow',
        type: 'simplify',
        description: 'Fluxograma equilibrado! Considere documentar as regras de negócio neste ponto.',
        estimatedEffort: 'low',
        expectedImpact: 'medium',
        steps: ['Registrar decisões principais', 'Compartilhar com o time'],
      });
      return suggestions;
    }

    bottlenecks.forEach((bottleneck, index) => {
      suggestions.push({
        id: `fix-${bottleneck.nodeId}-${index}`,
        type: 'refactor',
        description: `Revise o nó ${bottleneck.nodeId}: ${bottleneck.issue}`,
        estimatedEffort: bottleneck.severity === 'high' ? 'high' : 'medium',
        expectedImpact: bottleneck.severity === 'low' ? 'medium' : 'high',
        steps: ['Investigar causa raiz', 'Ajustar fluxo', 'Validar com stakeholders'],
      });
    });

    return suggestions;
  }

  private calculateScore(complexity: PerformanceMetrics['complexity'], bottlenecks: Bottleneck[]) {
    const complexityPenalty = (complexity.cyclomatic + complexity.cognitive) * 1.5;
    const bottleneckPenalty = bottlenecks.length * 5;
    return clamp(100 - complexityPenalty - bottleneckPenalty, 0, 100);
  }
}

export const createPerformanceAnalyzer = () => new PerformanceAnalyzer();
