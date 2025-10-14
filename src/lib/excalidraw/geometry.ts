import { v4 as uuid } from 'uuid';

import {
  ArrowheadStyle,
  ElementStyle,
  ExcalidrawElement,
  ExcalidrawElementType,
  FreeDrawElement,
  LinearElement,
  Point,
  TextAlignment,
  ToolMode,
} from '@/types/excalidraw/elements';

const DEFAULT_STROKE = '#1F2937';
const DEFAULT_FILL = null;
const DEFAULT_STROKE_WIDTH = 2;
const DEFAULT_STROKE_STYLE: StrokeStyle = 'solid';
const DEFAULT_OPACITY = 1;
const DEFAULT_START_ARROWHEAD: ArrowheadStyle = 'none';
const DEFAULT_END_ARROWHEAD: ArrowheadStyle = 'arrow';

const now = () => Date.now();

const applyStyle = (style?: ElementStyle) =>
  style
    ? {
        strokeColor: style.strokeColor,
        fillColor: style.fillColor,
        strokeWidth: style.strokeWidth,
        strokeStyle: style.strokeStyle,
        opacity: style.opacity,
      }
    : {};

const createBaseElement = <T extends ExcalidrawElementType>(
  type: T,
  overrides: Partial<ExcalidrawElement>,
): ExcalidrawElement => {
  const timestamp = now();
  return {
    id: uuid(),
    type,
    position: { x: 0, y: 0 },
    size: { width: 0, height: 0 },
    rotation: 0,
    strokeColor: DEFAULT_STROKE,
    fillColor: DEFAULT_FILL,
    strokeWidth: DEFAULT_STROKE_WIDTH,
    strokeStyle: DEFAULT_STROKE_STYLE,
    opacity: DEFAULT_OPACITY,
    roughness: 0,
    seed: Math.floor(Math.random() * 10_000),
    isLocked: false,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  } as ExcalidrawElement;
};

const normalizeBounds = (start: Point, end: Point) => {
  const x1 = Math.min(start.x, end.x);
  const x2 = Math.max(start.x, end.x);
  const y1 = Math.min(start.y, end.y);
  const y2 = Math.max(start.y, end.y);
  return {
    position: { x: x1, y: y1 },
    size: { width: Math.max(1, x2 - x1), height: Math.max(1, y2 - y1) },
  };
};

