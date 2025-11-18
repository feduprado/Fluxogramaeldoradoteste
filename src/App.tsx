import React, { useState, useEffect, useMemo } from 'react';
import { Toolbar } from './components/Toolbar';
import { Canvas } from './components/Canvas';
import { AIModal } from './components/AIModal';
import { HelpModal } from './components/HelpModal';
import { useToast } from './components/Toast';
import { useFlowchart } from './hooks/useFlowchart';
import { usePanZoom } from './hooks/usePanZoom';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useTheme } from './hooks/useTheme';
import { AIParsedFlow, AISuggestion, ExportFormat } from './types';
import { useGeminiAI } from './hooks/useGeminiAI';
import { useFlowValidation } from './hooks/useFlowValidation';
import { FlowTemplateService } from './services/flowTemplates';
import { SmartExportService } from './services/exportService';
import { AIAnalysisPanel } from './components/panels/AIAnalysisPanel';
import { TemplateGallery } from './components/panels/TemplateGallery';
import { ValidationPanel } from './components/panels/ValidationPanel';
import { ExportMenu } from './components/panels/ExportMenu';
import './styles/flowchart.css'; // Importa o CSS

const App: React.FC = () => {
  const [showAIModal, setShowAIModal] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShiftHint, setShowShiftHint] = useState(true);
  const { showToast, ToastContainer } = useToast();
  const { theme, toggleTheme } = useTheme();
  const geminiAI = useGeminiAI();
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [isTemplateLoading, setIsTemplateLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const templateService = useMemo(
    () => new FlowTemplateService(geminiAI.service),
    [geminiAI.service]
  );
  const exportService = useMemo(
    () => new SmartExportService(geminiAI.service),
    [geminiAI.service]
  );
  const templateCategories = useMemo(
    () => templateService.getPredefinedTemplates(),
    [templateService]
  );
  
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

  const { issues, validateFlowchart, isValidating } = useFlowValidation(nodes, connections, {
    aiAnalyzer: geminiAI.analyzeFlowchart,
  });

  const handleDelete = () => {
    if (selectedNodeId) {
      removeNode(selectedNodeId);
      showToast('Nó excluído com sucesso', 'success');
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

  const handleAnalyzeWithGemini = async () => {
    if (nodes.length === 0) {
      showToast('Adicione nós antes de solicitar análise com IA.', 'info');
      return;
    }
    try {
      await geminiAI.analyzeFlowchart(nodes, connections);
      showToast('Análise da IA concluída!', 'success');
    } catch (error) {
      console.error('Erro ao analisar com IA:', error);
      showToast('Erro ao analisar com IA.', 'error');
    }
  };

  const handleGetAISuggestions = async () => {
    if (nodes.length === 0) {
      showToast('Adicione nós antes de solicitar sugestões.', 'info');
      return;
    }
    const flowchartState = {
      nodes,
      connections,
      selectedNodeId,
      temporaryConnection,
      zoom: 1,
      pan: { x: 0, y: 0 },
    };
    const result = await geminiAI.getSuggestions(flowchartState);
    setSuggestions(result);
    if (result.length > 0) {
      showToast('Sugestões inteligentes atualizadas!', 'success');
    }
  };

  const handleUseTemplate = async (templateId: string) => {
    setIsTemplateLoading(true);
    try {
      const template = await templateService.generateTemplate(templateId);
      applyFlow({ nodes: template.nodes, connections: template.connections });
      showToast('Template aplicado com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao carregar template:', error);
      showToast('Erro ao carregar template inteligente.', 'error');
    } finally {
      setIsTemplateLoading(false);
    }
  };

  const handleGenerateCustomTemplate = async (templateId: string, requirements: string) => {
    setIsTemplateLoading(true);
    try {
      const template = await templateService.generateTemplate(templateId, requirements);
      applyFlow({ nodes: template.nodes, connections: template.connections });
      showToast('Template personalizado aplicado!', 'success');
    } catch (error) {
      console.error('Erro ao gerar template personalizado:', error);
      showToast('Erro ao gerar template personalizado.', 'error');
    } finally {
      setIsTemplateLoading(false);
    }
  };

  const handleSmartExport = async (format: ExportFormat) => {
    if (nodes.length === 0) {
      showToast('Adicione nós antes de exportar.', 'info');
      return;
    }
    setIsExporting(true);
    try {
      const result = await exportService.exportWithDocumentation(
        {
          nodes,
          connections,
          selectedNodeId,
          temporaryConnection,
          zoom: 1,
          pan: { x: 0, y: 0 },
        },
        { format, includeDocumentation: true }
      );
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.filename;
      anchor.click();
      URL.revokeObjectURL(url);
      showToast('Exportação inteligente concluída!', 'success');
    } catch (error) {
      console.error('Erro na exportação inteligente:', error);
      showToast('Erro ao exportar com IA.', 'error');
    } finally {
      setIsExporting(false);
    }
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

  // Oculta a dica após 8 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowShiftHint(false);
    }, 8000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      validateFlowchart();
    }, 800);
    return () => clearTimeout(timer);
  }, [nodes, connections, validateFlowchart]);

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
        onAddNode={(type, position) => addNode(type, position)}
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
        onNodeResize={resizeNode}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        theme={theme}
      />

      <div
        className={`${
          theme === 'dark' ? 'bg-[#0f0f0f] border-[#1f1f1f]' : 'bg-gray-50 border-gray-200'
        } border-t px-4 py-6`}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <AIAnalysisPanel
            nodes={nodes}
            analysis={geminiAI.analysis}
            suggestions={suggestions}
            onAnalyze={handleAnalyzeWithGemini}
            onGetSuggestions={handleGetAISuggestions}
            isProcessing={geminiAI.isProcessing}
            theme={theme}
          />

          <ValidationPanel
            issues={issues}
            onValidate={validateFlowchart}
            isValidating={isValidating}
            theme={theme}
          />

          <TemplateGallery
            categories={templateCategories}
            onUseTemplate={handleUseTemplate}
            onGenerateCustom={handleGenerateCustomTemplate}
            isLoading={isTemplateLoading}
            theme={theme}
          />

          <ExportMenu
            onExport={handleSmartExport}
            isExporting={isExporting}
            theme={theme}
          />
        </div>
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