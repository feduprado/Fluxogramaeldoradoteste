import { FlowNode, NodeType, Connection, AIParsedFlow } from '../types';

export class FlowInterpreter {
  private static instance: FlowInterpreter;

  public static getInstance(): FlowInterpreter {
    if (!FlowInterpreter.instance) {
      FlowInterpreter.instance = new FlowInterpreter();
    }
    return FlowInterpreter.instance;
  }

  public interpretText(text: string): AIParsedFlow {
    console.log('📝 Interpretando texto do fluxo:', text.substring(0, 100) + '...');
    
    const lines = text.split('\n').filter(line => line.trim());
    const nodes: FlowNode[] = [];
    const connections: Connection[] = [];
    
    let currentX = 300;
    let currentY = 100;
    let nodeCounter = 1;
    let lastNodeId: string | null = null;
    let decisionStack: { nodeId: string; type: 'decision'; x: number; y: number }[] = [];
    let branchNodes: { nodeId: string; branchType: 'sim' | 'nao' }[] = [];

    // Processa cada linha do fluxo
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const { type, cleanText, level, isBranch, branchType } = this.parseLine(line);
      
      if (type === 'ignore') continue;

      // Calcula posição baseada no tipo e contexto
      let position = { x: currentX, y: currentY };

      // Se é um ramo de decisão (Sim/Não)
      if (isBranch && decisionStack.length > 0) {
        const lastDecision = decisionStack[decisionStack.length - 1];
        
        if (branchType === 'sim') {
          // Ramo Sim: continua na vertical
          position = {
            x: lastDecision.x,
            y: lastDecision.y + 120
          };
        } else if (branchType === 'nao') {
          // Ramo Não: vai para o lado direito
          position = {
            x: lastDecision.x + 250,
            y: lastDecision.y + 120
          };
        }
        
        currentX = position.x;
        currentY = position.y;
      } else if (type === 'decision') {
        // Decisão usa a posição atual
        position = { x: currentX, y: currentY };
      } else {
        // Processos e outros: posição atual
        position = { x: currentX, y: currentY };
      }

      const newNode: FlowNode = {
        id: `node-${nodeCounter++}`,
        type,
        position,
        text: cleanText,
        width: this.calculateNodeWidth(type, cleanText),
        height: this.calculateNodeHeight(cleanText),
      };

      nodes.push(newNode);

      // Conecta com o nó anterior
      if (isBranch && decisionStack.length > 0) {
        // Conecta ramo diretamente à decisão
        const lastDecision = decisionStack[decisionStack.length - 1];
        connections.push({
          id: `conn-${lastDecision.nodeId}-to-${newNode.id}-${branchType}`,
          fromNodeId: lastDecision.nodeId,
          toNodeId: newNode.id,
        });
        
        branchNodes.push({ nodeId: newNode.id, branchType: branchType! });
      } else if (lastNodeId && type !== 'ignore') {
        connections.push({
          id: `conn-${lastNodeId}-to-${newNode.id}`,
          fromNodeId: lastNodeId,
          toNodeId: newNode.id,
        });
      }

      // Gerencia pilha de decisões
      if (type === 'decision') {
        decisionStack.push({ 
          nodeId: newNode.id, 
          type: 'decision',
          x: position.x,
          y: position.y
        });
      } else if (!isBranch && decisionStack.length > 0) {
        // Saiu do contexto de decisão
        decisionStack.pop();
        branchNodes = [];
      }

      if (!isBranch) {
        lastNodeId = newNode.id;
      }

      // Avança para a próxima posição (apenas se não for ramo)
      if (!isBranch) {
        currentY += 120;
      }

      // Quebra de coluna para fluxos muito longos
      if (nodeCounter % 20 === 0) {
        currentX += 400;
        currentY = 100;
      }
    }

    console.log('✅ Fluxo interpretado:', { nodes: nodes.length, connections: connections.length });
    return { nodes, connections };
  }

  private parseLine(line: string): { 
    type: NodeType | 'ignore'; 
    cleanText: string; 
    level: number;
    isBranch: boolean;
    branchType?: 'sim' | 'nao';
  } {
    // Detecta nível de indentação
    const indentMatch = line.match(/^(\s*)/);
    const level = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0;

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
      return { type: 'ignore', cleanText: '', level: 0, isBranch: false };
    }

    // Detecta tipo de nó baseado em marcadores [Tipo]
    if (cleanLine.match(/^\[início\]/i)) {
      return { 
        type: 'start', 
        cleanText: this.extractNodeText(cleanLine, /^\[início\]/i),
        level,
        isBranch: false
      };
    }

    if (cleanLine.match(/^\[fim\]/i)) {
      return { 
        type: 'end', 
        cleanText: this.extractNodeText(cleanLine, /^\[fim\]/i),
        level,
        isBranch: false
      };
    }

    if (cleanLine.match(/^\[decisão\]/i)) {
      return { 
        type: 'decision', 
        cleanText: this.extractNodeText(cleanLine, /^\[decisão\]/i),
        level,
        isBranch: false
      };
    }

    if (cleanLine.match(/^\[processo\]/i)) {
      return { 
        type: 'process', 
        cleanText: this.extractNodeText(cleanLine, /^\[processo\]/i),
        level,
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
        level: level + 1,
        isBranch: true,
        branchType: 'sim'
      };
    }

    if (naoMatch) {
      const text = cleanLine.replace(/^(não|nao|n)\s*[→:-]\s*/i, '').trim();
      return { 
        type: 'process',
        cleanText: text || 'Não',
        level: level + 1,
        isBranch: true,
        branchType: 'nao'
      };
    }

    // Linhas que começam com texto sem marcador são processos
    if (cleanLine.match(/^[A-ZÀ-Ú]/)) {
      return { 
        type: 'process', 
        cleanText: cleanLine,
        level,
        isBranch: false
      };
    }

    return { type: 'ignore', cleanText: '', level: 0, isBranch: false };
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
    // Tamanhos FIXOS para cada tipo de nó
    const fixedWidths: Record<NodeType, number> = {
      'start': 140,
      'end': 140,
      'decision': 160,
      'process': 200,
    };

    return fixedWidths[type];
  }

  private calculateNodeHeight(text: string): number {
    // Altura FIXA baseada no tipo
    // O texto será quebrado para caber dentro do nó
    return 80;
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