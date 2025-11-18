import { FlowNode, Connection } from '../types';

// Tipos baseados na estrutura interna do Figma (engenharia reversa)
interface FigmaNode {
  id: string;
  name: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fills?: FigmaFill[];
  strokes?: FigmaStroke[];
  strokeWeight?: number;
  cornerRadius?: number;
  children?: FigmaNode[];
  characters?: string;
  style?: FigmaTextStyle;
  constraints?: {
    horizontal: string;
    vertical: string;
  };
  effects?: FigmaEffect[];
  blendMode?: string;
  opacity?: number;
  isMask?: boolean;
  preserveRatio?: boolean;
  layoutMode?: string;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  itemSpacing?: number;
}

interface FigmaFill {
  type: string;
  color?: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
  opacity?: number;
  visible?: boolean;
}

interface FigmaStroke {
  type: string;
  color: {
    r: number;
    g: number;
    b: number;
    a?: number;
  };
  opacity?: number;
}

interface FigmaTextStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  fontWeight: number;
  fontSize: number;
  textAlignHorizontal: string;
  textAlignVertical: string;
  letterSpacing: number;
  lineHeightPx: number;
  lineHeightPercent?: number;
}

interface FigmaEffect {
  type: string;
  visible: boolean;
  radius?: number;
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  offset?: {
    x: number;
    y: number;
  };
  blendMode?: string;
}

// Converte cores HEX para RGB normalizado (0-1)
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return { r: 0, g: 0, b: 0 };

  return {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
  };
}

// Mapa de cores dos tipos de nós
const nodeColors: Record<string, string> = {
  start: '#22C55E', // green-500
  process: '#3B82F6', // blue-500
  decision: '#EAB308', // yellow-500
  end: '#EF4444', // red-500
};

// Função para calcular tamanho de fonte adaptativo (estimativa)
function calculateAdaptiveFontSize(
  text: string,
  boxWidth: number,
  boxHeight: number,
  baseFontSize: number = 14
): { fontSize: number; lines: string[] } {
  const minFontSize = 8;
  const maxFontSize = baseFontSize;
  const charWidthRatio = 0.55;
  const lineHeightRatio = 1.4;

  let fontSize = maxFontSize;
  let lines: string[] = [];

  while (fontSize >= minFontSize) {
    const charWidth = fontSize * charWidthRatio;
    const lineHeight = fontSize * lineHeightRatio;
    const maxCharsPerLine = Math.floor(boxWidth / charWidth);

    const words = text.split(/\s+/);
    const testLines: string[] = [];
    let currentLine = '';

    words.forEach((word) => {
      const testLine = currentLine ? `${currentLine} ${word}` : word;

      if (testLine.length <= maxCharsPerLine) {
        currentLine = testLine;
      } else {
        if (currentLine) testLines.push(currentLine);
        currentLine = word;
      }
    });

    if (currentLine) testLines.push(currentLine);

    const totalHeight = testLines.length * lineHeight;

    if (totalHeight <= boxHeight || fontSize === minFontSize) {
      lines = testLines;
      break;
    }

    fontSize -= 1;
  }

  return { fontSize, lines };
}

