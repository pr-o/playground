export type ExcalidrawElementType =
  | 'rectangle'
  | 'ellipse'
  | 'line'
  | 'arrow'
  | 'freedraw'
  | 'text'
  | 'image';

export type Point = {
  x: number;
  y: number;
};

export type StrokeStyle = 'solid' | 'dashed' | 'dotted';

export type ArrowheadStyle = 'none' | 'arrow' | 'dot' | 'bar';

export type BaseElement = {
  id: string;
  type: ExcalidrawElementType;
  position: Point;
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  strokeColor: string;
  fillColor: string | null;
  strokeWidth: number;
  strokeStyle: StrokeStyle;
  opacity: number;
  roughness: number;
  seed: number;
  isLocked: boolean;
  createdAt: number;
  updatedAt: number;
};

export type RectangleElement = BaseElement & {
  type: 'rectangle';
  radius: number;
};

export type EllipseElement = BaseElement & {
  type: 'ellipse';
};

export type LinearElement = BaseElement & {
  type: 'line' | 'arrow';
  points: Point[];
  startArrowhead: ArrowheadStyle;
  endArrowhead: ArrowheadStyle;
};

export type FreeDrawElement = BaseElement & {
  type: 'freedraw';
  points: Point[];
  pressures: number[];
  simulatePressure: boolean;
};

export type TextAlignment = 'left' | 'center' | 'right';

export type TextElement = BaseElement & {
  type: 'text';
  text: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  lineHeight: number;
  textAlign: TextAlignment;
  verticalAlign: 'top' | 'middle' | 'bottom';
};

export type ImageElement = BaseElement & {
  type: 'image';
  url: string;
  status: 'pending' | 'loaded' | 'error';
  naturalSize: {
    width: number;
    height: number;
  };
};

export type ExcalidrawElement =
  | RectangleElement
  | EllipseElement
  | LinearElement
  | FreeDrawElement
  | TextElement
  | ImageElement;

export type ToolMode =
  | 'selection'
  | 'hand'
  | 'rectangle'
  | 'ellipse'
  | 'diamond'
  | 'arrow'
  | 'line'
  | 'draw'
  | 'text'
  | 'image';

export type CameraState = {
  zoom: number;
  offset: Point;
};

export type HistorySnapshot = {
  elements: ExcalidrawElement[];
  selectedElementIds: string[];
  camera: CameraState;
};

export type ElementStyle = {
  strokeColor: string;
  fillColor: string | null;
  strokeWidth: number;
};
