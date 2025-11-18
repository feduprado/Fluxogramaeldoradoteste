import { useState, useRef, useCallback } from 'react';

export const useDrag = () => {
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });

  const startDrag = useCallback((clientX: number, clientY: number, currentPosition: { x: number; y: number }) => {
    setIsDragging(true);
    dragStartPos.current = { x: clientX, y: clientY };
    initialPos.current = currentPosition;
  }, []);

  const updateDrag = useCallback((clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!isDragging) return null;

    const deltaX = clientX - dragStartPos.current.x;
    const deltaY = clientY - dragStartPos.current.y;

    return {
      x: initialPos.current.x + deltaX,
      y: initialPos.current.y + deltaY,
    };
  }, [isDragging]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    startDrag,
    updateDrag,
    endDrag,
  };
};