// Mede texto real usando Canvas
function measureTextLines(
  text: string,
  maxWidth: number,
  fontSize: number,
  fontWeight: string = '500',
  fontFamily: string = 'Inter, sans-serif'
): string[] {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return wrapText(text, maxWidth, fontSize);
  }

  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;

  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;

      const wordMetrics = ctx.measureText(word);
      if (wordMetrics.width > maxWidth) {
        const brokenWord = breakLongWord(word, maxWidth, ctx);
        brokenWord.forEach((part, index) => {
          if (index === 0) {
            currentLine = part;
          } else {
            lines.push(currentLine);
            currentLine = part;
          }
        });
      }
    } else if (metrics.width > maxWidth) {
      const brokenWord = breakLongWord(word, maxWidth, ctx);
      brokenWord.forEach((part, index) => {
        if (index < brokenWord.length - 1) {
          lines.push(part);
        } else {
          currentLine = part;
        }
      });
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

// Quebra palavra longa caractere a caractere
function breakLongWord(
  word: string,
  maxWidth: number,
  ctx: CanvasRenderingContext2D
): string[] {
  const parts: string[] = [];
  let currentPart = '';

  for (let i = 0; i < word.length; i++) {
    const testPart = currentPart + word[i];
    const metrics = ctx.measureText(testPart);

    if (metrics.width > maxWidth && currentPart) {
      parts.push(currentPart);
      currentPart = word[i];
    } else {
      currentPart = testPart;
    }
  }

  if (currentPart) {
    parts.push(currentPart);
  }

  return parts.length > 0 ? parts : [word];
}

// Calcula fonte adaptativa com medição real
function calculateAdaptiveFontSizeWithCanvas(
  text: string,
  boxWidth: number,
  boxHeight: number,
  baseFontSize: number = 14
): { fontSize: number; lines: string[] } {
  const minFontSize = 8;
  const maxFontSize = baseFontSize;
  const lineHeightRatio = 1.4;

  let fontSize = maxFontSize;
  let lines: string[] = [];

  while (fontSize >= minFontSize) {
    const lineHeight = fontSize * lineHeightRatio;
    lines = measureTextLines(text, boxWidth, fontSize);
    const totalHeight = lines.length * lineHeight;

    if (totalHeight <= boxHeight || fontSize === minFontSize) {
      break;
    }

    fontSize -= 1;
  }

  return { fontSize, lines };
}

// Quebra texto em múltiplas linhas (fallback aproximado)
function wrapText(text: string, maxWidth: number, fontSize: number = 14): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = '';

  const charWidth = fontSize * 0.55;

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const estimatedWidth = testLine.length * charWidth;

    if (estimatedWidth > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.length > 0 ? lines : [text];
}

// Converte um nó do fluxograma para um Frame Figma com texto
function convertFlowNodeToFigma(node: FlowNode, index: number): FigmaNode {
  const color = hexToRgb(nodeColors[node.type] || '#3B82F6');
  const isCircle = node.type === 'start' || node.type === 'end';
  const isDiamond = node.type === 'decision';

  const mainNode: FigmaNode = {
    id: `${index + 1}:1`,
    name: `${node.type.charAt(0).toUpperCase() + node.type.slice(1)} Node`,
    type: 'FRAME',
    x: node.position.x,
    y: node.position.y,
    width: node.width,
    height: node.height,
    fills: [
      {
        type: 'SOLID',
        color: color,
        opacity: 1,
        visible: true,
      },
    ],
    strokes: [
      {
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1, a: 1 },
        opacity: 1,
      },
    ],
    strokeWeight: 2,
    cornerRadius: isCircle ? 9999 : isDiamond ? 0 : 8,
    constraints: {
      horizontal: 'MIN',
      vertical: 'MIN',
    },
    effects: [
      {
        type: 'DROP_SHADOW',
        visible: true,
        radius: 4,
        color: { r: 0, g: 0, b: 0, a: 0.1 },
        offset: { x: 0, y: 2 },
        blendMode: 'NORMAL',
      },
    ],
    blendMode: 'PASS_THROUGH',
    opacity: 1,
    layoutMode: 'VERTICAL',
    primaryAxisSizingMode: 'FIXED',
    counterAxisSizingMode: 'FIXED',
    primaryAxisAlignItems: 'CENTER',
    counterAxisAlignItems: 'CENTER',
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 12,
    paddingBottom: 12,
    itemSpacing: 0,
    children: [],
  };

  const textNode: FigmaNode = {
    id: `${index + 1}:2`,
    name: 'Label',
    type: 'TEXT',
    x: 0,
    y: 0,
    width: node.width - 24,
    height: node.height - 24,
    characters: node.text,
    fills: [
      {
        type: 'SOLID',
        color: { r: 1, g: 1, b: 1 },
        opacity: 1,
        visible: true,
      },
    ],
    style: {
      fontFamily: 'Inter',
      fontPostScriptName: 'Inter-Medium',
      fontWeight: 500,
      fontSize: 14,
      textAlignHorizontal: 'CENTER',
      textAlignVertical: 'CENTER',
      letterSpacing: 0,
      lineHeightPx: 20,
      lineHeightPercent: 142.857,
    },
    constraints: {
      horizontal: 'STRETCH',
      vertical: 'STRETCH',
    },
    blendMode: 'PASS_THROUGH',
    opacity: 1,
  };

  mainNode.children = [textNode];

  return mainNode;
}

