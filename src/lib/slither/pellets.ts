import type { SlitherConfig } from './config';
import { createId } from './id';
import { TAU } from './math';
import {
  insertSpatialOccupant,
  querySpatialIndex,
  removeSpatialOccupant,
} from './spatial-index';
import type { GameState, Pellet, PelletKind, Vector2 } from './types';

export type PelletSpawnOptions = {
  count?: number;
};

export const seedPellets = (
  config: SlitherConfig,
  random: () => number,
  options: PelletSpawnOptions = {},
): Pellet[] => {
  const count = options.count ?? config.pellet.initialCount;
  const pellets: Pellet[] = [];

  for (let i = 0; i < count; i += 1) {
    pellets.push(createPellet(config, random));
  }

  return pellets;
};

export const maintainPelletPopulation = (state: GameState) => {
  const {
    pellets,
    config: {
      pellet: { initialCount, maxCount },
    },
  } = state;

  const targetCount = Math.min(initialCount, maxCount);
  if (pellets.length >= targetCount) return;

  const missing = Math.max(0, targetCount - pellets.length);

  for (let i = 0; i < missing; i += 1) {
    const pellet = createPellet(state.config, state.random);
    pellets.push(pellet);

    insertSpatialOccupant(state.spatialIndex, {
      id: pellet.id,
      kind: 'pellet',
      position: pellet.position,
      radius: pellet.radius,
    });
  }
};

export const processPelletConsumption = (state: GameState) => {
  const head = state.player.segments[0];
  if (!head) return;

  const captureRadius = Math.max(
    state.config.pellet.radius * 1.75,
    state.config.snake.segmentSpacing * 0.8,
  );

  const nearby = querySpatialIndex(state.spatialIndex, head.position, captureRadius, {
    kinds: ['pellet'],
  });

  if (nearby.length === 0) return;

  let growthTotal = 0;

  for (const occupant of nearby) {
    const index = state.pellets.findIndex((pellet) => pellet.id === occupant.id);
    if (index === -1) continue;

    const [pellet] = state.pellets.splice(index, 1);
    growthTotal += pellet.value;

    removeSpatialOccupant(state.spatialIndex, pellet.id);
  }

  if (growthTotal <= 0) return;

  state.player.growthReserve += growthTotal;
  state.player.score += growthTotal;
};

const createPellet = (config: SlitherConfig, random: () => number): Pellet => {
  const kind = rollPelletKind(config, random);
  const position = randomPointInArena(config.worldRadius, random);

  return {
    id: createId('pellet'),
    kind,
    position,
    value: pelletValue(kind, config),
    radius: config.pellet.radius,
    color: pelletColor(kind, config),
  };
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
