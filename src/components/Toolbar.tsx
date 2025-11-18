import React from 'react';
import { NodeType } from '../types';
import { Theme } from '../hooks/useTheme';

type IconProps = React.SVGProps<SVGSVGElement>;

const IconBase: React.FC<IconProps> = ({ children, ...props }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

const Circle: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="9"/>
  </IconBase>
);

const Square: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x="5" y="5" width="14" height="14" rx="2"/>
  </IconBase>
);

const Diamond: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M12 2 20 12 12 22 4 12Z"/>
  </IconBase>
);

const Trash2: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M3 6h18"/>
    <path d="M19 6v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    <path d="M10 11v6"/>
    <path d="M14 11v6"/>
  </IconBase>
);

const Undo2: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M9 14 4 9l5-5"/>
    <path d="M20 20v-7a4 4 0 0 0-4-4H4"/>
  </IconBase>
);

const Redo2: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="m15 9 5 5-5 5"/>
    <path d="M4 4v7a4 4 0 0 0 4 4h12"/>
  </IconBase>
);

const Eraser: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="m16 3 5 5-11 11H5l-2-2Z"/>
    <path d="M6 19h4"/>
  </IconBase>
);

const Sparkles: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="m12 3-1.9 5.63L4.5 10l5.6 1.37L12 17l1.9-5.63L19.5 10l-5.6-1.37Z"/>
    <path d="m5 3 2 4-4 2 4 2-2 4"/>
    <path d="m19 17-2-4 4-2-4-2 2-4"/>
  </IconBase>
);

const Download: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <path d="m7 10 5 5 5-5"/>
    <path d="M12 15V3"/>
  </IconBase>
);

const Upload: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M3 9v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9"/>
    <path d="m17 8-5-5-5 5"/>
    <path d="M12 3v12"/>
  </IconBase>
);

const Copy: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <rect x="8" y="8" width="12" height="12" rx="2"/>
    <rect x="4" y="4" width="12" height="12" rx="2"/>
  </IconBase>
);

const ZoomIn: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <path d="M11 8v6"/>
    <path d="M8 11h6"/>
  </IconBase>
);

const ZoomOut: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
    <path d="M8 11h6"/>
  </IconBase>
);

const Maximize2: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M15 3h6v6"/>
    <path d="M9 21H3v-6"/>
    <path d="M21 3 14 10"/>
    <path d="M3 21 10 14"/>
  </IconBase>
);

const Moon: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z"/>
  </IconBase>
);

const Sun: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2v2"/>
    <path d="M12 20v2"/>
    <path d="M4.93 4.93 6.34 6.34"/>
    <path d="M17.66 17.66 19.07 19.07"/>
    <path d="M2 12h2"/>
    <path d="M20 12h2"/>
    <path d="M4.93 19.07 6.34 17.66"/>
    <path d="M17.66 6.34 19.07 4.93"/>
  </IconBase>
);

const BarChart: React.FC<IconProps> = (props) => (
  <IconBase {...props}>
    <path d="M3 3v18h18"/>
    <rect x="7" y="10" width="3" height="8" rx="1"/>
    <rect x="12" y="6" width="3" height="12" rx="1"/>
    <rect x="17" y="12" width="3" height="6" rx="1"/>
  </IconBase>
);

interface ToolbarProps {
  onAddNode: (type: NodeType) => void;
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
  isAnalysisEnabled: boolean;
  isAnalysisOpen: boolean;
  onToggleAnalysis: () => void;
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
  isAnalysisEnabled,
  isAnalysisOpen,
  onToggleAnalysis,
}) => {
  const handleAddNode = (type: NodeType) => {
    onAddNode(type);
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

          {isAnalysisEnabled && (
            <button
              onClick={onToggleAnalysis}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isAnalysisOpen
                  ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                  : theme === 'dark'
                    ? 'bg-[#1E1E1E] text-indigo-200 hover:bg-[#2D2D2D]'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
              }`}
              title={isAnalysisOpen ? 'Ocultar painel de análise' : 'Abrir painel de análise'}
            >
              <BarChart className="w-3.5 h-3.5"/>
              <span>{isAnalysisOpen ? 'Análise ativa' : 'Análise'}</span>
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