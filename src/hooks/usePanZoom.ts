import { useState, useRef, useCallback } from 'react';
import { FlowNode } from '../types';

export const usePanZoom = () => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Só inicia pan se for clique com botão esquerdo e não em um elemento interativo
    if (e.button === 0 && !(e.target as HTMLElement).closest('.flowchart-node, button, input, textarea')) {
      isPanning.current = true;
      lastMousePos.current = { x: e.clientX, y: e.clientY };
      document.body.style.cursor = 'grabbing';
    }
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isPanning.current) return;

    const deltaX = e.clientX - lastMousePos.current.x;
    const deltaY = e.clientY - lastMousePos.current.y;

    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    lastMousePos.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    document.body.style.cursor = '';
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const zoomSpeed = 0.1;
      const delta = -e.deltaY * zoomSpeed * 0.01;
      const newZoom = Math.max(0.3, Math.min(3, zoom + delta));
      
      setZoom(newZoom);
    }
  }, [zoom]);

  const resetView = useCallback(() => {
    setPan({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(3, prev + 0.1));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(0.3, prev - 0.1));
  }, []);

  const centerFlow = useCallback((nodes: FlowNode[]) => {
    if (nodes.length === 0) return;

    // Calcula os limites do fluxo (bounding box)
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    nodes.forEach(node => {
      minX = Math.min(minX, node.position.x);
      minY = Math.min(minY, node.position.y);
      maxX = Math.max(maxX, node.position.x + node.width);
      maxY = Math.max(maxY, node.position.y + node.height);
    });

    // Calcula o centro do fluxo
    const flowCenterX = (minX + maxX) / 2;
    const flowCenterY = (minY + maxY) / 2;

    // Calcula o centro da viewport (assumindo viewport padrão)
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const viewportCenterX = viewportWidth / 2;
    const viewportCenterY = viewportHeight / 2;

    // Calcula o pan necessário para centralizar
    const newPanX = viewportCenterX - flowCenterX;
    const newPanY = viewportCenterY - flowCenterY;

    setPan({ x: newPanX, y: newPanY });
    setZoom(1); // Reseta o zoom também
  }, []);

  return {
    pan,
    zoom,
    setPan,
    setZoom,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    resetView,
    zoomIn,
    zoomOut,
    centerFlow, // 🆕 Centraliza o fluxo
  };
};