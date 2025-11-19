import React, { useState, useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { AIModalEnhanced } from './components/AIModalEnhanced';
import { HelpModal } from './components/HelpModal';
import { ConnectionContextMenu } from './components/ConnectionContextMenu';
import { ConnectionToolbar } from './components/ConnectionToolbar';
import { ContainerToolbar } from './components/ContainerToolbar';
import { FlowchartErrorBoundary } from './components/ErrorBoundary';
import { useToast } from './components/Toast';
import { useFlowchart } from './hooks/useFlowchart';
import { usePanZoom } from './hooks/usePanZoom';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { useConnectionStyle } from './hooks/useConnectionStyle';
import { AIParsedFlow } from './types';
import './styles/flowchart.css'; // Importa o CSS

const AppContent: React.FC = () => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShiftHint, setShowShiftHint] = useState(true);
  const [showConnectionToolbar, setShowConnectionToolbar] = useState(false);
  const [showContainerToolbar, setShowContainerToolbar] = useState(false);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [connectionMenu, setConnectionMenu] = useState<{
    connectionId: string;
    position: { x: number; y: number };
  } | null>(null);
  const { showToast, ToastContainer } = useToast();
  const { theme, toggleTheme } = useTheme();
  
  const {
    nodes,
    connections,
    selectedNodeId,
    selectedNodeIds, // 🆕 Multi-seleção
    selectedContainerId,
    selectedContainerIds, // 🆕
    temporaryConnection,
    addNode,
    removeNode,
    updateNodePosition,
    saveNodePositionToHistory,
    updateNodeText,
    startConnection,
    updateTemporaryConnection,
    endConnection,
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
    updateConnectionLabel,
    updateConnectionStyle,
    updateConnectionPoints,
    applyStyleToAllConnections,
    removeConnection, // Adicionado
    // Container operations
    containers,
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
    clearMultiDragPositions, // 🆕 Limpa posições do arraste
  } = useFlowchart();

  const {
    connectionStyle,
    updateConnectionStyle: updateGlobalConnectionStyle,
  } = useConnectionStyle();

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

  const handleDelete = () => {
    if (selectedNodeId) {
      removeNode(selectedNodeId);
      showToast('Nó excluído com sucesso', 'success');
    } else if (selectedConnectionId) {
      removeConnection(selectedConnectionId);
      setSelectedConnectionId(null);
      showToast('Conexão excluída com sucesso', 'success');
    }
  };

  const handleAddNode = (type: string) => {
    const centerX = 400; // Posição fixa central
    const centerY = 300;
    addNode(type as any, { x: centerX, y: centerY });
  };

  const handleMoveNode = (dx: number, dy: number) => {
    if (selectedNodeId) {
      const node = nodes.find(n => n.id === selectedNodeId);
      if (node) {
        updateNodePosition(selectedNodeId, {
          x: node.position.x + dx,
          y: node.position.y + dy
        });
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
    exportAsJSON();
    showToast('Fluxograma exportado com sucesso!', 'success');
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
          try {
            const data = JSON.parse(event.target?.result as string);
            if (data.nodes && data.connections) {
              applyFlow(data);
              showToast('Fluxograma importado com sucesso!', 'success');
            } else {
              showToast('Arquivo JSON inválido', 'error');
            }
          } catch (error) {
            console.error('Error importing file:', error);
            showToast('Erro ao importar arquivo', 'error');
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
    applyFlow(flow);
    showToast('Fluxograma gerado pela IA aplicado!', 'success');
  };

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

  const handleConnectionClick = (connectionId: string, position: { x: number; y: number }) => {
    // Converte a posição do canvas para a tela considerando zoom e pan
    const screenX = position.x * zoom + pan.x;
    const screenY = position.y * zoom + pan.y;
    
    setConnectionMenu({
      connectionId,
      position: { x: screenX, y: screenY }
    });
  };

  const handleSetConnectionLabel = (label: string | undefined) => {
    if (connectionMenu) {
      updateConnectionLabel(connectionMenu.connectionId, label);
      showToast(
        label ? `Label "${label}" adicionada à conexão` : 'Label removida da conexão',
        'success'
      );
    }
  };

  // Handlers do Connection Toolbar
  const handleStyleChange = (newStyle: typeof connectionStyle) => {
    updateGlobalConnectionStyle(newStyle);
    if (selectedConnectionId) {
      // Aplica o estilo à conexão selecionada
      updateConnectionStyle(selectedConnectionId, newStyle);
      showToast('Estilo atualizado para a conexão selecionada', 'success');
    }
  };

  const handleApplyStyleToAll = () => {
    applyStyleToAllConnections(connectionStyle);
    showToast(`Estilo aplicado a ${connections.length} conexões`, 'success');
  };

  const handleResetAllStyles = () => {
    const defaultStyle = {
      type: 'elbow' as const,
      color: '#3B82F6',
      strokeWidth: 2,
      dashed: false,
      curvature: 0.5
    };
    updateGlobalConnectionStyle(defaultStyle);
    applyStyleToAllConnections(defaultStyle);
    showToast('Estilos redefinidos para o padrão', 'success');
  };

  const handleConnectionSelect = (connectionId: string) => {
    setSelectedConnectionId(connectionId);
    selectNode(null); // Desseleciona nó quando seleciona conexão
    
    // Atualiza o estilo global com o estilo da conexão selecionada
    const connection = connections.find(c => c.id === connectionId);
    if (connection?.style) {
      updateGlobalConnectionStyle(connection.style);
    }
  };

  const handleUpdateConnectionPoints = (connectionId: string, points: { x: number; y: number }[]) => {
    updateConnectionPoints(connectionId, points);
  };

  // Oculta a dica após 8 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowShiftHint(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  // 🔧 Corrige automaticamente o tamanho dos nós de decisão existentes
  useEffect(() => {
    let hasUpdates = false;
    nodes.forEach(node => {
      // Corrige nós de decisão
      if (node.type === 'decision' && (node.width < 180 || node.height < 180)) {
        resizeNode(node.id, { width: 180, height: 180 });
        hasUpdates = true;
      }
      // Corrige nós de início e fim
      else if ((node.type === 'start' || node.type === 'end') && (node.width < 160 || node.height < 160)) {
        resizeNode(node.id, { width: 160, height: 160 });
        hasUpdates = true;
      }
    });
    if (hasUpdates) {
      console.log('✅ Nós atualizados para os novos tamanhos (Decisão: 180x180, Início/Fim: 160x160)');
      showToast('✨ Nós atualizados!', 'info');
    }
  }, [nodes, resizeNode, showToast]); // Monitora mudanças nos nós

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
    onToggleFixed: toggleSelectedNodesFixed, // 🆕 Tecla F para fixar/desfixar
    selectedNodeId,
    selectedConnectionId, // Adicionado
    hasTemporaryConnection: !!temporaryConnection,
    canUndo,
    canRedo,
  });

  return (
    <div className={`h-screen flex flex-col ${theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-white'}`}>
      <Toolbar
        onAddNode={(type, position) => addNode(type, position)}
        onRemoveNode={handleDelete}
        selectedNodeId={selectedNodeId}
        selectedContainerId={selectedContainerId}
        selectedConnectionId={selectedConnectionId}
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
        onExportSVG={exportAsSVG}
        onImportJSON={handleImport}
        onImportSVG={handleImportSVG}
        onCopyToFigma={handleCopyToFigma}
        theme={theme}
        onToggleTheme={toggleTheme}
        onAddContainer={addContainer}
        onRemoveContainer={() => selectedContainerId && removeContainer(selectedContainerId)}
        onToggleContainerCollapse={() => selectedContainerId && toggleContainerCollapse(selectedContainerId)}
        onConnectionStyleClick={() => setShowConnectionToolbar(!showConnectionToolbar)}
        onContainerLayersClick={() => setShowContainerToolbar(!showContainerToolbar)}
      />
      
      <Canvas
        nodes={nodes}
        connections={connections}
        containers={containers}
        selectedNodeId={selectedNodeId}
        selectedNodeIds={selectedNodeIds} // 🆕 Multi-seleção
        selectedContainerId={selectedContainerId}
        selectedConnectionId={selectedConnectionId}
        temporaryConnection={temporaryConnection}
        zoom={zoom}
        pan={pan}
        onNodeSelect={selectNode}
        onToggleNodeSelection={toggleNodeSelection} // 🆕 Multi-seleção
        onContainerSelect={selectContainer}
        onConnectionSelect={handleConnectionSelect}
        onNodeMove={updateNodePosition}
        onMoveMultiple={updateMultipleNodesPosition} // 🆕 Arraste múltiplo
        onClearMultiDrag={clearMultiDragPositions} // 🆕 Limpa posições do arraste
        onNodeTextChange={updateNodeText}
        onStartConnection={startConnection}
        onUpdateTemporaryConnection={updateTemporaryConnection}
        onEndConnection={endConnection}
        onNodeResize={resizeNode}
        onContainerMove={updateContainerPosition}
        onContainerResize={updateContainerSize}
        onToggleContainerCollapse={toggleContainerCollapse}
        onContainerRename={renameContainer}
        onConnectionClick={handleConnectionClick}
        onUpdateConnectionPoints={handleUpdateConnectionPoints}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        theme={theme}
      />

      {/* Menu contextual de conexões */}
      {connectionMenu && (
        <ConnectionContextMenu
          position={connectionMenu.position}
          currentLabel={connections.find(c => c.id === connectionMenu.connectionId)?.label}
          onSetLabel={handleSetConnectionLabel}
          onClose={() => setConnectionMenu(null)}
          theme={theme}
        />
      )}

      {/* Toolbar de Estilos de Conexões */}
      {showConnectionToolbar && (
        <div className="fixed top-20 right-4 z-50">
          <ConnectionToolbar
            style={connectionStyle}
            onStyleChange={handleStyleChange}
            onApplyToAll={handleApplyStyleToAll}
            onResetAll={handleResetAllStyles}
            onClose={() => setShowConnectionToolbar(false)}
            selectedConnectionId={selectedConnectionId}
            theme={theme}
          />
        </div>
      )}

      {/* Toolbar de Controle de Camadas de Containers */}
      {showContainerToolbar && (
        <div className="fixed top-20 left-4 z-50">
          <ContainerToolbar
            containers={containers}
            selectedContainerId={selectedContainerId}
            onRemoveContainer={removeContainer}
            onBringToFront={bringToFront}
            onSendToBack={sendToBack}
            onMoveUp={moveUp}
            onMoveDown={moveDown}
            onToggleLock={toggleContainerLock}
            onClose={() => setShowContainerToolbar(false)}
          />
        </div>
      )}

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
      <AIModalEnhanced
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        onApplyFlow={handleApplyAIFlow}
        theme={theme}
        existingNodes={nodes}
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
              <div className="font-semibold">💡 Dicas Importantes!</div>
              <div className="text-sm text-purple-200">
                <strong className="text-white">SHIFT + Clique:</strong> Labels Sim/Não nos hooks 🔗 | 
                <strong className="text-white"> DEL:</strong> Apague nós/hooks 🗑️ | 
                Containers conectam como nós 📦
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

const App: React.FC = () => {
  return (
    <FlowchartErrorBoundary>
      <AppContent />
    </FlowchartErrorBoundary>
  );
};

export default App;