import { FlowNode, Connection, ConnectionStyle } from '../types';
import { Container, CONTAINER_COLORS, CONTAINER_BORDER_COLORS } from '../types/container';

export const generateEnhancedSVG = (
  nodes: FlowNode[],
  connections: Connection[],
  containers: Container[]
): string => {
  if (nodes.length === 0 && containers.length === 0) {
    console.warn('⚠️ Nada para exportar');
    return '';
  }

  // Função de quebra de texto melhorada que respeita \n
  const wrapText = (text: string, maxWidth: number, fontSize: number = 14): string[] => {
    const lines: string[] = [];
    
    // Primeiro, divide por quebras manuais \n
    const manualLines = text.split('\n');
    
    manualLines.forEach(line => {
      if (!line.trim()) {
        lines.push(''); // Linha vazia
        return;
      }
      
      // Quebra automática por palavras (word-break)
      const words = line.split(' ');
      let currentLine = '';
      
      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        // Estimativa: ~0.5 * fontSize por caractere
        const estimatedWidth = testLine.length * (fontSize * 0.5);
        
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
    });
    
    return lines.length > 0 ? lines : [''];
  };

  const escapeXML = (value: string): string =>
    value
      .replace(/&/g, '&')
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const getElementBounds = (
    position: { x: number; y: number },
    size: { width: number; height: number }
  ) => ({
    minX: position.x,
    minY: position.y,
    maxX: position.x + size.width,
    maxY: position.y + size.height,
  });

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  const updateBounds = (bounds: { minX: number; minY: number; maxX: number; maxY: number }) => {
    minX = Math.min(minX, bounds.minX);
    minY = Math.min(minY, bounds.minY);
    maxX = Math.max(maxX, bounds.maxX);
    maxY = Math.max(maxY, bounds.maxY);
  };

  nodes.forEach(node => {
    updateBounds(getElementBounds(node.position, { width: node.width, height: node.height }));
  });

  containers.forEach(container => {
    updateBounds(getElementBounds(container.position, {
      width: container.size.width,
      height: container.isCollapsed ? 40 : container.size.height,
    }));
  });

  if (!Number.isFinite(minX) || !Number.isFinite(minY) || !Number.isFinite(maxX) || !Number.isFinite(maxY)) {
    console.warn('⚠️ Nenhum elemento válido para exportar');
    return '';
  }

  const margin = 80;
  minX -= margin;
  minY -= margin;
  maxX += margin;
  maxY += margin;

  const width = maxX - minX;
  const height = maxY - minY;

  const getConnectionColor = (connection: Connection) => {
    if (connection.style?.color) return connection.style.color;
    if (connection.label === 'Sim') return '#10B981';
    if (connection.label === 'Não') return '#EF4444';
    return '#3B82F6';
  };

  const findElementById = (
    id: string,
    containers: Container[],
    nodes: FlowNode[]
  ): { position: { x: number; y: number }; width: number; height: number } | null => {
    const container = containers.find(c => c.id === id);
    if (container) {
      return {
        position: container.position,
        width: container.size.width,
        height: container.isCollapsed ? 40 : container.size.height,
      };
    }

    const node = nodes.find(n => n.id === id);
    if (node) {
      return {
        position: node.position,
        width: node.width,
        height: node.height,
      };
    }

    return null;
  };

  const calculateConnectionPoints = (
    connection: Connection,
    containers: Container[],
    nodes: FlowNode[]
  ): { x: number; y: number }[] | null => {
    if (connection.points && connection.points.length > 1) {
      return connection.points;
    }

    const fromElement = findElementById(connection.fromNodeId, containers, nodes);
    const toElement = findElementById(connection.toNodeId, containers, nodes);

    if (!fromElement || !toElement) {
      return null;
    }

    const startX = fromElement.position.x + fromElement.width / 2;
    const startY = fromElement.position.y + fromElement.height / 2;
    const endX = toElement.position.x + toElement.width / 2;
    const endY = toElement.position.y + toElement.height / 2;

    const style = connection.style?.type || 'elbow';

    if (style === 'straight') {
      return [
        { x: startX, y: startY },
        { x: endX, y: endY },
      ];
    }

    if (style === 'curved') {
      const dx = endX - startX;
      const curvature = connection.style?.curvature ?? 0.5;
      return [
        { x: startX, y: startY },
        { x: startX + dx * curvature, y: startY },
        { x: startX + dx * (1 - curvature), y: endY },
        { x: endX, y: endY },
      ];
    }

    const midX = (startX + endX) / 2;
    return [
      { x: startX, y: startY },
      { x: midX, y: startY },
      { x: midX, y: endY },
      { x: endX, y: endY },
    ];
  };

  const serializeConnectionPath = (points: { x: number; y: number }[], type: ConnectionStyle['type']): string => {
    if (points.length === 0) return '';
    if (points.length === 2 && type === 'straight') {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }
    if (points.length === 4 && type === 'curved') {
      return `M ${points[0].x} ${points[0].y} C ${points[1].x} ${points[1].y}, ${points[2].x} ${points[2].y}, ${points[3].x} ${points[3].y}`;
    }
    return points.reduce((path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }
      return `${path} L ${point.x} ${point.y}`;
    }, '');
  };

  const arrowDefs = connections
    .map(connection => {
      const color = getConnectionColor(connection);
      return `      <marker id="arrow-${connection.id}" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="${color}" />
      </marker>`;
    })
    .join('\n');

  let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
