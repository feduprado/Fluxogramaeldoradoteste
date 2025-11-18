import React, { useState, useEffect } from "react";
import { AIParsedFlow } from "../types";
import { FlowInterpreter } from "../services/flowInterpreter";
import { Theme } from "../hooks/useTheme";
import { FlowGuideModal } from "./FlowGuideModal";

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFlow: (flow: AIParsedFlow) => void;
  theme: Theme;
}

export const AIModal: React.FC<AIModalProps> = ({
  isOpen,
  onClose,
  onApplyFlow,
  theme,
}) => {
  const [text, setText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewFlow, setPreviewFlow] =
    useState<AIParsedFlow | null>(null);
  const [activeTab, setActiveTab] = useState<
    "text" | "example"
  >("text");
  const [showGuide, setShowGuide] = useState(false);

  const interpreter = FlowInterpreter.getInstance();

  const exampleFlow = `🚀 **[Início]** App LATAM aberto na Home

📱 **[Processo]** Usuário acessa aba "Comprar"

✈️ **[Processo]** Tela de busca exibida

📝 **[Processo]** Usuário preenche origem e destino

📅 **[Processo]** Usuário seleciona datas

❓ **[Decisão]** "Formulário válido?"
Sim → Busca voos disponíveis
Não → Mostra erros nos campos

🔍 **[Processo]** Sistema busca voos

❓ **[Decisão]** "Encontrou voos?"
Não → Exibe "Nenhum voo encontrado"
Sim → Exibe lista de voos

🛫 **[Processo]** Usuário seleciona voo de ida

❓ **[Decisão]** "É ida e volta?"
Sim → Mostra voos de volta
Não → Avança para pagamento

🛬 **[Processo]** Usuário seleciona voo de volta

💳 **[Processo]** Tela de checkout exibida

❓ **[Decisão]** "Usuário está logado?"
Sim → Continua para pagamento
Não → Exibe tela de login

👤 **[Processo]** Usuário faz login

💰 **[Processo]** Preenche dados de pagamento

🔄 **[Processo]** Sistema processa pagamento

❓ **[Decisão]** "Pagamento aprovado?"
Não → Mostra erro e oferece tentar novamente
Sim → Confirma reserva

📧 **[Processo]** Email de confirmação enviado

✅ **[Fim]** Compra finalizada com sucesso`;

  // Processa automaticamente o exemplo quando a aba "example" é ativada
  useEffect(() => {
    if (activeTab === "example") {
      try {
        const flow =
          interpreter.parseStructuredFlow(exampleFlow);
        setPreviewFlow(flow);
      } catch (error) {
        console.error("Erro ao processar exemplo:", error);
      }
    }
  }, [activeTab]);

  const handleTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const newText = e.target.value;
    setText(newText);

    // Preview em tempo real para textos curtos
    if (newText.length > 0 && newText.length < 1000) {
      try {
        const flow = interpreter.parseStructuredFlow(newText);
        setPreviewFlow(flow);
      } catch (error) {
        console.error("Erro no preview:", error);
      }
    } else if (newText.length === 0) {
      setPreviewFlow(null);
    }
  };

  const handleUseExample = () => {
    setText(exampleFlow);
    setActiveTab("text");

    // Processa o exemplo automaticamente
    setTimeout(() => {
      handleInterpret();
    }, 100);
  };

  const handleInterpret = async () => {
    if (!text.trim()) return;

    setIsProcessing(true);
    try {
      const flow = await interpreter.interpretWithAI(text);
      setPreviewFlow(flow);
    } catch (error) {
      console.error("Erro na interpretação:", error);
      const flow = interpreter.parseStructuredFlow(text);
      setPreviewFlow(flow);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (previewFlow) {
      onApplyFlow(previewFlow);
      onClose();
      setText("");
      setPreviewFlow(null);
      setActiveTab("text");
    }
  };

  const handleClose = () => {
    onClose();
    setText("");
    setPreviewFlow(null);
    setActiveTab("text");
  };

  if (!isOpen) return null;

  const isDark = theme === "dark";

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className={`rounded-xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl ${
          isDark ? "bg-[#1E1E1E]" : "bg-white"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className={`flex justify-between items-center p-6 border-b ${
            isDark
              ? "bg-gradient-to-r from-purple-600 to-blue-600 border-gray-700"
              : "bg-gradient-to-r from-purple-500 to-blue-500 border-gray-200"
          }`}
        >
          <div>
            <h2 className="text-white text-2xl flex items-center space-x-2">
              <span>🤖</span>
              <span>Interpretação por IA</span>
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              Descreva o fluxo do seu aplicativo ou use o
              exemplo da LATAM
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-white hover:bg-white/20 rounded-full w-10 h-10 flex items-center justify-center transition-colors text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Input Panel */}
          <div
            className={`flex-1 p-6 border-r flex flex-col ${
              isDark ? "border-gray-700" : "border-gray-200"
            }`}
          >
            {/* Tabs */}
            <div
              className={`flex border-b mb-4 ${isDark ? "border-gray-700" : "border-gray-200"}`}
            >
              <button
                onClick={() => setActiveTab("text")}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === "text"
                    ? `border-b-2 border-blue-500 ${isDark ? "text-blue-400" : "text-blue-600"}`
                    : `${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`
                }`}
              >
                ✍️ Escrever Fluxo
              </button>
              <button
                onClick={() => setActiveTab("example")}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === "example"
                    ? `border-b-2 border-blue-500 ${isDark ? "text-blue-400" : "text-blue-600"}`
                    : `${isDark ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"}`
                }`}
              >
                📋 Exemplo LATAM
              </button>
            </div>

            {activeTab === "example" ? (
              /* Example Tab */
              <div className="flex-1 flex flex-col">
                <div
                  className={`rounded-lg p-4 mb-4 ${
                    isDark
                      ? "bg-blue-900/30 border border-blue-700"
                      : "bg-blue-50 border border-blue-200"
                  }`}
                >
                  <h3
                    className={`font-semibold mb-2 ${isDark ? "text-blue-300" : "text-blue-800"}`}
                  >
                    📋 Exemplo: Fluxo de Compra LATAM
                  </h3>
                  <p
                    className={`text-sm ${isDark ? "text-blue-200" : "text-blue-700"}`}
                  >
                    Este é um exemplo de fluxo estruturado de um
                    app real. Clique no botão abaixo para usar
                    como base.
                  </p>
                </div>
                <div
                  className={`flex-1 rounded-lg p-4 overflow-y-auto max-h-96 ${
                    isDark
                      ? "bg-gray-900 border border-gray-700"
                      : "bg-gray-50 border border-gray-200"
                  }`}
                >
                  <pre
                    className={`text-sm whitespace-pre-wrap font-mono ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {exampleFlow}
                  </pre>
                </div>
                <button
                  onClick={handleUseExample}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  ✨ Usar Este Exemplo
                </button>
              </div>
            ) : (
              /* Text Tab */
              <>
                <label
                  className={`block text-sm font-medium mb-3 ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Descreva o fluxo do seu aplicativo:
                </label>
                <textarea
                  value={text}
                  onChange={handleTextChange}
                  placeholder={`Exemplo:\n[Início] App aberto\n[Processo] Usuário faz login\n[Decisão] "Login válido?"\nSim → Avança para dashboard\nNão → Mostra erro\n[Fim]`}
                  className={`flex-1 w-full p-4 border rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono text-sm ${
                    isDark
                      ? "bg-gray-900 border-gray-700 text-gray-200 placeholder-gray-500"
                      : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                  }`}
                  rows={15}
                />

                <div className="mt-4 flex justify-between items-center">
                  <div
                    className={`text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {text.length} caracteres •{" "}
                    {
                      text.split("\n").filter((l) => l.trim())
                        .length
                    }{" "}
                    linhas
                    {text.length > 0 && previewFlow && (
                      <span className="ml-2">
                        • {previewFlow.nodes.length} nós
                        detectados
                      </span>
                    )}
                  </div>
                  <button
                    onClick={handleInterpret}
                    disabled={!text.trim() || isProcessing}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      !text.trim() || isProcessing
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-purple-500 text-white hover:bg-purple-600"
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Interpretar com IA</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Preview Panel */}
          <div
            className={`flex-1 p-6 flex flex-col ${
              isDark ? "bg-[#252525]" : "bg-gray-50"
            }`}
          >
            <h3
              className={`text-lg font-semibold mb-4 flex items-center justify-between ${
                isDark ? "text-gray-200" : "text-gray-800"
              }`}
            >
              <span>Prévia do Fluxograma</span>
              {previewFlow && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                  {previewFlow.nodes.length} nós
                </span>
              )}
            </h3>

            {previewFlow ? (
              <div
                className={`flex-1 border rounded-lg p-4 overflow-auto ${
                  isDark
                    ? "bg-gray-900 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="space-y-3">
                  {previewFlow.nodes.map((node, index) => (
                    <div
                      key={node.id}
                      className="flex items-start space-x-3"
                    >
                      <div
                        className={`w-4 h-4 rounded-full mt-1 flex-shrink-0 ${
                          node.type === "start"
                            ? "bg-green-500"
                            : node.type === "end"
                              ? "bg-red-500"
                              : node.type === "decision"
                                ? "bg-yellow-500"
                                : "bg-blue-500"
                        }`}
                      />
                      <div
                        className={`flex-1 p-3 rounded border shadow-sm ${
                          isDark
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div
                            className={`text-sm font-medium ${isDark ? "text-gray-200" : "text-gray-800"}`}
                          >
                            {node.text}
                          </div>
                          <span
                            className={`text-xs capitalize px-2 py-1 rounded ml-2 ${
                              isDark
                                ? "bg-gray-700 text-gray-300"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {node.type === "start"
                              ? "Início"
                              : node.type === "end"
                                ? "Fim"
                                : node.type === "decision"
                                  ? "Decisão"
                                  : "Processo"}
                          </span>
                        </div>
                        <div
                          className={`text-xs mt-1 ${isDark ? "text-gray-500" : "text-gray-500"}`}
                        >
                          Pos: {Math.round(node.position.x)}×
                          {Math.round(node.position.y)} •
                          Tamanho: {node.width}×{node.height}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className={`mt-4 p-3 rounded border ${
                    isDark
                      ? "bg-gray-800 border-gray-700"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div
                    className={`text-sm font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}
                  >
                    Estatísticas do Fluxo:
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-2 text-xs">
                    <div className="text-center">
                      <div
                        className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                      >
                        {
                          previewFlow.nodes.filter(
                            (n) => n.type === "start",
                          ).length
                        }
                      </div>
                      <div
                        className={
                          isDark
                            ? "text-gray-500"
                            : "text-gray-500"
                        }
                      >
                        Início
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                      >
                        {
                          previewFlow.nodes.filter(
                            (n) => n.type === "process",
                          ).length
                        }
                      </div>
                      <div
                        className={
                          isDark
                            ? "text-gray-500"
                            : "text-gray-500"
                        }
                      >
                        Processos
                      </div>
                    </div>
                    <div className="text-center">
                      <div
                        className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-800"}`}
                      >
                        {
                          previewFlow.nodes.filter(
                            (n) => n.type === "decision",
                          ).length
                        }
                      </div>
                      <div
                        className={
                          isDark
                            ? "text-gray-500"
                            : "text-gray-500"
                        }
                      >
                        Decisões
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className={`flex-1 border-2 border-dashed rounded-lg p-8 flex items-center justify-center ${
                  isDark
                    ? "border-gray-700 text-gray-500"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                <div className="text-center">
                  <div className="text-6xl mb-4">🤖</div>
                  <p className="text-sm">
                    O fluxograma aparecerá aqui
                  </p>
                  <p className="text-xs mt-2">
                    Descreva seu processo no campo ao lado
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isDark
                    ? "text-gray-300 hover:text-white hover:bg-gray-700"
                    : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                Cancelar
              </button>
              <button
                onClick={handleApply}
                disabled={!previewFlow}
                className={`px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                  !previewFlow
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                <span>✓</span>
                <span>Aplicar ao Canvas</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Tips */}
        <div
          className={`p-4 border-t ${
            isDark
              ? "bg-purple-900/30 border-purple-700 text-purple-200"
              : "bg-purple-50 border-purple-200 text-purple-900"
          }`}
        >
          <div className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                isDark ? "bg-purple-800" : "bg-purple-100"
              }`}
            >
              <span className="text-sm">💡</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                Dicas para um fluxo perfeito:
              </p>
              <ul className="text-sm mt-1 space-y-1 opacity-90">
                <li>
                  • Use{" "}
                  <code
                    className={`px-1 rounded ${isDark ? "bg-gray-800" : "bg-white"}`}
                  >
                    [Início]
                  </code>
                  ,{" "}
                  <code
                    className={`px-1 rounded ${isDark ? "bg-gray-800" : "bg-white"}`}
                  >
                    [Processo]
                  </code>
                  ,{" "}
                  <code
                    className={`px-1 rounded ${isDark ? "bg-gray-800" : "bg-white"}`}
                  >
                    [Decisão]
                  </code>
                  ,{" "}
                  <code
                    className={`px-1 rounded ${isDark ? "bg-gray-800" : "bg-white"}`}
                  >
                    [Fim]
                  </code>{" "}
                  para definir tipos de nó
                </li>
                <li>
                  • Para decisões, escreva "Sim →" e "Não →" nas
                  linhas seguintes
                </li>
                <li>
                  • Use indentação (espaços) para organizar
                  ramos do fluxo
                </li>
              </ul>
            </div>
            <button
              onClick={() => setShowGuide(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                isDark
                  ? "bg-purple-700 hover:bg-purple-600 text-white"
                  : "bg-purple-500 hover:bg-purple-600 text-white"
              }`}
            >
              <span>📚</span>
              <span>Ver Guia Completo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Guide Modal */}
      <FlowGuideModal
        isOpen={showGuide}
        onClose={() => setShowGuide(false)}
        theme={theme}
        onUseExample={(exampleText) => {
          setText(exampleText);
          setActiveTab("text");
          setTimeout(() => handleInterpret(), 100);
        }}
      />
    </div>
  );
};