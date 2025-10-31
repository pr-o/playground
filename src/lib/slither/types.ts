import type { SlitherConfig } from './config';

export type Vector2 = {
  x: number;
  y: number;
};

export type SnakeKind = 'player' | 'bot';

export type SnakeSegment = {
  position: Vector2;
  angle: number;
  distance: number;
};

export type SnakeState = {
  id: string;
  kind: SnakeKind;
  segments: SnakeSegment[];
  length: number;
  targetLength: number;
  speed: number;
  color: string;
  boostCharge: number;
  isBoosting: boolean;
};

export type PelletKind = 'normal' | 'rare' | 'boost';

export type Pellet = {
  id: string;
  kind: PelletKind;
  position: Vector2;
  value: number;
  radius: number;
  color: string;
};

export type CameraState = {
  position: Vector2;
  zoom: number;
  targetZoom: number;
};

export type SpatialOccupantKind =
  | 'pellet'
  | 'snake-head'
  | 'snake-segment'
  | 'snake-tail';

export type SpatialOccupant = {
  id: string;
  kind: SpatialOccupantKind;
  position: Vector2;
  radius: number;
};

export type SpatialHashCell = {
  key: string;
  occupantIds: Set<string>;
};

export type SpatialHashIndex = {
  cellSize: number;
  lookup: Map<string, SpatialHashCell>;
  occupants: Map<string, SpatialOccupant>;
};

export type GameState = {
  config: SlitherConfig;
  camera: CameraState;
  player: SnakeState;
  bots: SnakeState[];
  pellets: Pellet[];
  elapsed: number;
  spatialIndex: SpatialHashIndex;
};
