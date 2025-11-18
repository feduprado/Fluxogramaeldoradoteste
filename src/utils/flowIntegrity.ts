import { Connection, FlowNode } from '../types';
import { inferVariantFromLabel } from './connectionVariants';

export type FlowIntegrityIssueSeverity = 'low' | 'medium' | 'high';
export type FlowIntegrityIssueCategory = 'structure' | 'semantic' | 'naming';

export interface FlowIntegrityIssue {
  id: string;
  rule: string;
  category: FlowIntegrityIssueCategory;
  severity: FlowIntegrityIssueSeverity;
  summary: string;
  detail?: string;
  suggestion?: string;
  nodeId?: string;
}

export interface FlowIntegrityReport {
  issues: FlowIntegrityIssue[];
  hasCriticalIssues: boolean;
}

const createIssueId = (rule: string, existing: FlowIntegrityIssue[], nodeId?: string) => {
  const base = `${rule}-${nodeId || 'flow'}`;
  const duplicates = existing.filter(issue => issue.id.startsWith(base)).length;
  return duplicates === 0 ? base : `${base}-${duplicates + 1}`;
};

const buildMaps = (connections: Connection[]) => {
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, Connection[]>();
  const adjacency = new Map<string, string[]>();

  connections.forEach(connection => {
    incoming.set(connection.toNodeId, (incoming.get(connection.toNodeId) || 0) + 1);
    const existingOutgoing = outgoing.get(connection.fromNodeId) || [];
    existingOutgoing.push(connection);
    outgoing.set(connection.fromNodeId, existingOutgoing);

    const adjacencyList = adjacency.get(connection.fromNodeId) || [];
    adjacencyList.push(connection.toNodeId);
    adjacency.set(connection.fromNodeId, adjacencyList);
  });

  return { incoming, outgoing, adjacency };
};

