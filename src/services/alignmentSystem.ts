import { FlowNode } from '../types';

export interface AlignmentGrid {
  rows: number[];
  columns: number[];
  occupied: Map<string, boolean>; // "x,y" -> occupied
}

export interface AutoLayoutConfig {
  minSpacing: number;
  preferredDirection: 'horizontal' | 'vertical' | 'radial';
  gridSize: number;
  avoidOverlap: boolean;
}

export class AutomaticAlignmentSystem {
  private grid: AlignmentGrid;
  private config: AutoLayoutConfig;
  private existingNodes: FlowNode[];

  constructor(config: AutoLayoutConfig = {
    minSpacing: 220,
    preferredDirection: 'horizontal',
    gridSize: 20,
    avoidOverlap: true
  }) {
    this.config = config;
    this.grid = this.initializeGrid();
    this.existingNodes = [];
  }

  // Inicializa o grid de alinhamento
  private initializeGrid(): AlignmentGrid {
    return {
      rows: [],
      columns: [],
      occupied: new Map()
    };
  }

  // Atualiza o grid com nós existentes
  public updateExistingNodes(nodes: FlowNode[]): void {
    this.existingNodes = nodes;
    this.recalculateGrid();
  }

  // Recalcula o grid baseado nos nós existentes
  private recalculateGrid(): void {
    this.grid = this.initializeGrid();
    
    if (this.existingNodes.length === 0) return;

    // Encontra direção predominante
    const direction = this.detectPrimaryDirection();
    
    // Ordena nós baseado na direção predominante
    const sortedNodes = this.sortNodesByDirection(direction);
    
    // Calcula linhas e colunas do grid
    this.calculateGridLines(sortedNodes, direction);
    
    // Marca posições ocupadas
    this.markOccupiedPositions();
  }

  // Detecta direção predominante dos nós existentes
  private detectPrimaryDirection(): 'horizontal' | 'vertical' | 'radial' {
    if (this.existingNodes.length <= 1) return this.config.preferredDirection;

    const nodes = this.existingNodes;
    let horizontalAlignment = 0;
    let verticalAlignment = 0;

    for (let i = 1; i < nodes.length; i++) {
      const prev = nodes[i - 1];
      const curr = nodes[i];
      
      const dx = Math.abs(curr.position.x - prev.position.x);
      const dy = Math.abs(curr.position.y - prev.position.y);
      
      if (dx < this.config.minSpacing) horizontalAlignment++;
      if (dy < this.config.minSpacing) verticalAlignment++;
    }

    if (horizontalAlignment > verticalAlignment) return 'horizontal';
    if (verticalAlignment > horizontalAlignment) return 'vertical';
    return this.config.preferredDirection;
  }

  // Ordena nós baseado na direção
  private sortNodesByDirection(direction: string): FlowNode[] {
    return [...this.existingNodes].sort((a, b) => {
      if (direction === 'horizontal') {
        return a.position.x - b.position.x || a.position.y - b.position.y;
      } else {
        return a.position.y - b.position.y || a.position.x - b.position.x;
      }
    });
  }

  // Calcula linhas do grid
  private calculateGridLines(nodes: FlowNode[], direction: string): void {
    nodes.forEach(node => {
      const row = this.snapToGrid(node.position.y + node.height / 2);
      const col = this.snapToGrid(node.position.x + node.width / 2);
      
      if (!this.grid.rows.includes(row)) this.grid.rows.push(row);
      if (!this.grid.columns.includes(col)) this.grid.columns.push(col);
    });

    this.grid.rows.sort((a, b) => a - b);
    this.grid.columns.sort((a, b) => a - b);
  }

  // Marca posições ocupadas
  private markOccupiedPositions(): void {
    this.existingNodes.forEach(node => {
      const gridX = this.snapToGrid(node.position.x);
      const gridY = this.snapToGrid(node.position.y);
      const key = `${gridX},${gridY}`;
      this.grid.occupied.set(key, true);
    });
  }

  // Encontra posição ideal para novo nó
  public findOptimalPosition(newNode: FlowNode, referenceNode?: FlowNode): { x: number; y: number } {
    if (this.existingNodes.length === 0) {
      return { x: 100, y: 300 }; // Posição inicial padrão
    }

    const direction = this.detectPrimaryDirection();
    const reference = referenceNode || this.findBestReferenceNode();
    
    return this.calculatePositionFromReference(newNode, reference, direction);
  }

  // Encontra o melhor nó de referência
  private findBestReferenceNode(): FlowNode {
    if (this.existingNodes.length === 0) throw new Error('No existing nodes');
    
    // Retorna o último nó adicionado
    return this.existingNodes[this.existingNodes.length - 1];
  }

  // Calcula posição baseado no nó de referência
  private calculatePositionFromReference(
    newNode: FlowNode, 
    reference: FlowNode, 
    direction: string
  ): { x: number; y: number } {
    const spacing = this.config.minSpacing;
    
    // Tenta posições em diferentes direções
    const candidatePositions = this.generateCandidatePositions(reference, newNode, direction, spacing);
    
    // Encontra a primeira posição válida
    for (const position of candidatePositions) {
      if (this.isPositionValid(position, newNode)) {
        return position;
      }
    }
    
    // Fallback: posição radial
    return this.findRadialPosition(reference, newNode, spacing);
  }

