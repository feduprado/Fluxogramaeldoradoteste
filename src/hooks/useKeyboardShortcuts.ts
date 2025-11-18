import { useEffect, useCallback, useRef } from 'react';

interface KeyboardShortcutsProps {
  onUndo: () => void;
  onRedo: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onAddNode: (type: string) => void;
  onMoveNode: (dx: number, dy: number) => void;
  onSelectNext: () => void;
  onSelectPrevious: () => void;
  onCancelConnection: () => void;
  onExport: () => void;
  onImport: () => void;
  onShowHelp: () => void;
  selectedNodeId: string | null;
  hasTemporaryConnection: boolean;
  canUndo: boolean;
  canRedo: boolean;
}

export const useKeyboardShortcuts = ({
  onUndo,
  onRedo,
  onDelete,
  onDuplicate,
  onZoomIn,
  onZoomOut,
  onResetView,
  onAddNode,
  onMoveNode,
  onSelectNext,
  onSelectPrevious,
  onCancelConnection,
  onExport,
  onImport,
  onShowHelp,
  selectedNodeId,
  hasTemporaryConnection,
  canUndo,
  canRedo,
}: KeyboardShortcutsProps) => {
  // Sistema de aceleração para movimento contínuo
  const pressedKeys = useRef<Set<string>>(new Set());
  const moveInterval = useRef<NodeJS.Timeout | null>(null);
  const moveCounter = useRef(0);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Ignorar atalhos se o usuário estiver editando texto
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      return;
    }

    const ctrlKey = event.ctrlKey || event.metaKey;

    // F1 - Ajuda
    if (event.key === 'F1') {
      event.preventDefault();
      onShowHelp();
      return;
    }

    // Escape - Cancelar conexão temporária
    if (event.key === 'Escape' && hasTemporaryConnection) {
      event.preventDefault();
      onCancelConnection();
      return;
    }

    // Ctrl+Z - Desfazer
    if (ctrlKey && event.key === 'z' && !event.shiftKey) {
      event.preventDefault();
      if (canUndo) onUndo();
      return;
    }

    // Ctrl+Shift+Z ou Ctrl+Y - Refazer
    if ((ctrlKey && event.shiftKey && event.key === 'Z') || (ctrlKey && event.key === 'y')) {
      event.preventDefault();
      if (canRedo) onRedo();
      return;
    }

    // Delete ou Backspace - Excluir nó selecionado
    if ((event.key === 'Delete' || event.key === 'Backspace') && selectedNodeId) {
      event.preventDefault();
      onDelete();
      return;
    }

    // Ctrl+D - Duplicar nó selecionado
    if (ctrlKey && event.key === 'd' && selectedNodeId) {
      event.preventDefault();
      onDuplicate();
      return;
    }

    // Ctrl++ ou Ctrl+= - Zoom In
    if (ctrlKey && (event.key === '+' || event.key === '=')) {
      event.preventDefault();
      onZoomIn();
      return;
    }

    // Ctrl+- - Zoom Out
    if (ctrlKey && event.key === '-') {
      event.preventDefault();
      onZoomOut();
      return;
    }

    // Ctrl+0 - Resetar Zoom
    if (ctrlKey && event.key === '0') {
      event.preventDefault();
      onResetView();
      return;
    }

    // Ctrl+S - Exportar
    if (ctrlKey && event.key === 's') {
      event.preventDefault();
      onExport();
      return;
    }

    // Ctrl+O - Importar
    if (ctrlKey && event.key === 'o') {
      event.preventDefault();
      onImport();
      return;
    }

    // Tab - Selecionar próximo nó
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      onSelectNext();
      return;
    }

    // Shift+Tab - Selecionar nó anterior
    if (event.key === 'Tab' && event.shiftKey) {
      event.preventDefault();
      onSelectPrevious();
      return;
    }

    // Atalhos numéricos para adicionar nós (Ctrl+1 a Ctrl+4)
    if (ctrlKey && !event.shiftKey && !isNaN(Number(event.key))) {
      event.preventDefault();
      const nodeTypes = ['start', 'process', 'decision', 'end'];
      const index = Number(event.key) - 1;
      if (index >= 0 && index < nodeTypes.length) {
        onAddNode(nodeTypes[index]);
      }
      return;
    }

    // Setas para mover nó selecionado (sem Ctrl)
    if (selectedNodeId && !ctrlKey) {
      // Shift = movimento MUITO mais rápido (50px), Ctrl = médio (20px), Normal = rápido (10px)
      const moveAmount = event.shiftKey ? 50 : 10;
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          onMoveNode(0, -moveAmount);
          break;
        case 'ArrowDown':
          event.preventDefault();
          onMoveNode(0, moveAmount);
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onMoveNode(-moveAmount, 0);
          break;
        case 'ArrowRight':
          event.preventDefault();
          onMoveNode(moveAmount, 0);
          break;
      }
    }

    // Ctrl+Setas para zoom alternativo
    if (ctrlKey && !selectedNodeId) {
      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault();
          onZoomIn();
          break;
        case 'ArrowDown':
          event.preventDefault();
          onZoomOut();
          break;
      }
    }
  }, [
    onUndo, onRedo, onDelete, onDuplicate, onZoomIn, onZoomOut, onResetView,
    onAddNode, onMoveNode, onSelectNext, onSelectPrevious, onCancelConnection,
    onExport, onImport, onShowHelp, selectedNodeId, hasTemporaryConnection,
    canUndo, canRedo
  ]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};