export const analyzeFlowIntegrity = (nodes: FlowNode[], connections: Connection[]): FlowIntegrityReport => {
  const issues: FlowIntegrityIssue[] = [];
  const addIssue = (issue: Omit<FlowIntegrityIssue, 'id'>) => {
    issues.push({ ...issue, id: createIssueId(issue.rule, issues, issue.nodeId) });
  };

  const startNodes = nodes.filter(node => node.type === 'start');
  const endNodes = nodes.filter(node => node.type === 'end');
  const { incoming, outgoing, adjacency } = buildMaps(connections);

  if (nodes.length > 0 && startNodes.length === 0) {
    addIssue({
      rule: 'start-missing',
      category: 'structure',
      severity: 'high',
      summary: 'Fluxo sem nó de entrada ([Início]).',
      detail: 'Cada fluxograma precisa de exatamente um nó [Início].',
      suggestion: 'Adicione um nó [Início] que represente o estado inicial do processo.',
    });
  }

  if (startNodes.length > 1) {
    addIssue({
      rule: 'start-multiple',
      category: 'structure',
      severity: 'medium',
      summary: 'Fluxo possui múltiplos nós [Início].',
      detail: `Foram encontrados ${startNodes.length} nós de início.`,
      suggestion: 'Mantenha apenas um nó de entrada e crie ramificações a partir dele.',
    });
  }

  if (nodes.length > 0 && endNodes.length === 0) {
    addIssue({
      rule: 'end-missing',
      category: 'structure',
      severity: 'high',
      summary: 'Fluxo sem nó de término ([Fim]).',
      detail: 'Pelo menos um nó [Fim] é obrigatório para indicar o encerramento do processo.',
      suggestion: 'Crie um nó [Fim] para cada resultado principal do fluxo.',
    });
  }

  connections.forEach(connection => {
    if (connection.fromNodeId === connection.toNodeId) {
      addIssue({
        rule: 'trivial-loop',
        category: 'structure',
        severity: 'high',
        summary: 'Foi detectado um loop direto (nó ligado a ele mesmo).',
        detail: 'Loops triviais confundem a leitura e devem ser substituídos por um nó intermediário.',
        suggestion: 'Revise a lógica e crie etapas explícitas para o retorno.',
        nodeId: connection.fromNodeId,
      });
    }
  });

  nodes.forEach(node => {
    const text = node.text?.trim() || '';
    const incomingCount = incoming.get(node.id) || 0;
    const outgoingConnections = outgoing.get(node.id) || [];

    if (node.type !== 'start' && incomingCount === 0) {
      addIssue({
        rule: 'orphan-node',
        category: 'structure',
        severity: 'medium',
        summary: 'Nó sem conexão de entrada.',
        detail: 'Somente o nó [Início] pode ficar sem entradas.',
        suggestion: 'Conecte este nó a algum passo anterior ou remova-o.',
        nodeId: node.id,
      });
    }

    if (node.type === 'decision') {
      if (!text.endsWith('?')) {
        addIssue({
          rule: 'decision-question-format',
          category: 'semantic',
          severity: 'low',
          summary: 'Decisões devem estar em formato de pergunta.',
          detail: 'Use perguntas objetivas como "Senha é válida?".',
          suggestion: 'Reescreva o texto da decisão para terminar com ponto de interrogação.',
          nodeId: node.id,
        });
      }

      if (outgoingConnections.length < 2) {
        addIssue({
          rule: 'decision-missing-branches',
          category: 'structure',
          severity: 'high',
          summary: 'Decisão com menos de duas saídas.',
          detail: 'Decisões precisam de, no mínimo, caminhos Sim e Não.',
          suggestion: 'Adicione saídas explícitas para cada resultado possível.',
          nodeId: node.id,
        });
      }

      const hasLabels = outgoingConnections.every(conn => Boolean(conn.label?.trim()));
      if (!hasLabels) {
        addIssue({
          rule: 'decision-missing-label',
          category: 'semantic',
          severity: 'medium',
          summary: 'Saídas de decisão precisam de rótulos.',
          detail: 'Nomeie cada ramo (Sim/Não ou alternativas exclusivas).',
          suggestion: 'Preencha os rótulos dos conectores da decisão.',
          nodeId: node.id,
        });
      }

      const variants = new Set(
        outgoingConnections.map(connection => connection.variant || inferVariantFromLabel(connection.label))
      );
      if (!variants.has('positive') || !variants.has('negative')) {
        addIssue({
          rule: 'decision-sim-nao',
          category: 'structure',
          severity: 'high',
          summary: 'Decisão sem os ramos Sim e Não explícitos.',
          detail: 'Garanta pelo menos um caminho positivo (Sim) e um negativo (Não).',
          suggestion: 'Ajuste os rótulos/variantes para incluir Sim e Não.',
          nodeId: node.id,
        });
      }
    }

    if (text.length > 60) {
      addIssue({
        rule: 'label-length',
        category: 'naming',
        severity: 'low',
        summary: 'Texto do nó acima de 60 caracteres.',
        detail: `Texto atual possui ${text.length} caracteres.`,
        suggestion: 'Reduza o texto para um label curto e direto.',
        nodeId: node.id,
      });
    }

    if (node.type === 'process') {
      const firstWord = text.split(/\s+/)[0]?.toLowerCase() || '';
      const looksLikeVerb = /(ar|er|ir)$/i.test(firstWord);
      if (!looksLikeVerb) {
        addIssue({
          rule: 'process-verb',
          category: 'semantic',
          severity: 'low',
          summary: 'Processos devem começar com verbo no infinitivo.',
          detail: 'Use descrições como "Validar login" ou "Exibir dashboard".',
          suggestion: 'Reescreva o label iniciando com um verbo de ação.',
          nodeId: node.id,
        });
      }
    }
  });

  if (startNodes.length > 0) {
    const visited = new Set<string>();
    const queue = [...startNodes.map(node => node.id)];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) {
        continue;
      }
      visited.add(current);
      const neighbors = adjacency.get(current) || [];
      neighbors.forEach(next => {
        if (!visited.has(next)) {
          queue.push(next);
        }
      });
    }

    const unreachableNodes = nodes.filter(node => !visited.has(node.id));
    unreachableNodes.forEach(node => {
      addIssue({
        rule: 'dead-branch',
        category: 'structure',
        severity: 'high',
        summary: 'Nó não é alcançado a partir do [Início].',
        detail: 'Revise conexões para eliminar ramos mortos.',
        suggestion: 'Garanta que haja um caminho válido a partir do nó inicial.',
        nodeId: node.id,
      });
    });

    const visitedEndNodes = endNodes.filter(node => visited.has(node.id));
    if (endNodes.length > 0 && visitedEndNodes.length === 0) {
      addIssue({
        rule: 'no-path-to-end',
        category: 'structure',
        severity: 'high',
        summary: 'Nenhum caminho alcança um nó [Fim].',
        detail: 'Existem caminhos pendurados que não chegam ao término do fluxo.',
        suggestion: 'Conecte os ramos até um ou mais nós [Fim].',
      });
    }

    const danglingPaths = nodes.filter(node => {
      if (!visited.has(node.id) || node.type === 'end') {
        return false;
      }
      const outgoingConnections = outgoing.get(node.id) || [];
      return outgoingConnections.length === 0;
    });

    danglingPaths.forEach(node => {
      addIssue({
        rule: 'dangling-path',
        category: 'structure',
        severity: 'medium',
        summary: 'Caminho termina sem atingir um [Fim].',
        detail: 'Evite fluxos interrompidos que não chegam a um estado final claro.',
        suggestion: 'Ligue o caminho a um nó de término ou detalhe o próximo passo.',
        nodeId: node.id,
      });
    });
  }

  return {
    issues,
    hasCriticalIssues: issues.some(issue => issue.severity === 'high'),
  };
};
