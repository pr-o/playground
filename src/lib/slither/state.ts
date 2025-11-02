import type { SlitherConfig, SlitherConfigOverrides } from './config';
import { createSlitherConfig } from './config';
import { createCameraState } from './camera';
import { TAU } from './math';
import { seedPellets } from './pellets';
import { createSnake } from './snake';
import { createSpatialIndex, insertSpatialOccupant } from './spatial-index';
import type { BotSnakeState, GameState, Vector2 } from './types';
import { spawnBots } from './bots';

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

  const state: GameState = {
    config,
    camera,
    player,
    bots: [] as BotSnakeState[],
    pellets,
    particles: [],
    elapsed: 0,
    spatialIndex,
    random,
  };

  spawnBots(state);

  return state;
};

const spawnNearCenter = (radius: number, random: () => number): Vector2 => {
  const maxRadius = radius * 0.2;
  return randomPointInCircle(maxRadius, random);
};

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
