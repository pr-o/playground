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

export type PelletConsumptionResult = {
  consumed: Pellet[];
  growth: number;
};

export const processPelletConsumption = (
  state: GameState,
): PelletConsumptionResult | null => {
  const head = state.player.segments[0];
  if (!head) return null;

  const captureRadius = Math.max(
    state.config.pellet.radius * 1.75,
    state.config.snake.segmentSpacing * 0.8,
  );

  const nearby = querySpatialIndex(state.spatialIndex, head.position, captureRadius, {
    kinds: ['pellet'],
  });

  if (nearby.length === 0) return null;

  let growthTotal = 0;
  const consumed: Pellet[] = [];

  for (const occupant of nearby) {
    const index = state.pellets.findIndex((pellet) => pellet.id === occupant.id);
    if (index === -1) continue;

    const [pellet] = state.pellets.splice(index, 1);
    growthTotal += pellet.value;
    consumed.push(pellet);

    removeSpatialOccupant(state.spatialIndex, pellet.id);
  }

  if (consumed.length === 0) {
    return null;
  }

  if (growthTotal > 0) {
    state.player.growthReserve += growthTotal;
    state.player.score += growthTotal;
  }

  return {
    consumed,
    growth: growthTotal,
  };
};

export type CreatePelletOptions = {
  kind?: PelletKind;
  position?: Vector2;
  value?: number;
};

export const createPellet = (
  config: SlitherConfig,
  random: () => number,
  options: CreatePelletOptions = {},
): Pellet => {
  const kind = options.kind ?? rollPelletKind(config, random);
  const position = options.position ?? randomPointInArena(config.worldRadius, random);
  const value = options.value ?? pelletValue(kind, config);

  return {
    id: createId('pellet'),
    kind,
    position,
    value,
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

export type PelletClusterOptions = {
  center: Vector2;
  count: number;
  spread?: number;
  kind?: PelletKind;
  valueMultiplier?: number;
};

export const spawnPelletCluster = (state: GameState, options: PelletClusterOptions) => {
  const count = Math.max(1, Math.floor(options.count));
  if (count <= 0) return;

  const { config, random, pellets, spatialIndex } = state;

  const spread = options.spread ?? config.bots.respawn.pelletSpread;
  const kind = options.kind;
  const valueMultiplier = options.valueMultiplier ?? 1;
  const maxCount = config.pellet.maxCount;

  for (let i = 0; i < count; i += 1) {
    if (pellets.length >= maxCount) break;

    const angle = random() * TAU;
    const distance = Math.sqrt(random()) * spread;
    const position = {
      x: options.center.x + Math.cos(angle) * distance,
      y: options.center.y + Math.sin(angle) * distance,
    };

    const pellet = createPellet(config, random, {
      kind,
      position,
      value: Math.max(
        config.snake.growthPerPellet * valueMultiplier,
        config.snake.growthPerPellet * 0.25,
      ),
    });

    pellets.push(pellet);
    insertSpatialOccupant(spatialIndex, {
      id: pellet.id,
      kind: 'pellet',
      position: pellet.position,
      radius: pellet.radius,
    });
  }
};
