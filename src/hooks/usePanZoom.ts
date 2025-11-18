import { useState, useRef, useCallback } from 'react';
import { FlowNode } from '../types';

export const usePanZoom = () => {
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const isPanning = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // Botão esquerdo (0) ou botão do meio/scroll (1) permitem arrastar o canvas
    if (e.button === 0 || e.button === 1) {
      e.preventDefault(); // Previne comportamento padrão do botão do meio
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
    e.preventDefault();
    
    if (e.ctrlKey) {
      const zoomSpeed = 0.001;
      const delta = -e.deltaY * zoomSpeed;
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

    // Calcula os limites do fluxograma
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

    // Calcula o centro do fluxograma
    const flowCenterX = (minX + maxX) / 2;
    const flowCenterY = (minY + maxY) / 2;

    // Calcula o centro da viewport (assumindo largura e altura da janela)
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;

    // Calcula o pan necessário para centralizar
    const newPanX = viewportCenterX - flowCenterX;
    const newPanY = viewportCenterY - flowCenterY;

    setPan({ x: newPanX, y: newPanY });
    setZoom(1); // Reset zoom para 100%

    console.log('🎯 Fluxo centralizado:', { 
      flowCenter: { x: flowCenterX, y: flowCenterY },
      viewportCenter: { x: viewportCenterX, y: viewportCenterY },
      pan: { x: newPanX, y: newPanY }
    });
  }, []);

  return {
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
  };
};