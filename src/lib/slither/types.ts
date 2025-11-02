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

export type BotMode = 'wander' | 'chase' | 'evade';

export type BotAIState = {
  mode: BotMode;
  modeSince: number;
  targetDirection: Vector2;
  targetPelletId: string | null;
  targetPosition: Vector2 | null;
  wanderAngle: number;
  wanderTimer: number;
  cooldownTimer: number;
  avoidanceMistakeTimer: number;
};

export type SnakeState = {
  id: string;
  kind: SnakeKind;
  segments: SnakeSegment[];
  length: number;
  targetLength: number;
  speed: number;
  currentSpeed: number;
  color: string;
  boostCharge: number;
  isBoosting: boolean;
  path: Vector2[];
  growthReserve: number;
  score: number;
  ai?: BotAIState;
  generation?: number;
};

export type BotSnakeState = SnakeState & {
  kind: 'bot';
  ai: BotAIState;
  generation: number;
};

export type BotBudgetState = {
  targetCount: number;
  averageFrameTime: number;
  cooldown: number;
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

export type Particle = {
  id: string;
  position: Vector2;
  velocity: Vector2;
  life: number;
  lifespan: number;
  radius: number;
  color: string;
  alpha: number;
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

export type RandomFn = () => number;

export type InputSource = 'pointer' | 'keyboard' | 'none';

export type SlitherInputState = {
  steering: Vector2;
  isBoosting: boolean;
  source: InputSource;
  pointerActive: boolean;
  pointerPosition: Vector2 | null;
  keyboardVector: Vector2;
  updatedAt: number;
};

export type GameState = {
  config: SlitherConfig;
  camera: CameraState;
  player: SnakeState;
  bots: BotSnakeState[];
  pellets: Pellet[];
  particles: Particle[];
  elapsed: number;
  spatialIndex: SpatialHashIndex;
  random: RandomFn;
  botRespawns: PendingBotRespawnQueue;
  botBudget: BotBudgetState;
};

export type PendingBotRespawn = {
  id: string;
  timeRemaining: number;
  generation: number;
};

export type PendingBotRespawnQueue = PendingBotRespawn[];