// Converte uma conexão para uma linha Figma
function convertConnectionToFigma(
  connection: Connection,
  nodes: FlowNode[],
  baseIndex: number
): FigmaNode | null {
  const fromNode = nodes.find((n) => n.id === connection.fromNodeId);
  const toNode = nodes.find((n) => n.id === connection.toNodeId);

  if (!fromNode || !toNode) return null;

  const startX = fromNode.position.x + fromNode.width / 2;
  const startY = fromNode.position.y + fromNode.height / 2;
  const endX = toNode.position.x + toNode.width / 2;
  const endY = toNode.position.y + toNode.height / 2;

  const lineNode: FigmaNode = {
    id: `${baseIndex}:1`,
    name: `Connection: ${fromNode.text} → ${toNode.text}`,
    type: 'VECTOR',
    x: Math.min(startX, endX),
    y: Math.min(startY, endY),
    width: Math.abs(endX - startX),
    height: Math.abs(endY - startY),
    fills: [],
    strokes: [
      {
        type: 'SOLID',
        color: { r: 0.4, g: 0.4, b: 0.4 },
        opacity: 1,
      },
    ],
    strokeWeight: 2,
    constraints: {
      horizontal: 'MIN',
      vertical: 'MIN',
    },
    blendMode: 'PASS_THROUGH',
    opacity: 1,
  };

  return lineNode;
}

// Serializa todos os nós e conexões para o formato Figma
export function serializeToFigmaFormat(
  nodes: FlowNode[],
  connections: Connection[]
): string {
  const figmaNodes: FigmaNode[] = [];

  nodes.forEach((node, index) => {
    const figmaNode = convertFlowNodeToFigma(node, index);
    figmaNodes.push(figmaNode);
  });

  connections.forEach((connection, index) => {
    const lineNode = convertConnectionToFigma(
      connection,
      nodes,
      nodes.length + index + 1
    );
    if (lineNode) {
      figmaNodes.push(lineNode);
    }
  });

  const clipboardData = {
    version: '1.0',
    nodes: figmaNodes,
    metadata: {
      source: 'Fluxogram Builder',
      timestamp: new Date().toISOString(),
    },
  };

  return JSON.stringify(clipboardData, null, 2);
}

// Gera SVG como fallback
export function generateSVGFallback(
  nodes: FlowNode[],
  connections: Connection[]
): string {
  const minX = Math.min(...nodes.map((n) => n.position.x));
  const minY = Math.min(...nodes.map((n) => n.position.y));
  const maxX = Math.max(...nodes.map((n) => n.position.x + n.width));
  const maxY = Math.max(...nodes.map((n) => n.position.y + n.height));

  const width = maxX - minX + 40;
  const height = maxY - minY + 40;
  const offsetX = -minX + 20;
  const offsetY = -minY + 20;

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
      <polygon points="0 0, 10 3, 0 6" fill="#666"/>
    </marker>
  </defs>
`;

  // Conexões
  connections.forEach((connection) => {
    const fromNode = nodes.find((n) => n.id === connection.fromNodeId);
    const toNode = nodes.find((n) => n.id === connection.toNodeId);

    if (!fromNode || !toNode) return;

    const startX = fromNode.position.x + fromNode.width / 2 + offsetX;
    const startY = fromNode.position.y + fromNode.height / 2 + offsetY;
    const endX = toNode.position.x + toNode.width / 2 + offsetX;
    const endY = toNode.position.y + toNode.height / 2 + offsetY;

    svgContent += `  <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" stroke="#666" stroke-width="2" marker-end="url(#arrowhead)"/>\n`;
  });

  // Nós
  nodes.forEach((node) => {
    const x = node.position.x + offsetX;
    const y = node.position.y + offsetY;
    const color = nodeColors[node.type] || '#3B82F6';

    const padding = 12;
    const textBoxWidth = node.width - padding * 2;
    const textBoxHeight = node.height - padding * 2;

    const { fontSize, lines } = calculateAdaptiveFontSizeWithCanvas(
      node.text,
      textBoxWidth,
      textBoxHeight,
      14
    );

    const lineHeight = fontSize * 1.4;

    if (node.type === 'start' || node.type === 'end') {
      const radius = Math.min(node.width, node.height) / 2;
      const cx = x + node.width / 2;
      const cy = y + node.height / 2;

      const circleTextBoxSize = radius * 2 - padding * 2;
      const circleResult = calculateAdaptiveFontSizeWithCanvas(
        node.text,
        circleTextBoxSize,
        circleTextBoxSize,
        14
      );

      svgContent += `  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}" stroke="${color}" stroke-width="3" opacity="0.9"/>\n`;

      const startY = cy - (circleResult.lines.length * circleResult.fontSize * 1.4) / 2 + circleResult.fontSize;
      svgContent += `  <text x="${cx}" y="${startY}" fill="white" font-family="Inter, sans-serif" font-size="${circleResult.fontSize}" font-weight="500" text-anchor="middle">\n`;
      circleResult.lines.forEach((line, i) => {
        svgContent += `    <tspan x="${cx}" dy="${i === 0 ? 0 : circleResult.fontSize * 1.4}">${line}</tspan>\n`;
      });
      svgContent += `  </text>\n`;
    } else if (node.type === 'decision') {
      const cx = x + node.width / 2;
      const cy = y + node.height / 2;
      const points = `${cx},${y} ${x + node.width},${cy} ${cx},${y + node.height} ${x},${cy}`;

      svgContent += `  <polygon points="${points}" fill="${color}" stroke="${color}" stroke-width="3" opacity="0.9"/>\n`;

      const diamondTextBoxWidth = textBoxWidth * 0.7;
      const diamondTextBoxHeight = textBoxHeight * 0.7;
      const diamondResult = calculateAdaptiveFontSizeWithCanvas(
        node.text,
        diamondTextBoxWidth,
        diamondTextBoxHeight,
        14
      );

      const startY = cy - (diamondResult.lines.length * diamondResult.fontSize * 1.4) / 2 + diamondResult.fontSize;
      svgContent += `  <text x="${cx}" y="${startY}" fill="white" font-family="Inter, sans-serif" font-size="${diamondResult.fontSize}" font-weight="500" text-anchor="middle">\n`;
      diamondResult.lines.forEach((line, i) => {
        svgContent += `    <tspan x="${cx}" dy="${i === 0 ? 0 : diamondResult.fontSize * 1.4}">${line}</tspan>\n`;
      });
      svgContent += `  </text>\n`;
    } else {
      svgContent += `  <rect x="${x}" y="${y}" width="${node.width}" height="${node.height}" rx="8" fill="${color}" stroke="${color}" stroke-width="3" opacity="0.9"/>\n`;

      const cx = x + node.width / 2;
      const startY = y + padding + fontSize;

      svgContent += `  <text x="${cx}" y="${startY}" fill="white" font-family="Inter, sans-serif" font-size="${fontSize}" font-weight="500" text-anchor="middle">\n`;
      lines.forEach((line, i) => {
        svgContent += `    <tspan x="${cx}" dy="${i === 0 ? 0 : lineHeight}">${line}</tspan>\n`;
      });
      svgContent += `  </text>\n`;
    }
  });

  svgContent += '</svg>';
  return svgContent;
}

