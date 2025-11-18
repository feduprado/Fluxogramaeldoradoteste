import { useState, useCallback, useEffect, useRef } from 'react';
import { FlowNode, NodeType, Connection, FlowchartState, ConnectionVariant } from '../types';
import { copyToFigmaClipboard } from '../utils/figmaClipboard';
import { ensureFlowchartData } from '../utils/flowchartValidation';
import { flowchartPersistenceService } from '../services/flowchartPersistence';

const VARIANT_LABELS: Record<Exclude<ConnectionVariant, 'neutral'>, string> = {
  positive: 'Sim',
  negative: 'Não',
};

const labelForVariant = (variant: ConnectionVariant): string | undefined =>
  variant === 'neutral' ? undefined : VARIANT_LABELS[variant];

const normalizeLabel = (label?: string): string =>
  (label || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

const inferVariantFromLabel = (label?: string): ConnectionVariant => {
  const normalized = normalizeLabel(label);
  if (!normalized) {
    return 'neutral';
  }
  if (normalized === 'sim' || normalized === 'yes') {
    return 'positive';
  }
  if (normalized === 'nao' || normalized === 'no') {
    return 'negative';
  }
  return 'neutral';
};

const decorateConnection = (connection: Connection): Connection => {
  const variant: ConnectionVariant = connection.variant || inferVariantFromLabel(connection.label);

  if (variant === 'neutral') {
    return connection.variant === 'neutral'
      ? connection
      : { ...connection, variant: 'neutral' };
  }

  const expectedLabel = labelForVariant(variant);
  if (connection.variant === variant && connection.label === expectedLabel) {
    return connection;
  }

  return {
    ...connection,
    variant,
    label: expectedLabel,
  };
};

const normalizeConnections = (connections: Connection[] = []) =>
  connections.map(decorateConnection);

const determineDecisionConnectionMetadata = (
  fromNode: FlowNode | undefined,
  connections: Connection[]
): { variant: ConnectionVariant; label?: string } => {
  if (!fromNode || fromNode.type !== 'decision') {
    return { variant: 'neutral' };
  }

  const outgoing = connections.filter(conn => conn.fromNodeId === fromNode.id);
  const hasVariant = (variant: ConnectionVariant) =>
    outgoing.some(conn => (conn.variant || inferVariantFromLabel(conn.label)) === variant);

  if (!hasVariant('positive')) {
    return { variant: 'positive', label: labelForVariant('positive') };
  }

  if (!hasVariant('negative')) {
    return { variant: 'negative', label: labelForVariant('negative') };
  }

  return {
    variant: 'neutral',
    label: `Fluxo ${outgoing.length + 1}`,
  };
};

const initialState: FlowchartState = {
  nodes: [],
  connections: [],
  selectedNodeId: null,
  temporaryConnection: null,
};

const MAX_HISTORY = 50;

export const useFlowchart = () => {
  const [state, setState] = useState<FlowchartState>(initialState);
  const [history, setHistory] = useState<FlowchartState[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // Auto-save no localStorage
  useEffect(() => {
    if (state.nodes.length === 0 && state.connections.length === 0) {
      localStorage.removeItem('flowchart-autosave');
      return;
    }

    const sanitized = flowchartPersistenceService.sanitizeFlowchart({
      nodes: state.nodes,
      connections: state.connections,
    });

    localStorage.setItem('flowchart-autosave', JSON.stringify(sanitized));
    console.log('💾 Auto-save realizado');
  }, [state.nodes, state.connections]);

  // Carregar auto-save ao inicializar
  useEffect(() => {
    const saved = localStorage.getItem('flowchart-autosave');
    if (!saved) {
      return;
    }

    try {
      const parsed = flowchartPersistenceService.parse(saved);
      if (parsed.nodes.length > 0) {
        setState({
          ...initialState,
          nodes: parsed.nodes,
          connections: normalizeConnections(parsed.connections || []),
        });
        console.log('📂 Auto-save carregado');
      }
    } catch (error) {
      console.error('Erro ao carregar auto-save:', error);
      localStorage.removeItem('flowchart-autosave');
    }
  }, []);

  // Adicionar ao histórico (para undo/redo)
  const addToHistory = useCallback((newState: FlowchartState) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      
      // Limita o tamanho do histórico
      if (newHistory.length > MAX_HISTORY) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });
    
    setHistoryIndex(prev => Math.min(prev + 1, MAX_HISTORY - 1));
  }, [historyIndex]);

  const addNode = useCallback((type: NodeType, position: { x: number; y: number }) => {
    console.log('➕ Adicionando nó:', type, position);
    
    const newNode: FlowNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      position,
      text: type === 'start' ? 'Início' : 
            type === 'process' ? 'Processo' : 
            type === 'decision' ? 'Decisão' : 'Fim',
      width: type === 'decision' ? 120 : 140,
      height: type === 'decision' ? 120 : 80,
    };
    
    setState(prev => {
      const newState = {
        ...prev,
        nodes: [...prev.nodes, newNode],
        selectedNodeId: newNode.id,
      };
      addToHistory(newState);
      return newState;
    });
    
    return newNode.id;
  }, [addToHistory]);

  const removeNode = useCallback((nodeId: string) => {
    console.log('🗑️ Removendo nó:', nodeId);
    setState(prev => {
      const newState = {
        ...prev,
        nodes: prev.nodes.filter(node => node.id !== nodeId),
        connections: prev.connections.filter(
          conn => conn.fromNodeId !== nodeId && conn.toNodeId !== nodeId
        ),
        selectedNodeId: prev.selectedNodeId === nodeId ? null : prev.selectedNodeId,
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const updateNodePosition = useCallback((nodeId: string, newPosition: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      nodes: prev.nodes.map(node =>
        node.id === nodeId ? { ...node, position: newPosition } : node
      ),
    }));
  }, []);

  const saveNodePositionToHistory = useCallback(() => {
    setState(prev => {
      addToHistory(prev);
      return prev;
    });
  }, [addToHistory]);

  const updateNodeText = useCallback((nodeId: string, newText: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        nodes: prev.nodes.map(node =>
          node.id === nodeId ? { ...node, text: newText } : node
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const resizeNode = useCallback((nodeId: string, newSize: { width: number; height: number }) => {
    setState(prev => {
      const newState = {
        ...prev,
        nodes: prev.nodes.map(node =>
          node.id === nodeId ? { ...node, ...newSize } : node
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const startConnection = useCallback((nodeId: string) => {
    console.log('🔗 Iniciando conexão do nó:', nodeId);
    setState(prev => {
      const node = prev.nodes.find(n => n.id === nodeId);
      if (node) {
        return {
          ...prev,
          temporaryConnection: { 
            fromNodeId: nodeId, 
            x: node.position.x + node.width / 2, 
            y: node.position.y + node.height / 2 
          },
        };
      }
      return prev;
    });
  }, []);

  const updateTemporaryConnection = useCallback((x: number, y: number) => {
    setState(prev => ({
      ...prev,
      temporaryConnection: prev.temporaryConnection ? 
        { ...prev.temporaryConnection, x, y } : null,
    }));
  }, []);

  const endConnection = useCallback((nodeId: string) => {
    console.log('🎯 Finalizando conexão no nó:', nodeId);
    setState(prev => {
      if (prev.temporaryConnection && prev.temporaryConnection.fromNodeId !== nodeId) {
        // Verificar se já existe uma conexão entre esses nós
        const connectionExists = prev.connections.some(
          conn => conn.fromNodeId === prev.temporaryConnection!.fromNodeId && conn.toNodeId === nodeId
        );
        
        if (connectionExists) {
          console.log('⚠️ Conexão já existe entre esses nós');
          return {
            ...prev,
            temporaryConnection: null,
          };
        }
        
        const fromNode = prev.nodes.find(n => n.id === prev.temporaryConnection?.fromNodeId);
        const metadata = determineDecisionConnectionMetadata(fromNode, prev.connections);

        const newConnection: Connection = decorateConnection({
          id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fromNodeId: prev.temporaryConnection.fromNodeId,
          toNodeId: nodeId,
          ...metadata,
        });

        const newState = {
          ...prev,
          connections: [...prev.connections, newConnection],
          temporaryConnection: null,
        };
        
        addToHistory(newState);
        return newState;
      } else {
        return {
          ...prev,
          temporaryConnection: null,
        };
      }
    });
  }, [addToHistory]);

  const removeConnection = useCallback((connectionId: string) => {
    console.log('🗑️ Removendo conexão:', connectionId);
    setState(prev => {
      const newState = {
        ...prev,
        connections: prev.connections.filter(conn => conn.id !== connectionId),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const toggleConnectionLabel = useCallback((connectionId: string) => {
    setState(prev => {
      const updatedConnections = prev.connections.map(connection => {
        if (connection.id !== connectionId) return connection;

        const currentVariant = connection.variant || inferVariantFromLabel(connection.label);
        const nextVariant: ConnectionVariant =
          currentVariant === 'positive'
            ? 'negative'
            : currentVariant === 'negative'
              ? 'neutral'
              : 'positive';

        return decorateConnection({
          ...connection,
          variant: nextVariant,
          label: labelForVariant(nextVariant),
        });
      });

      const newState = { ...prev, connections: updatedConnections };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const selectNode = useCallback((nodeId: string | null) => {
    console.log('🎯 Selecionando nó:', nodeId);
    setState(prev => ({ ...prev, selectedNodeId: nodeId }));
  }, []);

  const clearCanvas = useCallback(() => {
    console.log('🧹 Limpando canvas');
    const newState = {
      nodes: [],
      connections: [],
      selectedNodeId: null,
      temporaryConnection: null,
    };
    setState(newState);
    addToHistory(newState);
    localStorage.removeItem('flowchart-autosave');
  }, [addToHistory]);

  const applyFlow = useCallback((flow: { nodes: FlowNode[]; connections: Connection[] }) => {
    const sanitized = ensureFlowchartData(flow);

    if (!sanitized) {
      console.warn('⚠️ Fluxograma inválido recebido');
      return false;
    }

    console.log('🤖 Aplicando fluxo validado');
    const newState = {
      nodes: sanitized.nodes,
      connections: normalizeConnections(sanitized.connections),
      selectedNodeId: null,
      temporaryConnection: null,
    };
    setState(newState);
    addToHistory(newState);
    return true;
  }, [addToHistory]);

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      console.log('↩️ Desfazendo');
      isUndoRedoAction.current = true;
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setState(history[newIndex]);
    }
  }, [history, historyIndex]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      console.log('↪️ Refazendo');
      isUndoRedoAction.current = true;
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setState(history[newIndex]);
    }
  }, [history, historyIndex]);

  const exportAsJSON = useCallback(() => {
    try {
      flowchartPersistenceService.exportAsJSON({
        nodes: state.nodes,
        connections: state.connections,
      });
      console.log('📥 Fluxograma exportado como JSON');
      return true;
    } catch (error) {
      console.error('Erro ao exportar fluxograma:', error);
      return false;
    }
  }, [state.connections, state.nodes]);

  const exportAsSVG = useCallback(() => {
    if (state.nodes.length === 0) {
      console.warn('⚠️ Nenhum nó para exportar');
      return;
    }

    // Calcula os limites do fluxograma
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    state.nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.width);
      maxY = Math.max(maxY, node.position.y + node.height);
    });

    // Adiciona margem
    const margin = 40;
    minX -= margin;
    minY -= margin;
    maxX += margin;
    maxY += margin;

    const width = maxX - minX;
    const height = maxY - minY;

    // Função para quebrar texto em múltiplas linhas (melhorada)
    const wrapText = (text: string, maxWidth: number, fontSize: number = 14): string[] => {
      // Se o texto já tem quebras manuais (\n), respeita elas
      const manualLines = text.split('\n');
      const wrappedLines: string[] = [];
      
      manualLines.forEach(line => {
        const words = line.split(' ');
        let currentLine = '';
        
        words.forEach(word => {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          // Aproximação mais precisa: ~7 pixels por caractere para fontSize 14
          const estimatedWidth = testLine.length * (fontSize * 0.5);
          
          if (estimatedWidth > maxWidth && currentLine) {
            wrappedLines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        });
        
        if (currentLine) {
          wrappedLines.push(currentLine);
        }
      });
      
      return wrappedLines.length > 0 ? wrappedLines : [''];
    };

    // Gera o conteúdo SVG
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#4B5563" />
    </marker>
  </defs>
  
  <!-- Background -->
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="white"/>
  
  <!-- Connections -->
`;

    // Adiciona conexões
    state.connections.forEach(connection => {
      const fromNode = state.nodes.find(n => n.id === connection.fromNodeId);
      const toNode = state.nodes.find(n => n.id === connection.toNodeId);
      
      if (fromNode && toNode) {
        const startX = fromNode.position.x + fromNode.width / 2;
        const startY = fromNode.position.y + fromNode.height / 2;
        const endX = toNode.position.x + toNode.width / 2;
        const endY = toNode.position.y + toNode.height / 2;
        
        svgContent += `  <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#4B5563" stroke-width="2" marker-end="url(#arrowhead)"/>\n`;
        
        // Label da conexão (se houver)
        if (connection.label) {
          const midX = (startX + endX) / 2;
          const midY = (startY + endY) / 2;
          svgContent += `  <text x="${midX}" y="${midY - 5}" font-family="Arial, sans-serif" font-size="12" fill="#6B7280" text-anchor="middle">${connection.label}</text>\n`;
        }
      }
    });

    svgContent += `\n  <!-- Nodes -->\n`;

    // Adiciona nós
    state.nodes.forEach(node => {
      const x = node.position.x;
      const y = node.position.y;
      const w = node.width;
      const h = node.height;
      const cx = x + w / 2;
      const cy = y + h / 2;

      // Define cores EXATAMENTE iguais ao aplicativo
      let fill = '#FFFFFF';
      let stroke = '#6B7280';
      
      switch (node.type) {
        case 'start':
          fill = '#10B981';  // Verde vibrante
          stroke = '#047857'; // Verde escuro
          break;
        case 'end':
          fill = '#EF4444';  // Vermelho vibrante
          stroke = '#DC2626'; // Vermelho escuro
          break;
        case 'process':
          fill = '#3B82F6';  // Azul vibrante
          stroke = '#1D4ED8'; // Azul escuro
          break;
        case 'decision':
          fill = '#F59E0B';  // Laranja/amarelo vibrante
          stroke = '#D97706'; // Laranja escuro
          break;
      }

      // Grupo para cada nó
      svgContent += `  <g>\n`;

      // Desenha a forma baseada no tipo
      if (node.type === 'start' || node.type === 'end') {
        // Elipse (círculo)
        svgContent += `    <ellipse cx="${cx}" cy="${cy}" rx="${w/2}" ry="${h/2}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>\n`;
      } else if (node.type === 'decision') {
        // Losango (diamante)
        const points = `${cx},${y} ${x+w},${cy} ${cx},${y+h} ${x},${cy}`;
        svgContent += `    <polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>\n`;
      } else {
        // Retângulo arredondado
        svgContent += `    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ry="8" fill="${fill}" stroke="${stroke}" stroke-width="2"/>\n`;
      }

      // Adiciona texto com quebra de linha (TEXTO BRANCO como no app)
      const maxTextWidth = node.type === 'decision' ? w - 16 : w - 32;
      const lines = wrapText(node.text, maxTextWidth);
      const lineHeight = 16;
      const totalTextHeight = lines.length * lineHeight;
      const startY = cy - totalTextHeight / 2 + lineHeight / 2;

      lines.forEach((line, index) => {
        const textY = startY + index * lineHeight;
        svgContent += `    <text x="${cx}" y="${textY}" font-family="Arial, sans-serif" font-size="14" font-weight="500" fill="white" text-anchor="middle" dominant-baseline="middle">${line}</text>\n`;
      });

      svgContent += `  </g>\n`;
    });

    svgContent += `</svg>`;

    // Download do arquivo SVG
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluxograma-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('🎨 Fluxograma exportado como SVG');
  }, [state]);

  const copyToFigma = useCallback(async () => {
    if (state.nodes.length === 0) {
      console.warn('⚠️ Nenhum nó para copiar');
      return { success: false, method: 'none' };
    }

    // Usa o utilitário que implementa o formato Figma nativo
    try {
      const result = await copyToFigmaClipboard(state.nodes, state.connections);
      if (result.success) {
        console.log(`✅ Fluxograma copiado usando método: ${result.method}`);
      }
      return result;
    } catch (error) {
      console.error('❌ Erro ao copiar para clipboard:', error);
      return { success: false, method: 'error' };
    }
  }, [state]);

  const importFromJSON = useCallback((jsonString: string) => {
    try {
      const parsed = flowchartPersistenceService.parse(jsonString);
      const applied = applyFlow(parsed);
      if (applied) {
        console.log('📤 Fluxograma importado com sucesso');
      }
      return applied;
    } catch (error) {
      console.error('Erro ao importar JSON:', error);
      return false;
    }
  }, [applyFlow]);

  return {
    ...state,
    addNode,
    removeNode,
    updateNodePosition,
    saveNodePositionToHistory,
    updateNodeText,
    resizeNode,
    startConnection,
    updateTemporaryConnection,
    endConnection,
    removeConnection,
    toggleConnectionLabel,
    selectNode,
    undo,
    redo,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    clearCanvas,
    applyFlow,
    exportAsJSON,
    exportAsSVG,
    copyToFigma,
    importFromJSON,
  };
};