  // Gera posições candidatas baseado na direção
  private generateCandidatePositions(
    reference: FlowNode,
    newNode: FlowNode,
    direction: string,
    spacing: number
  ): { x: number; y: number }[] {
    const positions: { x: number; y: number }[] = [];
    
    const baseX = reference.position.x + reference.width + spacing;
    const baseY = reference.position.y + reference.height + spacing;

    if (direction === 'horizontal') {
      // Prioriza direção horizontal
      positions.push(
        { x: baseX, y: reference.position.y }, // Direita
        { x: reference.position.x, y: baseY }, // Abaixo
        { x: baseX, y: baseY }, // Diagonal direita-abaixo
        { x: reference.position.x - newNode.width - spacing, y: reference.position.y }, // Esquerda
        { x: reference.position.x, y: reference.position.y - newNode.height - spacing } // Acima
      );
    } else {
      // Prioriza direção vertical
      positions.push(
        { x: reference.position.x, y: baseY }, // Abaixo
        { x: baseX, y: reference.position.y }, // Direita
        { x: baseX, y: baseY }, // Diagonal direita-abaixo
        { x: reference.position.x - newNode.width - spacing, y: reference.position.y }, // Esquerda
        { x: reference.position.x, y: reference.position.y - newNode.height - spacing } // Acima
      );
    }

    return positions;
  }

  // Encontra posição radial quando outras falham
  private findRadialPosition(
    reference: FlowNode,
    newNode: FlowNode,
    spacing: number
  ): { x: number; y: number } {
    const centerX = reference.position.x + reference.width / 2;
    const centerY = reference.position.y + reference.height / 2;
    
    // Tenta posições em círculo ao redor do nó de referência
    for (let radius = 1; radius <= 5; radius++) {
      for (let angle = 0; angle < 360; angle += 45) {
        const rad = angle * (Math.PI / 180);
        const x = centerX + Math.cos(rad) * (spacing * radius);
        const y = centerY + Math.sin(rad) * (spacing * radius);
        
        const position = { x, y };
        if (this.isPositionValid(position, newNode)) {
          return position;
        }
      }
    }
    
    // Último recurso: posição não sobreposta
    return this.findNonOverlappingPosition(newNode);
  }

  // Encontra posição não sobreposta (fallback)
  private findNonOverlappingPosition(newNode: FlowNode): { x: number; y: number } {
    const canvasWidth = 3000;
    const canvasHeight = 2000;
    
    for (let attempt = 0; attempt < 100; attempt++) {
      const x = Math.random() * (canvasWidth - newNode.width);
      const y = Math.random() * (canvasHeight - newNode.height);
      
      const position = { x, y };
      if (this.isPositionValid(position, newNode)) {
        return position;
      }
    }
    
    // Fallback extremo: lado direito
    return { x: canvasWidth - newNode.width - 100, y: 300 };
  }

  // Verifica se posição é válida (não sobrepõe outros nós)
  private isPositionValid(position: { x: number; y: number }, node: FlowNode): boolean {
    if (!this.config.avoidOverlap) return true;

    const newRect = {
      left: position.x,
      right: position.x + node.width,
      top: position.y,
      bottom: position.y + node.height
    };

    // Verifica sobreposição com nós existentes
    for (const existingNode of this.existingNodes) {
      const existingRect = {
        left: existingNode.position.x,
        right: existingNode.position.x + existingNode.width,
        top: existingNode.position.y,
        bottom: existingNode.position.y + existingNode.height
      };

      if (this.rectanglesOverlap(newRect, existingRect)) {
        return false;
      }
    }

    // Verifica se está muito próximo de outros nós
    return !this.isTooCloseToOthers(position, node);
  }

  // Verifica sobreposição de retângulos
  private rectanglesOverlap(rect1: any, rect2: any): boolean {
    return !(
      rect1.right < rect2.left ||
      rect1.left > rect2.right ||
      rect1.bottom < rect2.top ||
      rect1.top > rect2.bottom
    );
  }

  // Verifica se está muito próximo de outros nós
  private isTooCloseToOthers(position: { x: number; y: number }, node: FlowNode): boolean {
    const minDistance = this.config.minSpacing * 0.7; // Margem de segurança
    
    for (const existingNode of this.existingNodes) {
      const distance = this.calculateDistance(position, existingNode, node);
      if (distance < minDistance) {
        return true;
      }
    }
    
    return false;
  }

  // Calcula distância entre dois nós
  private calculateDistance(pos1: { x: number; y: number }, node2: FlowNode, newNode: FlowNode): number {
    const center1 = {
      x: pos1.x + newNode.width / 2,
      y: pos1.y + newNode.height / 2
    };
    
    const center2 = {
      x: node2.position.x + node2.width / 2,
      y: node2.position.y + node2.height / 2
    };
    
    return Math.sqrt(
      Math.pow(center1.x - center2.x, 2) + Math.pow(center1.y - center2.y, 2)
    );
  }

  // Snap para grid
  private snapToGrid(value: number): number {
    return Math.round(value / this.config.gridSize) * this.config.gridSize;
  }
}
