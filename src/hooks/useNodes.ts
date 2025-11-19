import { useState, useCallback } from 'react';
import { FlowNode, NodeType } from '../types';
import { NodeFactory } from '../utils/nodeFactory';

export const useNodes = (initialNodes: FlowNode[] = []) => {
  const [nodes, setNodes] = useState<FlowNode[]>(initialNodes);

  const addNode = useCallback((type: NodeType, position: { x: number; y: number }, text?: string) => {
    const newNode = NodeFactory.createNode(type, position, text);
    setNodes(prev => [...prev, newNode]);
    return newNode;
  }, []);

  const removeNode = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(n => n.id !== nodeId));
  }, []);

  const removeNodes = useCallback((nodeIds: string[]) => {
    setNodes(prev => prev.filter(n => !nodeIds.includes(n.id)));
  }, []);

  const updateNode = useCallback((nodeId: string, updates: Partial<FlowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const updateNodePosition = useCallback((nodeId: string, position: { x: number; y: number }) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, position } : node
    ));
  }, []);

  const updateNodeText = useCallback((nodeId: string, text: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, text } : node
    ));
  }, []);

  const updateNodeSize = useCallback((nodeId: string, size: { width: number; height: number }) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, width: size.width, height: size.height } : node
    ));
  }, []);

  const cloneNode = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return null;

    const clonedNode = NodeFactory.cloneNode(node);
    setNodes(prev => [...prev, clonedNode]);
    return clonedNode;
  }, [nodes]);

  const getNode = useCallback((nodeId: string) => {
    return nodes.find(n => n.id === nodeId);
  }, [nodes]);

  const clearNodes = useCallback(() => {
    setNodes([]);
  }, []);

  return {
    nodes,
    setNodes,
    addNode,
    removeNode,
    removeNodes,
    updateNode,
    updateNodePosition,
    updateNodeText,
    updateNodeSize,
    cloneNode,
    getNode,
    clearNodes
  };
};