const translatePointsToOrigin = (points: Point[]) => {
  const minX = Math.min(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  return {
    origin: { x: minX, y: minY },
    points: points.map((point) => ({
      x: point.x - minX,
      y: point.y - minY,
    })),
  };
};

const getSizeFromPoints = (points: Point[]) => {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const width = Math.max(...xs) - Math.min(...xs);
  const height = Math.max(...ys) - Math.min(...ys);
  return {
    width: Math.max(1, width),
    height: Math.max(1, height),
  };
};

export const createRectangle = (
  start: Point,
  end: Point,
  radius = 12,
  style?: ElementStyle,
) => {
  const { position, size } = normalizeBounds(start, end);
  return createBaseElement('rectangle', {
    position,
    size,
    radius,
    ...applyStyle(style),
  });
};

export const createEllipse = (start: Point, end: Point, style?: ElementStyle) => {
  const { position, size } = normalizeBounds(start, end);
  return createBaseElement('ellipse', {
    position: {
      x: position.x + size.width / 2,
      y: position.y + size.height / 2,
    },
    size,
    ...applyStyle(style),
  });
};

export const createLinearElement = (
  type: Extract<LinearElement['type'], 'line' | 'arrow'>,
  points: Point[],
  options?: {
    startArrowhead?: ArrowheadStyle;
    endArrowhead?: ArrowheadStyle;
    style?: ElementStyle;
  },
) => {
  if (points.length < 2) {
    throw new Error('Linear elements require at least two points.');
  }
  const { origin, points: translated } = translatePointsToOrigin(points);
  const size = getSizeFromPoints(points);
  const style = options?.style;
  const startArrowhead =
    options?.startArrowhead ??
    style?.startArrowhead ??
    (type === 'arrow' ? DEFAULT_START_ARROWHEAD : 'none');
  const endArrowhead =
    options?.endArrowhead ??
    style?.endArrowhead ??
    (type === 'arrow' ? DEFAULT_END_ARROWHEAD : 'none');
  return createBaseElement(type, {
    position: origin,
    size,
    points: translated,
    startArrowhead,
    endArrowhead,
    ...applyStyle(style),
  }) as LinearElement;
};

export const createFreeDrawElement = (
  points: Point[],
  pressures?: number[],
  style?: ElementStyle,
) => {
  const safePoints = points.length ? points : [{ x: 0, y: 0 }];
  const { origin, points: translated } = translatePointsToOrigin(safePoints);
  const size = getSizeFromPoints(safePoints);
  return createBaseElement('freedraw', {
    position: origin,
    size,
    points: translated,
    pressures: pressures ?? translated.map(() => 0.5),
    simulatePressure: !pressures,
    ...applyStyle(style),
  }) as FreeDrawElement;
};

export const createTextElement = (
  position: Point,
  text: string,
  options?: {
    fontSize?: number;
    fontFamily?: string;
    alignment?: TextAlignment;
    style?: ElementStyle;
  },
) => {
  const fontSize = options?.fontSize ?? 20;
  const width = Math.max(120, text.length * (fontSize / 1.8));
  const height = fontSize * 1.4;
  return createBaseElement('text', {
    position,
    size: { width, height },
    text,
    fontSize,
    fontFamily: options?.fontFamily ?? "'Virgil', 'Segoe UI', sans-serif",
    fontWeight: 500,
    lineHeight: 1.3,
    textAlign: options?.alignment ?? 'left',
    verticalAlign: 'top',
    ...applyStyle(options?.style),
  });
};

export const createImagePlaceholder = (start: Point, end: Point, url: string) => {
  const { position, size } = normalizeBounds(start, end);
  return createBaseElement('image', {
    position,
    size,
    url,
    status: 'pending',
    naturalSize: { width: size.width, height: size.height },
    ...applyStyle(),
  });
};

export const createElementForTool = (
  tool: ToolMode,
  start: Point,
  end: Point,
  options?: {
    points?: Point[];
    text?: string;
    pressures?: number[];
    arrowheads?: { start?: ArrowheadStyle; end?: ArrowheadStyle };
    imageUrl?: string;
    style?: ElementStyle;
  },
): ExcalidrawElement | null => {
  switch (tool) {
    case 'rectangle':
      return createRectangle(start, end, 12, options?.style);
    case 'ellipse':
    case 'diamond': {
      const ellipse = createEllipse(start, end, options?.style);
      if (tool === 'diamond') {
        const { position, size } = normalizeBounds(start, end);
        const center = {
          x: position.x + size.width / 2,
          y: position.y + size.height / 2,
        };
        const points = [
          { x: center.x, y: position.y },
          { x: position.x + size.width, y: center.y },
          { x: center.x, y: position.y + size.height },
          { x: position.x, y: center.y },
        ];
        return createLinearElement('line', points.concat(points[0]), {
          style: options?.style,
        });
      }
      return ellipse;
    }
    case 'line':
      return createLinearElement('line', options?.points ?? [start, end], {
        style: options?.style,
      });
    case 'arrow':
      return createLinearElement('arrow', options?.points ?? [start, end], {
        startArrowhead: options?.arrowheads?.start,
        endArrowhead: options?.arrowheads?.end,
        style: options?.style,
      });
    case 'draw':
      return createFreeDrawElement(
        options?.points ?? [start, end],
        options?.pressures,
        options?.style,
      );
    case 'text':
      return options?.text
        ? createTextElement(start, options.text, { style: options?.style })
        : null;
    case 'image':
      return options?.imageUrl
        ? createImagePlaceholder(start, end, options.imageUrl)
        : null;
    default:
      return null;
  }
};
