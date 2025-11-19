import { FlowNode, NodeType, Connection, AIParsedFlow } from '../types';
import { Container } from '../types/container';
import { CONTAINER_COLORS } from '../types/container';
import { AutomaticAlignmentSystem } from './alignmentSystem';

export class FlowInterpreter {
  private static instance: FlowInterpreter;
  private alignmentSystem: AutomaticAlignmentSystem;

  private constructor() {
    this.alignmentSystem = new AutomaticAlignmentSystem({
      minSpacing: 220,
      preferredDirection: 'horizontal',
      gridSize: 20,
      avoidOverlap: true
    });
  }

  public static getInstance(): FlowInterpreter {
    if (!FlowInterpreter.instance) {
      FlowInterpreter.instance = new FlowInterpreter();
    }
    return FlowInterpreter.instance;
  }

  // Método para atualizar nós existentes no sistema de alinhamento
  public updateExistingNodes(existingNodes: FlowNode[]): void {
    this.alignmentSystem.updateExistingNodes(existingNodes);
  }

  public interpretText(text: string, existingNodes: FlowNode[] = []): AIParsedFlow {
    console.log('📝 Interpretando texto com containers:', text.substring(0, 100) + '...');
    
    // Atualiza sistema de alinhamento com nós existentes
    this.alignmentSystem.updateExistingNodes(existingNodes);
    
    const lines = text.split('\n').filter(line => line.trim());
    const nodes: FlowNode[] = [];
    const containers: Container[] = [];
    const connections: Connection[] = [];
    
    // Layout HORIZONTAL
    const startX = 100;
    const startY = 300;
    const horizontalSpacing = 220;
    const verticalSpacing = 150;
    
    let currentX = startX;
    let currentY = startY;
    let nodeCounter = 1;
    let containerCounter = 1;
    let lastNodeId: string | null = null;
    let currentContainer: Container | null = null;
    let containerStartX = 0;
    let containerStartY = 0;
    let decisionStack: { nodeId: string; type: 'decision'; x: number; y: number }[] = [];

    // Processa cada linha do fluxo
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const { type, cleanText, isBranch, branchType } = this.parseLine(line);
      
      if (type === 'ignore') continue;

      // Lógica de containers
      if (type === 'container') {
        // Inicia novo container
        containerStartX = currentX - 20;
        containerStartY = currentY - 40;
        
        const newContainer: Container = {
          id: `container-${containerCounter++}`,
          type: 'module',
          name: cleanText,
          title: cleanText,
          position: { x: containerStartX, y: containerStartY },
          size: { width: 500, height: 350 },
          color: this.getContainerColor(containerCounter - 1),
          nodes: [],
          children: [],
          parentId: null,
          isCollapsed: false,
          isLocked: false,
          zIndex: containers.length + 1,
        };

        containers.push(newContainer);
        currentContainer = newContainer;
        
        // Ajusta posição inicial dentro do container
        currentX += 30;
        currentY += 60;
        continue;
      }

      if (type === 'container-end') {
        // Fecha container atual
        if (currentContainer) {
          const containerNodes = nodes.filter(n => n.containerId === currentContainer!.id);
          if (containerNodes.length > 0) {
            const minX = Math.min(...containerNodes.map(n => n.position.x));
            const maxX = Math.max(...containerNodes.map(n => n.position.x + n.width));
            const minY = Math.min(...containerNodes.map(n => n.position.y));
            const maxY = Math.max(...containerNodes.map(n => n.position.y + n.height));
            
            currentContainer.size = {
              width: Math.max(400, maxX - minX + 100),
              height: Math.max(280, maxY - minY + 120)
            };
            currentContainer.position = { x: minX - 50, y: minY - 60 };
          }

          // Volta para fora do container
          currentX = currentContainer.position.x + currentContainer.size.width + 50;
          currentY = startY;
          currentContainer = null;
        }
        continue;
      }

      // Calcula posição baseada no tipo e contexto
      let position = { x: currentX, y: currentY };

      // Se é um ramo de decisão (Sim/Não)
      if (isBranch && decisionStack.length > 0) {
        const lastDecision = decisionStack[decisionStack.length - 1];
        
        if (branchType === 'sim') {
          // Ramo Sim: continua horizontalmente
          position = {
            x: lastDecision.x + horizontalSpacing,
            y: lastDecision.y
          };
        } else if (branchType === 'nao') {
          // Ramo Não: vai para baixo
          position = {
            x: lastDecision.x + horizontalSpacing,
            y: lastDecision.y + verticalSpacing
          };
        }
        
        currentX = position.x;
        currentY = position.y;
      } else if (type === 'decision') {
        // Decisão mantém posição atual
        position = { x: currentX, y: currentY };
        decisionStack.push({ nodeId: `node-${nodeCounter}`, type: 'decision', x: currentX, y: currentY });
      } else {
        // Outros nós avançam horizontalmente
        position = { x: currentX, y: currentY };
      }

      // Cria nó temporário para verificar posição
      const tempNode: FlowNode = {
        id: `node-${nodeCounter}`,
        type,
        position,
        text: this.shortenText(cleanText),
        width: this.calculateNodeWidth(type, cleanText),
        height: this.calculateNodeHeight(type),
        containerId: currentContainer?.id,
        zIndex: 1000 + nodeCounter,
        isLocked: false,
      };

      // ⚡ NOVO: Usa o sistema de alinhamento para verificar se a posição está válida
      // Se há nós existentes ou já criados, verifica sobreposição
      const allNodesForCheck = [...existingNodes, ...nodes];
      this.alignmentSystem.updateExistingNodes(allNodesForCheck);
      
      // Encontra posição ótima que não sobrepõe
      const referenceNode = nodes.length > 0 ? nodes[nodes.length - 1] : undefined;
      const optimalPosition = this.alignmentSystem.findOptimalPosition(tempNode, referenceNode);
      
      // Atualiza posição do nó com a posição otimizada
      tempNode.position = optimalPosition;
      
      // Atualiza currentX e currentY para refletir a nova posição
      currentX = optimalPosition.x;
      currentY = optimalPosition.y;

      // Cria nó final
      const newNode: FlowNode = {
        id: `node-${nodeCounter++}`,
        type,
        position: tempNode.position,
        text: this.shortenText(cleanText),
        width: this.calculateNodeWidth(type, cleanText),
        height: this.calculateNodeHeight(type),
        containerId: currentContainer?.id,
        zIndex: 1000 + nodeCounter,
        isLocked: false,
      };

      nodes.push(newNode);

      // Adiciona ao container atual
      if (currentContainer) {
        currentContainer.nodes.push(newNode.id);
      }

      // Conecta com o nó anterior
      if (lastNodeId && !isBranch) {
        connections.push({
          id: `conn-${lastNodeId}-to-${newNode.id}`,
          fromNodeId: lastNodeId,
          toNodeId: newNode.id,
        });
      } else if (isBranch && decisionStack.length > 0) {
        // Conecta ramos da decisão
        const decision = decisionStack[decisionStack.length - 1];
        connections.push({
          id: `conn-${decision.nodeId}-to-${newNode.id}`,
          fromNodeId: decision.nodeId,
          toNodeId: newNode.id,
          label: branchType === 'sim' ? 'Sim' : 'Não',
        });
      }

      // Atualiza posição para próximo nó (HORIZONTAL)
      if (type === 'decision') {
        // Após decisão, mantém X para ramos
        // Não avança ainda
      } else if (!isBranch) {
        currentX += horizontalSpacing;
        lastNodeId = newNode.id;
      }

      // Limpa decision stack quando sai dos ramos
      if (type !== 'decision' && !isBranch && decisionStack.length > 0) {
        decisionStack.pop();
      }
    }