${arrowDefs}
    <filter id="labelShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.3)" />
    </filter>
    <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.2)" />
    </filter>
  </defs>
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="white" />
  <g id="containers">\n`;

  containers.forEach(container => {
    const borderColor = CONTAINER_BORDER_COLORS[container.type];
    const headerHeight = 36;
    const containerHeight = container.isCollapsed ? 40 : container.size.height;
    const dash = container.isLocked ? '0' : '10 6';

    svgContent += `    <g>
      <rect x="${container.position.x}" y="${container.position.y}" width="${container.size.width}" height="${containerHeight}" rx="8" ry="8" fill="${CONTAINER_COLORS[container.type]}" stroke="${borderColor}" stroke-width="2" stroke-dasharray="${dash}" />
      <rect x="${container.position.x + 2}" y="${container.position.y + 2}" width="${container.size.width - 4}" height="${Math.max(0, headerHeight - 4)}" rx="6" ry="6" fill="${borderColor}20" stroke="${borderColor}40" stroke-width="1" />
      <circle cx="${container.position.x + 16}" cy="${container.position.y + headerHeight / 2}" r="4" fill="${borderColor}" />
      <text x="${container.position.x + 28}" y="${container.position.y + headerHeight / 2 + 4}" font-family="Inter, Arial, sans-serif" font-size="12" font-weight="600" fill="${borderColor}">${escapeXML(container.name)}</text>
      <rect x="${container.position.x + container.size.width - 70}" y="${container.position.y + 10}" width="60" height="18" rx="9" ry="9" fill="${borderColor}30" />
      <text x="${container.position.x + container.size.width - 40}" y="${container.position.y + 23}" font-family="Inter, Arial, sans-serif" font-size="11" font-weight="600" fill="${borderColor}" text-anchor="middle">${escapeXML(container.type)}</text>
    </g>\n`;
  });

  svgContent += `  </g>
  <g id="connections">\n`;

  connections.forEach(connection => {
    const points = calculateConnectionPoints(connection, containers, nodes);
    if (!points) {
      return;
    }

    const connectionColor = getConnectionColor(connection);
    const pathData = serializeConnectionPath(points, connection.style?.type || 'elbow');
    const strokeWidth = connection.style?.strokeWidth ?? 2;
    const dashArray = connection.style?.dashed ? '5 5' : 'none';

    svgContent += `    <path d="${pathData}" fill="none" stroke="${connectionColor}" stroke-width="${strokeWidth}" stroke-dasharray="${dashArray}" marker-end="url(#arrow-${connection.id})" />\n`;

    if (connection.label) {
      const labelPoint = points[Math.floor(points.length / 2)] || points[0];
      const labelDisplay = connection.label === 'Sim' ? 'S' : connection.label === 'Não' ? 'N' : connection.label;
      svgContent += `    <g filter="url(#labelShadow)">
      <circle cx="${labelPoint.x}" cy="${labelPoint.y}" r="18" fill="white" stroke="${connectionColor}" stroke-width="3" />
      <circle cx="${labelPoint.x}" cy="${labelPoint.y}" r="15" fill="${connectionColor}" />
      <text x="${labelPoint.x}" y="${labelPoint.y + 4}" text-anchor="middle" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="bold" fill="white">${escapeXML(labelDisplay)}</text>
    </g>\n`;
    }
  });

  svgContent += `  </g>
  <g id="nodes">\n`;

  nodes.forEach(node => {
    const x = node.position.x;
    const y = node.position.y;
    const w = node.width;
    const h = node.height;
    const cx = x + w / 2;
    const cy = y + h / 2;

    let fill = '#FFFFFF';
    let stroke = '#6B7280';

    switch (node.type) {
      case 'start':
        fill = '#10B981';
        stroke = '#047857';
        break;
      case 'end':
        fill = '#EF4444';
        stroke = '#DC2626';
        break;
      case 'process':
        fill = '#3B82F6';
        stroke = '#1D4ED8';
        break;
      case 'decision':
        fill = '#F59E0B';
        stroke = '#B45309';
        break;
    }

    svgContent += `    <g filter="url(#nodeShadow)">\n`;

    if (node.type === 'start' || node.type === 'end') {
      const radius = Math.min(w, h) / 2;
      svgContent += `      <ellipse cx="${cx}" cy="${cy}" rx="${radius}" ry="${radius}" fill="${fill}" stroke="${stroke}" stroke-width="2" />\n`;
    } else if (node.type === 'decision') {
      const points = `${cx},${y} ${x + w},${cy} ${cx},${y + h} ${x},${cy}`;
      svgContent += `      <polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2" />\n`;
    } else {
      svgContent += `      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" ry="8" fill="${fill}" stroke="${stroke}" stroke-width="2" />\n`;
    }

    const maxTextWidth = node.type === 'decision' ? w - 16 : w - 32;
    const lines = wrapText(node.text, maxTextWidth);
    const lineHeight = 14 * 1.4; // fontSize * lineHeight (igual ao canvas: lineHeight: '1.4')
    const totalTextHeight = lines.length * lineHeight;
    const startY = cy - totalTextHeight / 2 + lineHeight / 2;

    lines.forEach((line, index) => {
      const textY = startY + index * lineHeight;
      svgContent += `      <text x="${cx}" y="${textY}" font-family="Inter, Arial, sans-serif" font-size="14" font-weight="500" fill="white" text-anchor="middle" dominant-baseline="middle">${escapeXML(line)}</text>\n`;
    });

    svgContent += `    </g>\n`;
  });

  svgContent += `  </g>
</svg>`;

  return svgContent;
};