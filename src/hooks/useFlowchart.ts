import { useState, useCallback, useEffect, useRef } from 'react';
import { FlowNode, NodeType, Connection, FlowchartState, ConnectionStyle } from '../types';
import { Container } from '../types/container';
import { CONTAINER_COLORS, CONTAINER_BORDER_COLORS } from '../types/container';
import { copyToFigmaClipboard } from '../utils/figmaClipboard';
import { generateEnhancedSVG } from '../utils/exportSVGEnhanced';

interface ExtendedFlowchartState extends FlowchartState {
  containers: Container[];
  selectedContainerId: string | null;
  selectedContainerIds: string[]; // 🆕 Multi-seleção de containers
  selectedNodeIds: string[]; // 🆕 Multi-seleção
}

const initialState: ExtendedFlowchartState = {
  nodes: [],
  connections: [],
  containers: [],
  selectedNodeId: null,
  selectedNodeIds: [], // 🆕 Multi-seleção
  selectedContainerId: null,
  selectedContainerIds: [], // 🆕 Multi-seleção de containers
  temporaryConnection: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
};

const MAX_HISTORY = 50;

export const useFlowchart = () => {
  const [state, setState] = useState<ExtendedFlowchartState>(initialState);
  const [history, setHistory] = useState<ExtendedFlowchartState[]>([initialState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoAction = useRef(false);

  // Auto-save no localStorage
  useEffect(() => {
    if (state.nodes.length > 0 || state.connections.length > 0) {
      const saveData = {
        nodes: state.nodes,
        connections: state.connections,
      };
      localStorage.setItem('flowchart-autosave', JSON.stringify(saveData));
      console.log('💾 Auto-save realizado');
    }
  }, [state.nodes, state.connections]);

  // Carregar auto-save ao inicializar
  useEffect(() => {
    const saved = localStorage.getItem('flowchart-autosave');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.nodes && data.nodes.length > 0) {
          setState({
            ...initialState,
            nodes: data.nodes,
            connections: data.connections || [],
          });
          console.log('📂 Auto-save carregado');
        }
      } catch (error) {
        console.error('Erro ao carregar auto-save:', error);
      }
    }
  }, []);

  // Adicionar ao histórico (para undo/redo)
  const addToHistory = useCallback((newState: ExtendedFlowchartState) => {
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
      width: type === 'decision' ? 180 : type === 'start' || type === 'end' ? 160 : 140,
      height: type === 'decision' ? 180 : type === 'start' || type === 'end' ? 160 : 80,
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
    setState(prev => {
      const node = prev.nodes.find(n => n.id === nodeId);
      if (!node) return prev;

      // Verifica se o node está dentro de algum container
      let newContainerId: string | undefined = undefined;
      let containerName: string | undefined = undefined;
      
      for (const container of prev.containers) {
        // Calcula o centro do node
        const nodeCenterX = newPosition.x + node.width / 2;
        const nodeCenterY = newPosition.y + node.height / 2;
        
        // Verifica se o centro do node está dentro do container
        const isInside = 
          nodeCenterX >= container.position.x &&
          nodeCenterX <= container.position.x + container.size.width &&
          nodeCenterY >= container.position.y &&
          nodeCenterY <= container.position.y + container.size.height;
        
        if (isInside) {
          newContainerId = container.id;
          containerName = container.name;
          break; // Usa o primeiro container encontrado
        }
      }

      // Log quando o containerId muda
      if (node.containerId !== newContainerId) {
        if (newContainerId) {
          console.log(`📦 Node "${node.text}" preso ao container "${containerName}"`);
        } else {
          console.log(`🔓 Node "${node.text}" liberado do container`);
        }
      }

      return {
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === nodeId ? { ...n, position: newPosition, containerId: newContainerId } : n
        ),
      };
    });
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
    console.log('🔗 Iniciando conexão de:', nodeId);
    setState(prev => {
      // Primeiro tenta encontrar um nó
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
      
      // Se não for um nó, tenta encontrar um container
      const container = prev.containers.find(c => c.id === nodeId);
      if (container) {
        return {
          ...prev,
          temporaryConnection: { 
            fromNodeId: nodeId, 
            x: container.position.x + container.size.width / 2, 
            y: container.position.y + container.size.height / 2 
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
        
        const newConnection: Connection = {
          id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          fromNodeId: prev.temporaryConnection.fromNodeId,
          toNodeId: nodeId,
        };
        
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

  const updateConnectionLabel = useCallback((connectionId: string, label: string | undefined) => {
    console.log('🏷️ Atualizando label da conexão:', connectionId, label);
    setState(prev => {
      const newState = {
        ...prev,
        connections: prev.connections.map(conn =>
          conn.id === connectionId ? { ...conn, label } : conn
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const updateConnectionStyle = useCallback((connectionId: string, style: ConnectionStyle) => {
    console.log('🎨 Atualizando estilo da conexão:', connectionId, style);
    setState(prev => {
      const newState = {
        ...prev,
        connections: prev.connections.map(conn =>
          conn.id === connectionId ? { ...conn, style: { ...conn.style, ...style } } : conn
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const updateConnectionPoints = useCallback((connectionId: string, points: { x: number; y: number }[]) => {
    setState(prev => ({
      ...prev,
      connections: prev.connections.map(conn =>
        conn.id === connectionId ? { ...conn, points } : conn
      ),
    }));
  }, []);

  const applyStyleToAllConnections = useCallback((style: ConnectionStyle) => {
    console.log('🎨 Aplicando estilo a todas as conexões:', style);
    setState(prev => {
      const newState = {
        ...prev,
        connections: prev.connections.map(conn => ({
          ...conn,
          style: { ...conn.style, ...style }
        })),
      };
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
    const newState: ExtendedFlowchartState = {
      nodes: [],
      connections: [],
      containers: [],
      selectedNodeId: null,
      selectedNodeIds: [], // 🔧
      selectedContainerId: null,
      selectedContainerIds: [], // 🔧
      temporaryConnection: null,
      zoom: 1,
      pan: { x: 0, y: 0 },
    };
    setState(newState);
    addToHistory(newState);
    localStorage.removeItem('flowchart-autosave');
  }, [addToHistory]);

  const applyFlow = useCallback((flow: { nodes: FlowNode[]; connections: Connection[]; containers?: Container[] }, mergeWithExisting: boolean = false) => {
    console.log('🤖 Aplicando fluxo da IA:', flow, 'Merge:', mergeWithExisting);
    
    let finalNodes = flow.nodes;
    let finalConnections = flow.connections;
    let finalContainers = flow.containers || [];
    
    // Se mergeWithExisting for true, combina com os nós/conexões existentes
    if (mergeWithExisting) {
      finalNodes = [...state.nodes, ...flow.nodes];
      finalConnections = [...state.connections, ...flow.connections];
      finalContainers = [...state.containers, ...(flow.containers || [])];
      console.log('✅ Mesclando com nós existentes. Total:', finalNodes.length);
    }
    
    const newState = {
      nodes: finalNodes,
      connections: finalConnections,
      containers: finalContainers,
      selectedNodeId: null,
      selectedNodeIds: [], // 🔧
      selectedContainerId: null,
      selectedContainerIds: [], // 🔧
      temporaryConnection: null,
      zoom: mergeWithExisting ? state.zoom : 1,
      pan: mergeWithExisting ? state.pan : { x: 0, y: 0 },
    };
    setState(newState);
    addToHistory(newState);
  }, [addToHistory, state]);

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
    const data = {
      nodes: state.nodes,
      connections: state.connections,
      containers: state.containers,
      pan: state.pan,
      zoom: state.zoom,
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
      },
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fluxograma-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('📥 Fluxograma exportado como JSON');
  }, [state]);

  const exportAsSVG = useCallback(() => {
    const svgContent = generateEnhancedSVG(state.nodes, state.connections, state.containers);
    
    if (!svgContent) {
      console.warn('⚠️ Nada para exportar');
      return;
    }

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
    if (state.nodes.length === 0 && state.containers.length === 0) {
      console.warn('⚠️ Nada para copiar');
      return { success: false, method: 'none' };
    }

    // Usa o utilitário que implementa SVG fiel ao canvas
    try {
      const result = await copyToFigmaClipboard(state.nodes, state.connections, state.containers);
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
      const data = JSON.parse(jsonString);
      if (data.nodes && Array.isArray(data.nodes)) {
        const newState: ExtendedFlowchartState = {
          nodes: data.nodes,
          connections: data.connections || [],
          containers: Array.isArray(data.containers) ? data.containers : [],
          selectedNodeId: null,
          selectedNodeIds: [], // 🔧
          selectedContainerId: null,
          selectedContainerIds: [], // 🔧
          temporaryConnection: null,
          zoom: typeof data.zoom === 'number' ? data.zoom : 1,
          pan: data.pan && typeof data.pan.x === 'number' && typeof data.pan.y === 'number'
            ? data.pan
            : { x: 0, y: 0 },
        };
        setState(newState);
        addToHistory(newState);
        console.log('📤 Fluxograma importado com sucesso');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao importar JSON:', error);
      return false;
    }
  }, [addToHistory]);

  // ========== CONTAINER OPERATIONS ==========

  const addContainer = useCallback((type: Container['type'], position: { x: number; y: number }, title: string) => {
    console.log('📦 Adicionando container:', type, title);
    
    const newContainer: Container = {
      id: `container-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      name: title, // Nome editável
      title,
      position,
      size: { width: 400, height: 300 },
      color: CONTAINER_COLORS[type],
      nodes: [],
      children: [],
      parentId: null,
      isCollapsed: false,
      isLocked: false, // Inicialmente desbloqueado
      zIndex: 1,
    };

    setState(prev => {
      const newState = {
        ...prev,
        containers: [...prev.containers, newContainer],
        selectedContainerId: newContainer.id,
        selectedNodeId: null,
      };
      addToHistory(newState);
      return newState;
    });

    return newContainer.id;
  }, [addToHistory]);

  const removeContainer = useCallback((containerId: string) => {
    console.log('🗑️ Removendo container:', containerId);
    setState(prev => {
      const newState = {
        ...prev,
        containers: prev.containers.filter(c => c.id !== containerId),
        selectedContainerId: prev.selectedContainerId === containerId ? null : prev.selectedContainerId,
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const updateContainerPosition = useCallback((containerId: string, newPosition: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      containers: prev.containers.map(c =>
        c.id === containerId ? { ...c, position: newPosition } : c
      ),
    }));
  }, []);

  const updateContainerSize = useCallback((containerId: string, newSize: { width: number; height: number }) => {
    setState(prev => ({
      ...prev,
      containers: prev.containers.map(c =>
        c.id === containerId ? { ...c, size: newSize } : c
      ),
    }));
  }, []);

  const toggleContainerCollapse = useCallback((containerId: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        containers: prev.containers.map(c =>
          c.id === containerId ? { ...c, isCollapsed: !c.isCollapsed } : c
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const selectContainer = useCallback((containerId: string | null) => {
    console.log('🎯 Selecionando container:', containerId);
    setState(prev => ({ 
      ...prev, 
      selectedContainerId: containerId,
      selectedNodeId: null, // Desseleciona nós quando seleciona container
    }));
  }, []);
  
  const renameContainer = useCallback((containerId: string, newName: string) => {
    console.log('✏️ Renomeando container:', containerId, newName);
    setState(prev => {
      const newState = {
        ...prev,
        containers: prev.containers.map(c =>
          c.id === containerId ? { ...c, name: newName, title: newName } : c
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);
  
  // Controle de camadas (z-index)
  const bringToFront = useCallback((containerId: string) => {
    console.log('⬆️⬆️ Trazendo container para frente:', containerId);
    setState(prev => {
      const maxZIndex = Math.max(...prev.containers.map(c => c.zIndex), 0);
      const newState = {
        ...prev,
        containers: prev.containers.map(c =>
          c.id === containerId ? { ...c, zIndex: maxZIndex + 1 } : c
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const sendToBack = useCallback((containerId: string) => {
    console.log('⬇️⬇️ Enviando container para trás:', containerId);
    setState(prev => {
      const minZIndex = Math.min(...prev.containers.map(c => c.zIndex), 1);
      const newState = {
        ...prev,
        containers: prev.containers.map(c =>
          c.id === containerId ? { ...c, zIndex: minZIndex - 1 } : c
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const moveUp = useCallback((containerId: string) => {
    console.log('⬆️ Movendo container uma camada acima:', containerId);
    setState(prev => {
      const container = prev.containers.find(c => c.id === containerId);
      if (!container) return prev;

      // Encontra o próximo container acima
      const nextContainer = prev.containers
        .filter(c => c.zIndex > container.zIndex)
        .sort((a, b) => a.zIndex - b.zIndex)[0];

      if (!nextContainer) return prev;

      const newState = {
        ...prev,
        containers: prev.containers.map(c => {
          if (c.id === containerId) return { ...c, zIndex: nextContainer.zIndex };
          if (c.id === nextContainer.id) return { ...c, zIndex: container.zIndex };
          return c;
        }),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const moveDown = useCallback((containerId: string) => {
    console.log('⬇️ Movendo container uma camada abaixo:', containerId);
    setState(prev => {
      const container = prev.containers.find(c => c.id === containerId);
      if (!container) return prev;

      // Encontra o container abaixo
      const prevContainer = prev.containers
        .filter(c => c.zIndex < container.zIndex)
        .sort((a, b) => b.zIndex - a.zIndex)[0];

      if (!prevContainer) return prev;

      const newState = {
        ...prev,
        containers: prev.containers.map(c => {
          if (c.id === containerId) return { ...c, zIndex: prevContainer.zIndex };
          if (c.id === prevContainer.id) return { ...c, zIndex: container.zIndex };
          return c;
        }),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const toggleContainerLock = useCallback((containerId: string) => {
    console.log('🔒 Alternando lock do container:', containerId);
    setState(prev => {
      const container = prev.containers.find(c => c.id === containerId);
      if (!container) return prev;

      const newState = {
        ...prev,
        containers: prev.containers.map(c =>
          c.id === containerId ? { ...c, isLocked: !c.isLocked } : c
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  // ========== MULTI-SELEÇÃO ==========
  
  const toggleNodeSelection = useCallback((nodeId: string, isShiftPressed: boolean) => {
    console.log('🎯 Toggle seleção de nó:', nodeId, 'Shift:', isShiftPressed);
    setState(prev => {
      // 🔧 Garantir que selectedNodeIds existe e é array
      const currentSelectedIds = prev.selectedNodeIds || [];
      let newSelectedNodeIds: string[];
      
      if (isShiftPressed) {
        // Multi-seleção: adiciona ou remove da lista
        if (currentSelectedIds.includes(nodeId)) {
          newSelectedNodeIds = currentSelectedIds.filter(id => id !== nodeId);
        } else {
          newSelectedNodeIds = [...currentSelectedIds, nodeId];
        }
      } else {
        // Seleção simples: apenas este nó
        newSelectedNodeIds = [nodeId];
      }

      return {
        ...prev,
        selectedNodeIds: newSelectedNodeIds,
        selectedNodeId: newSelectedNodeIds.length > 0 ? newSelectedNodeIds[0] : null,
        selectedContainerId: null,
        selectedContainerIds: [],
      };
    });
  }, []);

  const selectMultipleNodes = useCallback((nodeIds: string[]) => {
    console.log('🎯 Selecionando múltiplos nós:', nodeIds);
    setState(prev => ({
      ...prev,
      selectedNodeIds: nodeIds,
      selectedNodeId: nodeIds.length > 0 ? nodeIds[0] : null,
      selectedContainerId: null,
      selectedContainerIds: [],
    }));
  }, []);

  const clearSelection = useCallback(() => {
    console.log('🧹 Limpando seleção');
    setState(prev => ({
      ...prev,
      selectedNodeIds: [],
      selectedNodeId: null,
      selectedContainerIds: [],
      selectedContainerId: null,
    }));
  }, []);

  // ========== FIXAÇÃO DE NÓS ==========
  
  const toggleNodeFixed = useCallback((nodeId: string) => {
    console.log('🔒 Toggle fixação de nó:', nodeId);
    setState(prev => {
      const node = prev.nodes.find(n => n.id === nodeId);
      if (!node || !node.containerId) {
        console.warn('⚠️ Nó deve estar em um container para ser fixado');
        return prev;
      }

      const newState = {
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === nodeId ? { ...n, isFixed: !n.isFixed } : n
        ),
      };
      addToHistory(newState);
      return newState;
    });
  }, [addToHistory]);

  const toggleSelectedNodesFixed = useCallback(() => {
    console.log('🔒 Toggle fixação de nós selecionados');
    setState(prev => {
      // 🔧 Garantir que selectedNodeIds existe e é array
      const selectedIds = prev.selectedNodeIds || [];
      
      // Verifica se todos os nós selecionados estão em containers
      const selectedNodes = prev.nodes.filter(n => selectedIds.includes(n.id));
      const nodesInContainers = selectedNodes.filter(n => n.containerId);
      
      if (nodesInContainers.length === 0) {
        console.warn('⚠️ Nenhum nó selecionado está em um container');
        return prev;
      }

      // Toggle: se todos estão fixos, desfixa; senão, fixa todos
      const allFixed = nodesInContainers.every(n => n.isFixed);
      const newFixedState = !allFixed;

      const newState = {
        ...prev,
        nodes: prev.nodes.map(n =>
          selectedIds.includes(n.id) && n.containerId
            ? { ...n, isFixed: newFixedState }
            : n
        ),
      };
      addToHistory(newState);
      
      console.log(`✅ Nós ${newFixedState ? 'fixados' : 'desfixados'}:`, nodesInContainers.length);
      return newState;
    });
  }, [addToHistory]);

  // ========== ARRASTE MÚLTIPLO ==========
  
  // Ref para guardar as posições originais durante o arraste
  const multiDragOriginalPositions = useRef<Map<string, { x: number; y: number }>>(new Map());
  
  const updateMultipleNodesPosition = useCallback((
    nodeIds: string[],
    delta: { x: number; y: number }
  ) => {
    setState(prev => {
      // Se não há posições originais salvas, salva agora (primeiro movimento)
      if (multiDragOriginalPositions.current.size === 0) {
        nodeIds.forEach(id => {
          const node = prev.nodes.find(n => n.id === id);
          if (node) {
            multiDragOriginalPositions.current.set(id, { ...node.position });
          }
        });
        console.log('💾 Posições originais salvas para arraste múltiplo');
      }
      
      let updatedNodes = [...prev.nodes];
      
      // Aplica o delta às posições ORIGINAIS
      nodeIds.forEach(nodeId => {
        const node = updatedNodes.find(n => n.id === nodeId);
        const originalPos = multiDragOriginalPositions.current.get(nodeId);
        
        if (!node || node.isFixed || !originalPos) {
          return; // Não move nós fixos
        }

        const newPosition = {
          x: originalPos.x + delta.x,
          y: originalPos.y + delta.y,
        };

        // Verifica containers
        let newContainerId: string | undefined = undefined;
        
        for (const container of prev.containers) {
          const nodeCenterX = newPosition.x + node.width / 2;
          const nodeCenterY = newPosition.y + node.height / 2;
          
          const isInside = 
            nodeCenterX >= container.position.x &&
            nodeCenterX <= container.position.x + container.size.width &&
            nodeCenterY >= container.position.y &&
            nodeCenterY <= container.position.y + container.size.height;
          
          if (isInside) {
            newContainerId = container.id;
            break;
          }
        }

        updatedNodes = updatedNodes.map(n =>
          n.id === nodeId ? { ...n, position: newPosition, containerId: newContainerId } : n
        );
      });

      return {
        ...prev,
        nodes: updatedNodes,
      };
    });
  }, []);
  
  // Limpa as posições originais quando finaliza o arraste
  const clearMultiDragPositions = useCallback(() => {
    multiDragOriginalPositions.current.clear();
    console.log('🧹 Posições originais de arraste múltiplo limpas');
  }, []);

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
    updateConnectionLabel,
    updateConnectionStyle,
    updateConnectionPoints,
    applyStyleToAllConnections,
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
    // Container operations
    addContainer,
    removeContainer,
    updateContainerPosition,
    updateContainerSize,
    toggleContainerCollapse,
    selectContainer,
    renameContainer,
    bringToFront,
    sendToBack,
    moveUp,
    moveDown,
    toggleContainerLock,
    // 🆕 Multi-seleção
    toggleNodeSelection,
    selectMultipleNodes,
    clearSelection,
    // 🆕 Fixação de nós
    toggleNodeFixed,
    toggleSelectedNodesFixed,
    // 🆕 Arraste múltiplo
    updateMultipleNodesPosition,
    clearMultiDragPositions,
  };
};