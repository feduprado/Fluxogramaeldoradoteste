import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { AIModal } from './components/AIModal';
import { HelpModal } from './components/HelpModal';
import { useToast } from './components/Toast';
import { useFlowchart } from './hooks/useFlowchart';
import { usePanZoom } from './hooks/usePanZoom';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { AIParsedFlow, NodeType, OptimizationSuggestion, Suggestion } from './types';
import { CollaborationOverlay } from './components/CollaborationOverlay';
import { CollaborationStatus } from './components/CollaborationStatus';
import { PerformanceDashboard } from './components/PerformanceDashboard';
import { SmartSuggestions } from './components/SmartSuggestions';
import { useCollaboration } from './hooks/useCollaboration';
import { useLearning } from './hooks/useLearning';
import { ADVANCED_FEATURES } from './config/advanced';
import './styles/flowchart.css'; // Importa o CSS

const NODE_DEFAULT_SIZE: Record<NodeType, { width: number; height: number }> = {
  start: { width: 120, height: 120 },
  process: { width: 140, height: 80 },
  decision: { width: 120, height: 120 },
  end: { width: 120, height: 120 },
};

const App: React.FC = () => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShiftHint, setShowShiftHint] = useState(true);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const { showToast, ToastContainer } = useToast();
  const { theme, toggleTheme } = useTheme();
  const { suggestions, adaptiveUI, trackAction, dismissSuggestion } = useLearning();

  const {
    nodes,
    connections,
    selectedNodeId,
    temporaryConnection,
    addNode,
    removeNode,
    updateNodePosition,
    saveNodePositionToHistory,
    updateNodeText,
    startConnection,
    updateTemporaryConnection,
    endConnection,
    toggleConnectionLabel,
    selectNode,
    undo,
    redo,
    canUndo,
    canRedo,
    resizeNode,
    clearCanvas,
    applyFlow,
    exportAsJSON,
    exportAsSVG,
    copyToFigma,
    importFromJSON,
  } = useFlowchart();

  const {
    pan,
    zoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    resetView,
    zoomIn,
    zoomOut,
    centerFlow,
  } = usePanZoom();

  const handleRemoteState = useCallback(
    (state: { nodes: typeof nodes; connections: typeof connections }) => {
      if (!state) {
        return;
      }
      applyFlow(state);
    },
    [applyFlow]
  );

  const {
    collaborators,
    isConnected: isCollaborationActive,
    featureEnabled: isCollaborationEnabled,
  } = useCollaboration({
    roomId: 'fluxograma-room',
    flowSnapshot: { nodes, connections },
    selectedNodeId,
    onRemoteState: handleRemoteState,
  });

  useEffect(() => {
    trackAction({ type: 'app_loaded', context: { nodes: nodes.length } });
  }, [trackAction]);

  const handleDelete = () => {
    if (selectedNodeId) {
      removeNode(selectedNodeId);
      showToast('Nó excluído com sucesso', 'success');
    }
  };

  const handleAddNode = useCallback((type: NodeType) => {
    const rect = canvasContainerRef.current?.getBoundingClientRect();
    const viewportWidth = rect?.width ?? window.innerWidth;
    const viewportHeight = rect?.height ?? window.innerHeight;

    const defaultSize = NODE_DEFAULT_SIZE[type];
    const centerX = ((viewportWidth / 2) - pan.x) / zoom - defaultSize.width / 2;
    const centerY = ((viewportHeight / 2) - pan.y) / zoom - defaultSize.height / 2;

    addNode(type, { x: centerX, y: centerY });
    trackAction({ type: 'node_added', context: { nodeType: type } });
  }, [addNode, pan.x, pan.y, trackAction, zoom]);

  const handleMoveNode = (dx: number, dy: number) => {
    if (selectedNodeId) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) {
        updateNodePosition(selectedNodeId, {
          x: node.position.x + dx,
          y: node.position.y + dy
        });
        trackAction({ type: 'node_moved', context: { nodeId: selectedNodeId } });
      }
    }
  };

  const handleDuplicate = () => {
    if (selectedNodeId) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) {
        const newNode = {
          ...node,
          id: `node-${Date.now()}`,
          position: {
            x: node.position.x + 50,
            y: node.position.y + 50
          }
        };
        addNode(node.type, newNode.position);
      }
    }
  };

  const handleSelectNext = () => {
    if (nodes.length === 0) return;
    const currentIndex = nodes.findIndex(n => n.id === selectedNodeId);
    const nextIndex = (currentIndex + 1) % nodes.length;
    selectNode(nodes[nextIndex].id);
  };

  const handleSelectPrevious = () => {
    if (nodes.length === 0) return;
    const currentIndex = nodes.findIndex(n => n.id === selectedNodeId);
    const prevIndex = currentIndex <= 0 ? nodes.length - 1 : currentIndex - 1;
    selectNode(nodes[prevIndex].id);
  };

  const handleCancelConnection = () => {
    if (temporaryConnection) {
      updateTemporaryConnection(0, 0);
      // Reset temporary connection
    }
  };

  const handleExport = () => {
    const success = exportAsJSON();
    if (success) {
      showToast('Fluxograma exportado com sucesso!', 'success');
    } else {
      showToast('Erro ao exportar fluxograma', 'error');
    }
  };

  const handleExportSVG = () => {
    if (nodes.length === 0) {
      showToast('Adicione nós ao fluxograma antes de exportar', 'error');
      return;
    }
    exportAsSVG();
    showToast('Fluxograma exportado como SVG!', 'success');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          const success = importFromJSON(content);
          if (success) {
            showToast('Fluxograma importado com sucesso!', 'success');
          } else {
            showToast('Arquivo JSON inválido', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleImportSVG = () => {
    showToast(
      '⚠️ SVG é apenas visual. Use "Importar JSON" para recuperar fluxogramas completos com conexões.',
      'info'
    );
    
    // Ainda assim, permite selecionar o arquivo para futuras implementações
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.svg';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        showToast(
          'ℹ️ Recurso em desenvolvimento. Por enquanto, use JSON para importar fluxogramas.',
          'info'
        );
        console.log('SVG file selected:', file.name);
        // TODO: Implementar parser SVG -> JSON (complexo, requer análise de formas e posições)
      }
    };
    input.click();
  };

  const handleCopyToFigma = async () => {
    const result = await copyToFigma();
    if (result.success) {
      // Mensagens especficas por método
      const messages = {
        'clipboard-figma': '✅ Copiado! Cole no Figma com Ctrl+V',
        'clipboard-svg': '✅ SVG copiado! Cole no Figma com Ctrl+V',
        'clipboard-text': '✅ SVG copiado! Cole no Figma com Ctrl+V',
        'execCommand': '✅ SVG copiado! Cole no Figma com Ctrl+V',
        'download': '💾 Arquivo baixado! Arraste para o Figma',
        'none': '⚠️ Nenhum nó para copiar',
        'error': '❌ Erro ao copiar. Tente exportar como SVG.',
      };
      
      const message = messages[result.method as keyof typeof messages] || messages.error;
      const type = result.method === 'download' ? 'info' : 
                   result.method === 'none' || result.method === 'error' ? 'error' : 'success';
      
      showToast(message, type);
    } else {
      showToast('❌ Erro ao copiar. Tente exportar como SVG.', 'error');
    }
  };

  const handleApplyAIFlow = (flow: AIParsedFlow) => {
    const applied = applyFlow(flow);
    if (applied) {
      showToast('Fluxograma gerado pela IA aplicado!', 'success');
    } else {
      showToast('Fluxograma gerado pela IA inválido', 'error');
    }
  };

  const handleApplyOptimization = useCallback((suggestion: OptimizationSuggestion) => {
    showToast('Sugestão aplicada ao fluxo (visualização).', 'info');
    trackAction({ type: 'optimization_applied', context: { suggestionId: suggestion.id } });
  }, [showToast, trackAction]);

  const handleApplySmartSuggestion = useCallback((suggestion: Suggestion) => {
    showToast(`Sugestão aplicada: ${suggestion.title}`, 'success');
    dismissSuggestion(suggestion.id);
    trackAction({ type: 'suggestion_applied', context: { suggestionId: suggestion.id } });
  }, [dismissSuggestion, showToast, trackAction]);

  const handleClearCanvas = () => {
    if (nodes.length > 0 && !confirm('Tem certeza que deseja limpar o canvas? Esta ação não pode ser desfeita.')) {
      return;
    }
    clearCanvas();
    showToast('Canvas limpo com sucesso', 'info');
  };

  const handleResetView = () => {
    if (nodes.length > 0) {
      // Se há nós, centraliza o fluxo
      centerFlow(nodes);
      showToast('🎯 Fluxo centralizado!', 'success');
    } else {
      // Se não há nós, apenas reseta o pan/zoom
      resetView();
    }
  };

  // Oculta a dica após 8 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowShiftHint(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  useKeyboardShortcuts({
    onUndo: undo,
    onRedo: redo,
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onResetView: handleResetView,
    onAddNode: handleAddNode,
    onMoveNode: handleMoveNode,
    onSelectNext: handleSelectNext,
    onSelectPrevious: handleSelectPrevious,
    onCancelConnection: handleCancelConnection,
    onExport: handleExport,
    onImport: handleImport,
    onShowHelp: () => setShowHelp(true),
    selectedNodeId,
    hasTemporaryConnection: !!temporaryConnection,
    canUndo,
    canRedo,
  });

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
      <Toolbar
        onAddNode={handleAddNode}
        onRemoveNode={handleDelete}
        selectedNodeId={selectedNodeId}
        zoom={zoom}
        onZoomIn={zoomIn}
        onZoomOut={zoomOut}
        onResetView={handleResetView}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onAIClick={() => setShowAIModal(true)}
        onClearCanvas={handleClearCanvas}
        onExportJSON={exportAsJSON}
        onExportSVG={handleExportSVG}
        onImportJSON={handleImport}
        onImportSVG={handleImportSVG}
        onCopyToFigma={handleCopyToFigma}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <div className="advanced-controls">
        {isCollaborationEnabled && (
          <CollaborationStatus collaborators={collaborators} isConnected={isCollaborationActive} />
        )}
        {ADVANCED_FEATURES.performance.enabled && (
          <button
            onClick={() => setShowPerformanceDashboard(prev => !prev)}
            className="performance-toggle"
          >
            {showPerformanceDashboard ? 'Ocultar análise' : '📊 Análise de performance'}
          </button>
        )}
        {adaptiveUI.showTutorials && <span className="helper-pill">Modo guiado</span>}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative" ref={canvasContainerRef}>
          <Canvas
            nodes={nodes}
            connections={connections}
            selectedNodeId={selectedNodeId}
            temporaryConnection={temporaryConnection}
            zoom={zoom}
            pan={pan}
            onNodeSelect={selectNode}
            onNodeMove={updateNodePosition}
            onNodeTextChange={updateNodeText}
            onStartConnection={startConnection}
            onUpdateTemporaryConnection={updateTemporaryConnection}
            onEndConnection={endConnection}
            onConnectionLabelToggle={toggleConnectionLabel}
            onNodeResize={resizeNode}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            theme={theme}
          />

          {isCollaborationEnabled && (
            <CollaborationOverlay collaborators={collaborators} theme={theme} />
          )}

          <SmartSuggestions
            suggestions={suggestions}
            onApply={handleApplySmartSuggestion}
            onDismiss={dismissSuggestion}
            theme={theme}
          />
        </div>
        {showPerformanceDashboard && (
          <div className="performance-sidebar">
            <PerformanceDashboard
              nodes={nodes}
              connections={connections}
              theme={theme}
              onApplyOptimization={handleApplyOptimization}
            />
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className={`${theme === 'dark' ? 'bg-[#2C2C2C] border-[#3C3C3C] text-gray-300' : 'bg-white border-gray-200 text-gray-600'} border-t px-4 py-2 text-sm flex justify-between items-center`}>
        <span>
          {selectedNodeId ? 'Nó selecionado • ' : ''}
          {nodes.length} nós, {connections.length} conexões
        </span>
        
        <div className="flex items-center space-x-4">
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {zoom === 1 ? 'Zoom: 100%' : `Zoom: ${Math.round(zoom * 100)}%`}
          </span>
          <button
            onClick={() => setShowHelp(true)}
            className={`px-4 py-2 rounded-lg transition-colors font-medium flex items-center space-x-2 ${
              theme === 'dark' 
                ? 'bg-purple-700 hover:bg-purple-600 text-white' 
                : 'bg-purple-500 hover:bg-purple-600 text-white'
            }`}
            title="Ver guia completo e atalhos (F1)"
          >
            <span>📚</span>
            <span>Guia</span>
          </button>
        </div>
      </div>

      {/* Modais */}
      <AIModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApplyFlow={handleApplyAIFlow}
        theme={theme}
      />

      <HelpModal 
        isOpen={showHelp} 
        onClose={() => setShowHelp(false)}
        theme={theme}
      />

      {/* Toast Container */}
      <ToastContainer />

      {/* Shift Hint - Dica inicial */}
      {showShiftHint && (
        <div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
          style={{ animation: 'bounce 1s ease-in-out 3' }}
        >
          <div className="flex items-center space-x-3">
            <span className="text-2xl">⌨️</span>
            <div>
              <div className="font-semibold">💡 Dica Importante!</div>
              <div className="text-sm text-purple-200">
                Segure <strong className="text-white">SHIFT</strong> e clique para arrastar os nós com o mouse! 🖱️
              </div>
            </div>
            <button
              onClick={() => setShowShiftHint(false)}
              className="ml-2 text-purple-200 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;