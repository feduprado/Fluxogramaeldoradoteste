import React from 'react';
import { NodeType } from '../types';
import { Theme } from '../hooks/useTheme';
import {
  CircleIcon as Circle,
  CopyIcon as Copy,
  DiamondIcon as Diamond,
  DownloadIcon as Download,
  EraserIcon as Eraser,
  Maximize2Icon as Maximize2,
  MoonIcon as Moon,
  Redo2Icon as Redo2,
  SparklesIcon as Sparkles,
  SquareIcon as Square,
  SunIcon as Sun,
  Trash2Icon as Trash2,
  Undo2Icon as Undo2,
  UploadIcon as Upload,
  ZoomInIcon as ZoomIn,
  ZoomOutIcon as ZoomOut
} from './icons/ToolbarIcons';

interface ToolbarProps {
  onAddNode: (type: NodeType, position: { x: number; y: number }) => void;
  onRemoveNode: () => void;
  selectedNodeId: string | null;
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
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onAddNode,
  onRemoveNode,
  selectedNodeId,
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
}) => {
  const handleAddNode = (type: NodeType) => {
    // Posição central fixa
    const centerX = 400;
    const centerY = 300;
    onAddNode(type, { x: centerX, y: centerY });
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-[#2C2C2C] border-[#3C3C3C]' : 'bg-white border-gray-200'} border-b shadow-sm`}>
      {/* Primeira linha - Nós e Ações principais */}
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
              <span>Início</span>
            </button>

            <button
              onClick={() => handleAddNode('process')}
              className="px-3 py-1.5 bg-blue-500 text-white rounded-md text-xs font-medium hover:bg-blue-600 transition-colors flex items-center gap-1.5"
              title="Adicionar nó de processo"
            >
              <Square className="w-3 h-3"/>
              <span>Processo</span>
            </button>

            <button
              onClick={() => handleAddNode('decision')}
              className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-xs font-medium hover:bg-yellow-600 transition-colors flex items-center gap-1.5"
              title="Adicionar nó de decisão"
            >
              <Diamond className="w-3 h-3"/>
              <span>Decisão</span>
            </button>

            <button
              onClick={() => handleAddNode('end')}
              className="px-3 py-1.5 bg-red-500 text-white rounded-md text-xs font-medium hover:bg-red-600 transition-colors flex items-center gap-1.5"
              title="Adicionar nó de fim"
            >
              <Circle className="w-3 h-3" fill="currentColor"/>
              <span>Fim</span>
            </button>
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

      {/* Segunda linha - Importar/Exportar */}
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