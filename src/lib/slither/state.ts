import type { SlitherConfig, SlitherConfigOverrides } from './config';
import { createSlitherConfig } from './config';
import { createCameraState } from './camera';
import { createId } from './id';
import { TAU } from './math';
import { createSnake } from './snake';
import { createSpatialIndex, insertSpatialOccupant } from './spatial-index';
import type { GameState, Pellet, PelletKind, Vector2 } from './types';

export type CreateGameStateOptions = {
  config?: SlitherConfig;
  overrides?: SlitherConfigOverrides;
  seed?: number;
};

export const createGameState = (options: CreateGameStateOptions = {}): GameState => {
  const config = options.config ?? createSlitherConfig(options.overrides);
  const random = createRandom(options.seed);

  const player = createSnake(config, {
    id: 'player',
    kind: 'player',
    position: spawnNearCenter(config.worldRadius, random),
    angle: random() * TAU,
    color: config.palette.player[0],
    boostCharge: 1,
  });

  const camera = createCameraState(config, player.segments[0].position);

  const pellets = seedPellets(config, random);
  const spatialIndex = createSpatialIndex({
    cellSize: Math.max(config.snake.segmentSpacing, config.pellet.radius * 4),
  });

  for (const pellet of pellets) {
    insertSpatialOccupant(spatialIndex, {
      id: pellet.id,
      kind: 'pellet',
      position: pellet.position,
      radius: pellet.radius,
    });
  }

  return {
    config,
    camera,
    player,
    bots: [],
    pellets,
    elapsed: 0,
    spatialIndex,
  };
};

const seedPellets = (config: SlitherConfig, random: () => number): Pellet[] => {
  const pellets: Pellet[] = [];

  for (let i = 0; i < config.pellet.initialCount; i += 1) {
    const kind = rollPelletKind(config, random);
    const position = randomPointInArena(config.worldRadius, random);

    pellets.push({
      id: createId('pellet'),
      kind,
      position,
      value: pelletValue(kind, config),
      radius: config.pellet.radius,
      color: pelletColor(kind, config),
    });
  }

  return pellets;
};

const rollPelletKind = (config: SlitherConfig, random: () => number): PelletKind => {
  const boostThreshold = config.pellet.boostChance;
  const rareThreshold = boostThreshold + config.pellet.rareChance;
  const roll = random();

  if (roll < boostThreshold) return 'boost';
  if (roll < rareThreshold) return 'rare';
  return 'normal';
};

const pelletValue = (kind: PelletKind, config: SlitherConfig): number => {
  switch (kind) {
    case 'boost':
      return config.snake.growthPerPellet;
    case 'rare':
      return config.snake.growthPerPellet * 2;
    default:
      return config.snake.growthPerPellet;
  }
};

const pelletColor = (kind: PelletKind, config: SlitherConfig): string => {
  switch (kind) {
    case 'boost':
      return config.palette.pellets.boost;
    case 'rare':
      return config.palette.pellets.rare;
    default:
      return config.palette.pellets.normal;
  }
};

const spawnNearCenter = (radius: number, random: () => number): Vector2 => {
  const maxRadius = radius * 0.2;
  return randomPointInCircle(maxRadius, random);
};

const randomPointInArena = (radius: number, random: () => number): Vector2 =>
  randomPointInCircle(radius, random);

const randomPointInCircle = (radius: number, random: () => number): Vector2 => {
  const theta = random() * TAU;
  const distance = Math.sqrt(random()) * radius;
  return {
    x: Math.cos(theta) * distance,
    y: Math.sin(theta) * distance,
  };
};

const createRandom = (seed?: number): (() => number) => {
  if (typeof seed !== 'number') {
    return Math.random;
  }

  let state = seed % 2147483647;
  if (state <= 0) state += 2147483646;

  return () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
};
