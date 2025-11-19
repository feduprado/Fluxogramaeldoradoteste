import React, { useState } from 'react';
import { NodeType } from '../types';
import { Container } from '../types/container';
import { Theme } from '../hooks/useTheme';
import { 
  Circle, 
  Square, 
  Diamond, 
  Trash2, 
  Undo2, 
  Redo2, 
  Eraser, 
  Sparkles, 
  Download, 
  Upload, 
  Copy, 
  ZoomIn, 
  ZoomOut, 
  Maximize2,
  Moon,
  Sun,
  Container as ContainerIcon,
  Layers,
  Box,
  Users
} from 'lucide-react';

interface ToolbarProps {
  onAddNode: (type: string, position: { x: number; y: number }) => void;
  onRemoveNode: () => void;
  selectedNodeId: string | null;
  selectedContainerId: string | null;
  selectedConnectionId?: string | null;
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onAIClick: () => void;
  onClearCanvas: () => void;
  onExportJSON: () => void;
  onExportSVG: () => void;
  onImportJSON: () => void;
  onImportSVG: () => void;
  onCopyToFigma: () => void;
  theme: Theme;
  onToggleTheme: () => void;
  onAddContainer: (type: ContainerType['type']) => void;
  onRemoveContainer: () => void;
  onToggleContainerCollapse: () => void;
  onConnectionStyleClick: () => void;
  onContainerLayersClick?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onRemoveNode,
  selectedNodeId,
  selectedContainerId,
  selectedConnectionId,
  zoom,
  onZoomIn,
  onZoomOut,
  onResetView,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onAIClick,
  onClearCanvas,
  onExportJSON,
  onExportSVG,
  onImportJSON,
  onImportSVG,
  onCopyToFigma,
  theme,
  onToggleTheme,
  onAddContainer,
  onRemoveContainer,
  onToggleContainerCollapse,
  onConnectionStyleClick,
  onContainerLayersClick,
}) => {
  const [showContainerMenu, setShowContainerMenu] = useState(false);
  
  const handleAddNode = (type: NodeType) => {
    // Posição central fixa
    const centerX = 400;
    const centerY = 300;
    onAddNode(type, { x: centerX, y: centerY });
  };

  const handleAddContainer = (type: Container['type'], title: string) => {
    const centerX = window.innerWidth / 2 - 200;
    const centerY = window.innerHeight / 2 - 150;
    onAddContainer(type, { x: centerX, y: centerY }, title);
    setShowContainerMenu(false);
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-[#2C2C2C] border-[#3C3C3C]' : 'bg-white border-gray-200'} border-b shadow-sm`}>
      {/* Primeira linha - Nós, Containers e Ações principais */}
      <div className="px-4 py-2 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {/* Seção de nós */}
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mr-1`}>Nós:</span>
            
            <button
              onClick={() => handleAddNode('start')}
              className="px-3 py-1.5 bg-green-500 text-white rounded-md text-xs font-medium hover:bg-green-600 transition-colors flex items-center gap-1.5"
              title="Adicionar nó de início"
            >
              <Circle className="w-3 h-3" fill="currentColor"/>
              <span className="font-bold">Início</span>
            </button>

            <button
              onClick={() => handleAddNode('process')}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1.5"
              title="Adicionar nó de processo"
            >
              <Square className="w-3 h-3"/>
              <span className="font-bold">Processo</span>
            </button>

            <button
              onClick={() => handleAddNode('decision')}
              className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-xs font-medium hover:bg-yellow-600 transition-colors flex items-center gap-1.5"
              title="Adicionar nó de decisão"
            >
              <Diamond className="w-3 h-3"/>
              <span className="font-bold">Decisão</span>
            </button>

            <button
              onClick={() => handleAddNode('end')}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 transition-colors flex items-center gap-1.5"
              title="Adicionar nó de fim"
            >
              <Circle className="w-3 h-3" fill="currentColor"/>
              <span className="font-bold">Fim</span>
            </button>
          </div>

          {/* Separador */}
          <div className={`h-6 w-px ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>

          {/* Seção de containers */}
          <div className="flex items-center space-x-2">
            <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mr-1`}>Containers:</span>
            
            <div className="relative">
              <button
                onClick={() => setShowContainerMenu(!showContainerMenu)}
                className="px-3 py-1.5 bg-indigo-500 text-white rounded-md text-xs font-medium hover:bg-indigo-600 transition-colors flex items-center gap-1.5"
                title="Adicionar container para agrupar nós"
              >
                <ContainerIcon className="w-3 h-3"/>
                <span>+ Container</span>
              </button>

              {showContainerMenu && (
                <div className={`absolute top-full left-0 mt-1 rounded-lg shadow-lg z-50 min-w-56 border ${
                  theme === 'dark' ? 'bg-[#2C2C2C] border-gray-600' : 'bg-white border-gray-200'
                }`}>
                  <div className="p-2">
                    <div className={`text-xs font-medium px-2 py-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Tipo de Container:</div>
                    
                    <button
                      onClick={() => handleAddContainer('swimlane', 'Swimlane - Usuário')}
                      className={`w-full text-left px-3 py-2 text-xs rounded flex items-center space-x-2 transition-colors ${
                        theme === 'dark' ? 'hover:bg-blue-900/30 text-gray-300' : 'hover:bg-blue-50 text-gray-700'
                      }`}
                    >
                      <Users className="w-4 h-4 text-blue-500"/>
                      <div>
                        <div className="font-medium">Swimlane</div>
                        <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Por ator/departamento</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAddContainer('module', 'Módulo - Login')}
                      className={`w-full text-left px-3 py-2 text-xs rounded flex items-center space-x-2 transition-colors ${
                        theme === 'dark' ? 'hover:bg-green-900/30 text-gray-300' : 'hover:bg-green-50 text-gray-700'
                      }`}
                    >
                      <Box className="w-4 h-4 text-green-500"/>
                      <div>
                        <div className="font-medium">Módulo</div>
                        <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Funcionalidade específica</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAddContainer('layer', 'Camada - Frontend')}
                      className={`w-full text-left px-3 py-2 text-xs rounded flex items-center space-x-2 transition-colors ${
                        theme === 'dark' ? 'hover:bg-orange-900/30 text-gray-300' : 'hover:bg-orange-50 text-gray-700'
                      }`}
                    >
                      <Layers className="w-4 h-4 text-orange-500"/>
                      <div>
                        <div className="font-medium">Camada</div>
                        <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Arquitetura/tecnologia</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleAddContainer('scenario', 'Cenário - Happy Path')}
                      className={`w-full text-left px-3 py-2 text-xs rounded flex items-center space-x-2 transition-colors ${
                        theme === 'dark' ? 'hover:bg-purple-900/30 text-gray-300' : 'hover:bg-purple-50 text-gray-700'
                      }`}
                    >
                      <ContainerIcon className="w-4 h-4 text-purple-500"/>
                      <div>
                        <div className="font-medium">Cenário</div>
                        <div className={theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}>Caso de uso específico</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Ações para container selecionado */}
            {selectedContainerId && (
              <>
                <button
                  onClick={onToggleContainerCollapse}
                  className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-xs font-medium hover:bg-yellow-600 transition-colors flex items-center gap-1.5"
                  title="Colapsar/Expandir Container"
                >
                  ⛶ <span>Colapsar</span>
                </button>

                <button
                  onClick={onRemoveContainer}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 transition-colors flex items-center gap-1.5"
                  title="Remover Container"
                >
                  <Trash2 className="w-3 h-3"/>
                  <span>Remover</span>
                </button>
              </>
            )}
            
            {/* Botão de Camadas - sempre visível quando há containers */}
            {onContainerLayersClick && (
              <button
                onClick={onContainerLayersClick}
                className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-medium hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
                title="Gerenciar camadas de containers (z-index)"
              >
                <Layers className="w-3 h-3"/>
                <span>Camadas</span>
              </button>
            )}
          </div>

          {/* Separador */}
          <div className={`h-6 w-px ${theme === 'dark' ? 'bg-gray-600' : 'bg-gray-300'}`}></div>

          {/* Seção de edição */}
          <div className="flex items-center space-x-2">
            <button
              onClick={onRemoveNode}
              disabled={!selectedNodeId}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                selectedNodeId
                  ? theme === 'dark' 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Excluir nó selecionado (Del)"
            >
              <Trash2 className="w-3 h-3"/>
              <span>Excluir</span>
            </button>

            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                canUndo
                  ? theme === 'dark' 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Desfazer (Ctrl+Z)"
            >
              <Undo2 className="w-3 h-3"/>
              <span>Desfazer</span>
            </button>

            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                canRedo
                  ? theme === 'dark' 
                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                    : 'bg-gray-500 text-white hover:bg-gray-600'
                  : theme === 'dark'
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              title="Refazer (Ctrl+Y)"
            >
              <Redo2 className="w-3 h-3"/>
              <span>Refazer</span>
            </button>

            <button
              onClick={onClearCanvas}
              className="px-3 py-1.5 bg-orange-500 text-white rounded-md text-xs font-medium hover:bg-orange-600 transition-colors flex items-center gap-1.5"
              title="Limpar canvas"
            >
              <Eraser className="w-3 h-3"/>
              <span>Limpar</span>
            </button>

            <button
              onClick={onAIClick}
              className="px-3 py-1.5 bg-purple-500 text-white rounded-md text-xs font-medium hover:bg-purple-600 transition-colors flex items-center gap-1.5"
              title="Interpretar com IA"
            >
              <Sparkles className="w-3 h-3"/>
              <span>IA</span>
            </button>

            {/* Botão de Hooks - só aparece quando há conexão selecionada */}
            {selectedConnectionId && (
              <button
                onClick={onConnectionStyleClick}
                className="px-3 py-1.5 bg-[rgb(105,105,105)] text-white rounded-md text-xs font-medium hover:bg-teal-600 transition-colors flex items-center gap-1.5 animate-pulse"
                title="Estilizar conexão selecionada"
              >
                <span>🎨</span>
                <span>Editar Hook</span>
              </button>
            )}
          </div>
        </div>

        {/* Controles de visualização */}
        <div className="flex items-center space-x-2">
          <div className={`flex items-center space-x-1 rounded-md px-2 py-1 ${
            theme === 'dark' ? 'bg-[#1E1E1E]' : 'bg-gray-100'
          }`}>
            <button
              onClick={onZoomOut}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
              }`}
              title="Diminuir zoom"
            >
              <ZoomOut className="w-3.5 h-3.5"/>
            </button>
            
            <span className={`text-xs font-medium min-w-12 text-center ${
              theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {Math.round(zoom * 100)}%
            </span>
            
            <button
              onClick={onZoomIn}
              className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${
                theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-700'
              }`}
              title="Aumentar zoom"
            >
              <ZoomIn className="w-3.5 h-3.5"/>
            </button>
          </div>

          <button
            onClick={onResetView}
            className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1.5"
            title="Centralizar visualização"
          >
            <Maximize2 className="w-3 h-3"/>
            <span>Centralizar</span>
          </button>

          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-md transition-colors ${
              theme === 'dark' 
                ? 'bg-[#1E1E1E] hover:bg-gray-700 text-yellow-400' 
                : 'bg-gray-100 hover:bg-gray-200 text-indigo-600'
            }`}
            title={`Mudar para ${theme === 'light' ? 'modo escuro' : 'modo claro'}`}
          >
            {theme === 'light' ? <Moon className="w-4 h-4"/> : <Sun className="w-4 h-4"/>}
          </button>
        </div>
      </div>

      {/* Terceira linha - Importar/Exportar */}
      <div className={`px-4 py-2 flex items-center justify-between ${theme === 'dark' ? 'bg-[#252525]' : 'bg-gray-50'}`}>
        <div className="flex items-center space-x-2">
          <span className={`text-xs font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} mr-1`}>Arquivo:</span>
          
          <button
            onClick={onExportJSON}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              theme === 'dark' 
                ? 'bg-gray-600 text-white hover:bg-gray-500' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
            title="Exportar como JSON"
          >
            <Download className="w-3 h-3"/>
            <span>Exportar JSON</span>
          </button>

          <button
            onClick={onExportSVG}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              theme === 'dark' 
                ? 'bg-gray-600 text-white hover:bg-gray-500' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
            title="Exportar como SVG"
          >
            <Download className="w-3 h-3"/>
            <span>Exportar SVG</span>
          </button>

          <button
            onClick={onImportJSON}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
              theme === 'dark' 
                ? 'bg-gray-600 text-white hover:bg-gray-500' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
            title="Importar JSON"
          >
            <Upload className="w-3 h-3"/>
            <span>Importar JSON</span>
          </button>

          <button
            onClick={onCopyToFigma}
            className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md text-xs font-medium hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            title="Copiar SVG para clipboard e colar no Figma (Ctrl+V)"
          >
            <Copy className="w-3.5 h-3.5"/>
            <span>Copiar para Figma</span>
          </button>
        </div>

        <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-500'}`}>
          Fluxogram Builder v1.0
        </div>
      </div>
    </div>
  );
};