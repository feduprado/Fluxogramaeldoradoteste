import { Connection, ConnectionVariant, FlowNode } from '../types';
import { FlowchartDataPayload } from './flowchartValidation';

export interface DecisionNodeMetadata {
  id: string;
  text: string;
  connectionCount: number;
  node: FlowNode;
}

export interface DecisionValidationResult {
  decisionId: string;
  decisionText: string;
  isValid: boolean;
  issues: string[];
  connections: Connection[];
  missingLabels: ('Sim' | 'Não')[];
}

export interface DecisionCorrection {
  decisionId: string;
  decisionText: string;
  applied: string[];
  issues: string[];
}

export interface AutoFixResult {
  flowchart: FlowchartDataPayload;
  corrections: DecisionCorrection[];
  report: string;
}

const YES_LABEL = 'Sim';
const NO_LABEL = 'Não';

const normalizeLabel = (label?: string): string =>
  (label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const isPositive = (connection: Connection): boolean =>
  connection.variant === 'positive' || normalizeLabel(connection.label) === 'sim' || normalizeLabel(connection.label) === 'yes';

const isNegative = (connection: Connection): boolean =>
  connection.variant === 'negative' || normalizeLabel(connection.label) === 'nao' || normalizeLabel(connection.label) === 'no';

const decorateConnectionLabel = (
  connection: Connection,
  label: 'Sim' | 'Não',
  variant: ConnectionVariant
): Connection => ({
  ...connection,
  label,
  variant,
});

const getNodeText = (nodes: FlowNode[], nodeId: string): string =>
  nodes.find(node => node.id === nodeId)?.text || nodeId;

export const detectDecisionNodes = (
  nodes: FlowNode[],
  connections: Connection[] = []
): DecisionNodeMetadata[] =>
  nodes
    .filter(node => node.type === 'decision')
    .map(node => ({
      id: node.id,
      text: node.text,
      connectionCount: connections.filter(conn => conn.fromNodeId === node.id).length,
      node,
    }));

export const validateDecisionConnections = (
  decisionNode: FlowNode,
  allConnections: Connection[]
): DecisionValidationResult => {
  const decisionConnections = allConnections.filter(conn => conn.fromNodeId === decisionNode.id);

  const hasPositive = decisionConnections.some(isPositive);
  const hasNegative = decisionConnections.some(isNegative);

  const issues: string[] = [];
  const missingLabels: ('Sim' | 'Não')[] = [];

  if (decisionConnections.length < 2) {
    issues.push('Menos de duas conexões de saída para a decisão.');
  }

  if (decisionConnections.length > 2) {
    issues.push('Mais de duas conexões encontradas para a decisão.');
  }

  if (!hasPositive) {
    missingLabels.push('Sim');
    issues.push('Falta o rótulo "Sim".');
  }

  if (!hasNegative) {
    missingLabels.push('Não');
    issues.push('Falta o rótulo "Não".');
  }

  return {
    decisionId: decisionNode.id,
    decisionText: decisionNode.text,
    isValid: decisionConnections.length === 2 && hasPositive && hasNegative,
    issues,
    connections: decisionConnections,
    missingLabels,
  };
};

export const generateFixReport = (corrections: DecisionCorrection[]): string => {
  if (!corrections.length) {
    return 'Nenhuma decisão exigiu correção automática.';
  }

  const totalFixed = corrections.filter(correction => correction.applied.length > 0).length;
  const reportLines: string[] = [];

  reportLines.push('✅ CORREÇÕES APLICADAS AUTOMATICAMENTE:');
  corrections.forEach(correction => {
    reportLines.push(`\n• Decisão "${correction.decisionText}":`);

    if (correction.applied.length) {
      correction.applied.forEach(change => {
        reportLines.push(`  - ${change}`);
      });
    }

    if (correction.issues.length) {
      correction.issues.forEach(issue => {
        reportLines.push(`  ⚠️ ${issue}`);
      });
    }
  });

  reportLines.push(`\n🎯 Total: ${totalFixed} decisões corrigidas automaticamente`);

  return reportLines.join('\n');
};

export const autoFixDecisionLabels = (flowchart: FlowchartDataPayload): AutoFixResult => {
  const fixedFlowchart: FlowchartDataPayload = {
    nodes: flowchart.nodes.map(node => ({ ...node })),
    connections: flowchart.connections.map(connection => ({ ...connection })),
  };

  const corrections: DecisionCorrection[] = [];
  const decisionNodes = detectDecisionNodes(fixedFlowchart.nodes, fixedFlowchart.connections);

  decisionNodes.forEach(decisionMetadata => {
    const decisionNode = decisionMetadata.node;
    const correction: DecisionCorrection = {
      decisionId: decisionNode.id,
      decisionText: decisionNode.text,
      applied: [],
      issues: [],
    };

    const getOutgoingIndexes = (): number[] =>
      fixedFlowchart.connections.reduce<number[]>((acc, connection, index) => {
        if (connection.fromNodeId === decisionNode.id) {
          acc.push(index);
        }
        return acc;
      }, []);

    let outgoingIndexes = getOutgoingIndexes();

    if (outgoingIndexes.length < 2) {
      correction.issues.push('Fluxograma incompleto: decisão com menos de duas conexões.');
      corrections.push(correction);
      return;
    }

    if (outgoingIndexes.length > 2) {
      const extras = outgoingIndexes.slice(2);
      extras
        .sort((a, b) => b - a)
        .forEach(index => {
          const removed = fixedFlowchart.connections.splice(index, 1)[0];
          correction.issues.push(
            `Conexão extra removida (para "${getNodeText(fixedFlowchart.nodes, removed.toNodeId)}").`
          );
        });
      outgoingIndexes = getOutgoingIndexes();
    }

    const [simIndex, naoIndex] = outgoingIndexes;
    const expected = [
      { label: YES_LABEL as 'Sim', variant: 'positive' as ConnectionVariant, index: simIndex },
      { label: NO_LABEL as 'Não', variant: 'negative' as ConnectionVariant, index: naoIndex },
    ];

    expected.forEach(({ label, variant, index }) => {
      const current = fixedFlowchart.connections[index];
      const updated = decorateConnectionLabel(current, label, variant);

      if (current.label !== updated.label || current.variant !== updated.variant) {
        correction.applied.push(
          `Adicionado "${label}" → "${getNodeText(fixedFlowchart.nodes, current.toNodeId)}"`
        );
      }

      fixedFlowchart.connections[index] = updated;
    });

    corrections.push(correction);
  });

  const report = generateFixReport(corrections);

  return {
    flowchart: fixedFlowchart,
    corrections,
    report,
  };
};
