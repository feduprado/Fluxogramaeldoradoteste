import React from 'react';
import { ConnectionStyle } from '../types';
import { Theme } from '../hooks/useTheme';

interface ConnectionToolbarProps {
  style: ConnectionStyle;
  onStyleChange: (style: ConnectionStyle) => void;
  onApplyToAll: () => void;
  onResetAll: () => void;
  onClose: () => void;
  selectedConnectionId: string | null;
  theme: Theme;
}

export const ConnectionToolbar: React.FC<ConnectionToolbarProps> = ({
  style,
  onStyleChange,
  onApplyToAll,
  onResetAll,
  onClose,
  selectedConnectionId,
  theme,
}) => {
  const connectionTypes: Array<{ value: ConnectionStyle['type']; label: string; icon: string }> = [
    { value: 'straight', label: 'Reta', icon: '📏' },
    { value: 'curved', label: 'Curvada', icon: '↷' },
    { value: 'elbow', label: 'Cotovelo', icon: '📐' },
  ];

  const colors = [
    { value: '#3B82F6', label: 'Azul' },
    { value: '#10B981', label: 'Verde' },
    { value: '#EF4444', label: 'Vermelho' },
    { value: '#F59E0B', label: 'Amarelo' },
    { value: '#8B5CF6', label: 'Roxo' },
    { value: '#6B7280', label: 'Cinza' },
  ];

  const handleTypeChange = (type: ConnectionStyle['type']) => {
    onStyleChange({ ...style, type });
  };

  const handleColorChange = (color: string) => {
    onStyleChange({ ...style, color });
  };

  const handleStrokeWidthChange = (strokeWidth: number) => {
    onStyleChange({ ...style, strokeWidth });
  };

  const handleCurvatureChange = (curvature: number) => {
    onStyleChange({ ...style, curvature: curvature / 100 });
  };

  const toggleDashed = () => {
    onStyleChange({ ...style, dashed: !style.dashed });
  };

  return (
    <div className={`${
      theme === 'dark' ? 'bg-[#2C2C2C] border-[#3C3C3C] text-gray-200' : 'bg-white border-gray-200 text-gray-800'
    } border rounded-lg p-4 shadow-lg w-80`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center space-x-2">
          <span>🎨</span>
          <span>Estilo das Conexões</span>
        </h3>
        <button
          onClick={onClose}
          className={`w-6 h-6 rounded-full flex items-center justify-center text-sm transition-colors ${
            theme === 'dark' 
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' 
              : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
          }`}
        >
          ✕
        </button>
      </div>

      {selectedConnectionId && (
        <div className={`text-xs px-2 py-1 rounded mb-3 ${
          theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
        }`}>
          Editando: {selectedConnectionId.substring(0, 12)}...
        </div>
      )}

      {/* Tipo de Conexão */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Tipo de Hook:
        </label>
        <div className="flex space-x-2">
          {connectionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => handleTypeChange(type.value)}
              className={`flex-1 flex items-center justify-center space-x-1 px-2 py-2 rounded-lg border transition-colors ${
                style.type === type.value
                  ? 'bg-blue-500 text-white border-blue-500'
                  : theme === 'dark'
                  ? 'bg-[#1E1E1E] text-gray-300 border-gray-600 hover:bg-gray-700'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span>{type.icon}</span>
              <span className="text-xs">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cor da Conexão */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Cor:
        </label>
        <div className="flex space-x-2 flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorChange(color.value)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                style.color === color.value
                  ? theme === 'dark' ? 'border-white scale-110' : 'border-gray-800 scale-110'
                  : 'border-gray-300 hover:scale-105'
              }`}
              style={{ backgroundColor: color.value }}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Espessura da Linha */}
      <div className="mb-4">
        <label className={`block text-sm font-medium mb-2 ${
          theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
        }`}>
          Espessura: {style.strokeWidth}px
        </label>
        <input
          type="range"
          min="1"
          max="8"
          value={style.strokeWidth}
          onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
            theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
          }`}
        />
      </div>

      {/* Intensidade da Curva (apenas para tipo curved) */}
      {style.type === 'curved' && (
        <div className="mb-4">
          <label className={`block text-sm font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Intensidade da Curva: {Math.round((style.curvature || 0.5) * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={(style.curvature || 0.5) * 100}
            onChange={(e) => handleCurvatureChange(Number(e.target.value))}
            className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
              theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
            }`}
          />
        </div>
      )}

      {/* Estilo Tracejado */}
      <div className="mb-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={style.dashed}
            onChange={toggleDashed}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Linha tracejada
          </span>
        </label>
      </div>

      {/* Ações */}
      <div className={`flex space-x-2 pt-3 border-t ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      }`}>
        <button
          onClick={onApplyToAll}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          Aplicar a Todas
        </button>
        <button
          onClick={onResetAll}
          className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
            theme === 'dark'
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
        >
          Redefinir
        </button>
      </div>

      {/* Dicas de Uso */}
      <div className={`mt-4 p-3 rounded-lg ${
        theme === 'dark' ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
      }`}>
        <p className="text-xs">
          💡 <strong>Dica:</strong> Clique em uma conexão para selecionar, depois arraste os pontos para redimensionar.
        </p>
      </div>
    </div>
  );
};
