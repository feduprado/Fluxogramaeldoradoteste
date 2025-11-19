import React from 'react';
import { Container } from '../types/container';
import { CONTAINER_BORDER_COLORS } from '../types/container';
import { ArrowUpToLine, ArrowDownToLine, ArrowUp, ArrowDown, Lock, Unlock, Trash2, X } from 'lucide-react';

interface ContainerToolbarProps {
  containers: Container[];
  selectedContainerId: string | null;
  onRemoveContainer: (containerId: string) => void;
  onBringToFront: (containerId: string) => void;
  onSendToBack: (containerId: string) => void;
  onMoveUp: (containerId: string) => void;
  onMoveDown: (containerId: string) => void;
  onToggleLock: (containerId: string) => void;
  onClose: () => void;
}

export const ContainerToolbar: React.FC<ContainerToolbarProps> = ({
  containers,
  selectedContainerId,
  onRemoveContainer,
  onBringToFront,
  onSendToBack,
  onMoveUp,
  onMoveDown,
  onToggleLock,
  onClose,
}) => {
  const selectedContainer = containers.find(c => c.id === selectedContainerId);
  
  // Ordena containers por zIndex (maior primeiro)
  const sortedContainers = [...containers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="bg-white border-2 border-gray-300 rounded-xl p-4 shadow-2xl w-80">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-lg">🗂️</span>
          <span>Camadas de Containers</span>
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Lista de Containers */}
      <div className="space-y-2 max-h-80 overflow-y-auto mb-4">
        {sortedContainers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            <div className="text-4xl mb-2">📦</div>
            <p>Nenhum container criado</p>
            <p className="text-xs mt-1">Use a toolbar para criar</p>
          </div>
        ) : (
          sortedContainers.map((container, index) => {
            const isSelected = container.id === selectedContainerId;
            const borderColor = CONTAINER_BORDER_COLORS[container.type];
            
            return (
              <div
                key={container.id}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-blue-300 shadow-md'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Indicador de camada */}
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 font-medium">#{index + 1}</span>
                    <span className="text-[10px] text-gray-400">z:{container.zIndex}</span>
                  </div>
                  
                  {/* Cor do container */}
                  <div
                    className="w-4 h-4 rounded border-2"
                    style={{ 
                      backgroundColor: container.color,
                      borderColor: borderColor
                    }}
                  />
                  
                  {/* Info do container */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-800 truncate">
                      {container.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {container.nodes.length} nós • {container.type}
                    </div>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-1 ml-2">
                  <button
                    onClick={() => onToggleLock(container.id)}
                    className={`p-1.5 rounded transition-colors ${
                      container.isLocked
                        ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={container.isLocked ? 'Desbloquear' : 'Bloquear'}
                  >
                    {container.isLocked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>
                  
                  {isSelected && (
                    <button
                      onClick={() => onRemoveContainer(container.id)}
                      className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Controles de Camada */}
      {selectedContainer && (
        <div className="pt-4 border-t-2 border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">
              Controles de Camada
            </h4>
            <span 
              className="text-xs px-2 py-1 rounded"
              style={{
                backgroundColor: `${CONTAINER_BORDER_COLORS[selectedContainer.type]}20`,
                color: CONTAINER_BORDER_COLORS[selectedContainer.type],
              }}
            >
              {selectedContainer.name}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onBringToFront(selectedContainer.id)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              title="Trazer para frente (maior z-index)"
            >
              <ArrowUpToLine className="w-4 h-4" />
              <span>Frente</span>
            </button>
            
            <button
              onClick={() => onSendToBack(selectedContainer.id)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              title="Enviar para trás (menor z-index)"
            >
              <ArrowDownToLine className="w-4 h-4" />
              <span>Fundo</span>
            </button>
            
            <button
              onClick={() => onMoveUp(selectedContainer.id)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              title="Subir uma camada"
            >
              <ArrowUp className="w-4 h-4" />
              <span>Subir</span>
            </button>
            
            <button
              onClick={() => onMoveDown(selectedContainer.id)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
              title="Descer uma camada"
            >
              <ArrowDown className="w-4 h-4" />
              <span>Descer</span>
            </button>
          </div>

          {/* Dicas */}
          <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong className="font-semibold">💡 Dica:</strong> Use os controles acima para organizar a sobreposição dos containers. 
              {selectedContainer.isLocked && (
                <span className="block mt-1 text-yellow-700 bg-yellow-100 px-2 py-1 rounded mt-2">
                  🔒 Container bloqueado - os nós dentro não podem ser movidos
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
