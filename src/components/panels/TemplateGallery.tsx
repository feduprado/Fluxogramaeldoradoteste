import React, { useState } from 'react';
import { TemplateCategory } from '../../types';
import { Theme } from '../../hooks/useTheme';

interface TemplateGalleryProps {
  categories: TemplateCategory[];
  onUseTemplate: (templateId: string) => Promise<void>;
  onGenerateCustom: (templateId: string, requirements: string) => Promise<void>;
  isLoading: boolean;
  theme: Theme;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({
  categories,
  onUseTemplate,
  onGenerateCustom,
  isLoading,
  theme,
}) => {
  const [customRequirements, setCustomRequirements] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleCustomGeneration = async () => {
    if (!selectedTemplate) return;
    await onGenerateCustom(selectedTemplate, customRequirements);
  };

  return (
    <div className={`rounded-xl shadow-lg p-4 border ${theme === 'dark' ? 'border-gray-700 bg-[#1E1E1E]' : 'border-gray-200 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">📁 Templates Inteligentes</h3>
        {isLoading && <span className="text-xs text-purple-400 animate-pulse">Gerando...</span>}
      </div>

      <div className="space-y-4">
        {categories.map(category => (
          <div key={category.id}>
            <h4 className="text-sm font-semibold mb-2 text-purple-400">{category.name}</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {category.templates.map(template => (
                <div
                  key={template.id}
                  className={`rounded-lg p-3 border ${
                    theme === 'dark' ? 'border-gray-700 bg-black/20' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h5 className="font-semibold text-sm">{template.name}</h5>
                    <span className="text-xs bg-gray-800 text-white px-2 py-0.5 rounded-full">
                      {template.complexity}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{template.description}</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUseTemplate(template.id)}
                      className="flex-1 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg py-1.5"
                      disabled={isLoading}
                    >
                      Usar template
                    </button>
                    <input
                      type="radio"
                      name="custom-template"
                      value={template.id}
                      onChange={() => setSelectedTemplate(template.id)}
                      checked={selectedTemplate === template.id}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <p className="text-sm font-semibold mb-2">Personalizar com IA</p>
        <textarea
          placeholder="Ex: incluir passo de validação de e-mail e fluxo de erro"
          className={`w-full rounded-lg border px-3 py-2 text-sm ${
            theme === 'dark' ? 'bg-black/30 border-gray-700 text-gray-100' : 'bg-white border-gray-200'
          }`}
          rows={3}
          value={customRequirements}
          onChange={(event) => setCustomRequirements(event.target.value)}
        />
        <button
          onClick={handleCustomGeneration}
          disabled={!selectedTemplate || isLoading}
          className={`mt-2 w-full py-2 rounded-lg text-sm font-medium ${
            !selectedTemplate || isLoading
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-500 text-white'
          }`}
        >
          Gerar variação personalizada
        </button>
      </div>
    </div>
  );
};