// FUNÇÃO PRINCIPAL – versão compatível com Figma Make (sem navigator.clipboard)
export async function copyToFigmaClipboard(
  nodes: FlowNode[],
  connections: Connection[]
): Promise<{ success: boolean; method: string }> {
  if (nodes.length === 0) {
    console.warn('⚠️ Nenhum nó para copiar');
    return { success: false, method: 'none' };
  }

  console.log('📋 Iniciando cópia para clipboard (modo compatível com Figma Make)...');

  // Gera apenas o SVG (formato universal aceito pelo Figma ao colar/importar)
  const svgData = generateSVGFallback(nodes, connections);

  // Mantém a operação síncrona dentro da cadeia do clique (evita perda de user-activation)
  const execSuccess = copyUsingExecCommand(svgData);
  if (execSuccess) {
    return { success: true, method: 'execCommand' };
  }

  console.warn('⚠️ Não foi possível copiar para o clipboard. Gerando download de SVG...');
  downloadSVG(svgData);
  return { success: true, method: 'download' };
}

// Fallback usando o método legacy execCommand
function copyUsingExecCommand(text: string): boolean {
  console.log('🔧 Tentando cópia via document.execCommand("copy")...');

  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;

    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    textarea.style.pointerEvents = 'none';
    textarea.setAttribute('readonly', '');

    document.body.appendChild(textarea);

    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);

    const success = document.execCommand('copy');

    document.body.removeChild(textarea);

    if (success) {
      console.log('✅ SVG copiado usando execCommand');
      console.log('📄 Tamanho do SVG:', text.length, 'caracteres');
      return true;
    } else {
      console.error('❌ execCommand retornou false');
      return false;
    }
  } catch (error) {
    console.error('❌ Método legacy falhou com exceção:', error);
    return false;
  }
}

// Download do SVG como último recurso
function downloadSVG(svgData: string): void {
  const blob = new Blob([svgData], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'fluxogram.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  console.log('💾 SVG baixado com sucesso');
}
