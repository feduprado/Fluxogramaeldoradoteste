import { FlowNode, Point } from '../types';

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const calculateBezierPoint = (
  start: Point,
  end: Point,
  t: number = 0.5
): Point => {
  const controlPoint: Point = {
    x: (start.x + end.x) / 2,
    y: Math.min(start.y, end.y) - 50,
  };

  const oneMinusT = 1 - t;

  return {
    x:
      Math.pow(oneMinusT, 2) * start.x +
      2 * oneMinusT * t * controlPoint.x +
      Math.pow(t, 2) * end.x,
    y:
      Math.pow(oneMinusT, 2) * start.y +
      2 * oneMinusT * t * controlPoint.y +
      Math.pow(t, 2) * end.y,
  };
};

export const calculateConnectionLabelPosition = (
  fromNode: FlowNode,
  toNode: FlowNode,
  t: number = 0.5
): Point => {
  const startPoint = {
    x: fromNode.position.x + fromNode.width / 2,
    y: fromNode.position.y + fromNode.height / 2,
  };

  const endPoint = {
    x: toNode.position.x + toNode.width / 2,
    y: toNode.position.y + toNode.height / 2,
  };

  return calculateBezierPoint(startPoint, endPoint, clamp(t, 0, 1));
};