    console.log('✅ Fluxo interpretado:', { 
      nodes: nodes.length, 
      containers: containers.length,
      connections: connections.length 
    });
    
    return { nodes, containers, connections };
  }

  private parseLine(line: string): { 
    type: NodeType | 'container' | 'container-end' | 'ignore'; 
    cleanText: string; 
    isBranch: boolean;
    branchType?: 'sim' | 'nao';
  } {
    // Remove indentação
    const cleanLine = line.trim();

    // Ignora linhas de comentário, numeração ou metadados
    if (cleanLine.match(/^(\d+\.\d+\.|\d+\.\d+\.\d+\.|•|[-*]|\d+\))/i) || 
        cleanLine.toLowerCase().includes('cenário macro') ||
        cleanLine.toLowerCase().includes('fluxograma') ||
        cleanLine.toLowerCase().includes('nós em sequência') ||
        cleanLine.toLowerCase().includes('versão') ||
        cleanLine.match(/^={3,}/) || // Linhas com ===
        cleanLine.length < 3) {
      return { type: 'ignore', cleanText: '', isBranch: false };
    }

    // Detecta tipo de nó baseado em marcadores [Tipo]
    if (cleanLine.match(/^\[início\]/i)) {
      return { 
        type: 'start', 
        cleanText: this.extractNodeText(cleanLine, /^\[início\]/i),
        isBranch: false
      };
    }

    if (cleanLine.match(/^\[fim\]/i)) {
      return { 
        type: 'end', 
        cleanText: this.extractNodeText(cleanLine, /^\[fim\]/i),
        isBranch: false
      };
    }

    if (cleanLine.match(/^\[decisão\]/i)) {
      return { 
        type: 'decision', 
        cleanText: this.extractNodeText(cleanLine, /^\[decisão\]/i),
        isBranch: false
      };
    }

    if (cleanLine.match(/^\[processo\]/i)) {
      return { 
        type: 'process', 
        cleanText: this.extractNodeText(cleanLine, /^\[processo\]/i),
        isBranch: false
      };
    }

    // Detecta ramos de decisão (Sim/Não)
    const simMatch = cleanLine.match(/^(sim|s)\s*[→:-]/i);
    const naoMatch = cleanLine.match(/^(não|nao|n)\s*[→:-]/i);
    
    if (simMatch) {
      const text = cleanLine.replace(/^(sim|s)\s*[→:-]\s*/i, '').trim();
      return { 
        type: 'process',
        cleanText: text || 'Sim',
        isBranch: true,
        branchType: 'sim'
      };
    }

    if (naoMatch) {
      const text = cleanLine.replace(/^(não|nao|n)\s*[→:-]\s*/i, '').trim();
      return { 
        type: 'process',
        cleanText: text || 'Não',
        isBranch: true,
        branchType: 'nao'
      };
    }

    // Detecta containers
    const containerMatch = cleanLine.match(/^\[container\]\s*(.*)/i);
    const containerEndMatch = cleanLine.match(/^\[container-end\]/i);
    
    if (containerMatch) {
      const text = containerMatch[1].trim();
      return { 
        type: 'container',
        cleanText: text || 'Container',
        isBranch: false
      };
    }

    if (containerEndMatch) {
      return { 
        type: 'container-end',
        cleanText: '',
        isBranch: false
      };
    }

    // Linhas que começam com texto sem marcador são processos
    if (cleanLine.match(/^[A-ZÀ-Ú]/)) {
      return { 
        type: 'process', 
        cleanText: cleanLine,
        isBranch: false
      };
    }

    return { type: 'ignore', cleanText: '', isBranch: false };
  }

  private extractNodeText(line: string, prefix: RegExp): string {
    let text = line.replace(prefix, '').trim();
    
    // Remove marcadores extras no início
    text = text.replace(/^[-*•]\s*/, '');
    
    // Se o texto estiver vazio, usa um padrão
    if (!text) {
      if (prefix.source.includes('início')) return 'Início';
      if (prefix.source.includes('fim')) return 'Fim';
      if (prefix.source.includes('decisão')) return 'Decisão';
      return 'Processo';
    }
    
    return text;
  }

  private calculateNodeWidth(type: NodeType, text: string): number {
    // Tamanhos FIXOS para cada tipo de nó (atualizados para melhor visualização)
    const fixedWidths: Record<NodeType, number> = {
      'start': 160,      // Aumentado de 140 para 160
      'end': 160,        // Aumentado de 140 para 160
      'decision': 180,   // Aumentado de 160 para 180
      'process': 200,
    };

    return fixedWidths[type];
  }

  private calculateNodeHeight(type: NodeType): number {
    // Altura FIXA baseada no tipo (atualizados para melhor visualização)
    const fixedHeights: Record<NodeType, number> = {
      'start': 160,      // Círculos maiores
      'end': 160,        // Círculos maiores
      'decision': 180,   // Losango maior
      'process': 80,     // Mantém retângulo horizontal
    };
    
    return fixedHeights[type];
  }

  private shortenText(text: string): string {
    // Limita o texto a 50 caracteres para caber no nó
    if (text.length > 50) {
      return text.substring(0, 47) + '...';
    }
    return text;
  }

  private getContainerColor(index: number): string {
    // Retorna uma cor baseada no índice do container
    const colors = Object.values(CONTAINER_COLORS);
    return colors[index % colors.length];
  }

  public async interpretWithAI(text: string): Promise<AIParsedFlow> {
    try {
      console.log('🤖 Processando com IA:', text.substring(0, 100) + '...');
      
      // Simulação de processamento por IA com delay
      await new Promise(resolve => setTimeout(resolve, 1800));
      
      const result = this.parseStructuredFlow(text);
      console.log('🎯 Resultado da IA:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro na interpretação por IA:', error);
      // Fallback para interpretação básica
      return this.parseStructuredFlow(text);
    }
  }

  // Método específico para fluxos estruturados como o exemplo da LATAM
  public parseStructuredFlow(flowText: string): AIParsedFlow {
    console.log('📋 Analisando fluxo estruturado...');
    
    // Pré-processamento do texto
    const cleanedText = flowText
      .split('\n')
      .map(line => {
        // Remove apenas numerações complexas, mantém marcadores simples
        return line
          .replace(/^\d+\.\d+\.\d+\.\s*/g, '') // Remove "1.1.1.", "1.2.3.", etc.
          .replace(/^\d+\.\d+\.\s*/g, '') // Remove "1.1.", "1.2.", etc.
          .replace(/^\(\d+\)\s*/g, '') // Remove numeração entre parênteses
          .trim();
      })
      .join('\n');

    return this.interpretText(cleanedText);
  }
}