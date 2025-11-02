import { updateSnakeMovement } from './movement';
import { querySpatialIndex } from './spatial-index';
import { createSnake } from './snake';
import {
  EPSILON,
  TAU,
  add,
  clamp,
  distance,
  length,
  normalize,
  scale,
  subtract,
  vec,
} from './math';
import type {
  BotAIState,
  BotMode,
  BotSnakeState,
  GameState,
  Pellet,
  Vector2,
} from './types';

export const spawnBots = (state: GameState) => {
  const {
    config: {
      bots: {
        count,
        minLength,
        maxLength,
        minSpeedMultiplier,
        maxSpeedMultiplier,
        spawnRadiusFactor,
      },
      worldRadius,
      baseSpeed,
    },
    random,
    player,
  } = state;

  const bots: BotSnakeState[] = [];
  const spawnRadius = clamp(spawnRadiusFactor, 0.1, 1) * worldRadius;
  const playerHead = player.segments[0]?.position ?? vec(0, 0);

  for (let i = 0; i < count; i += 1) {
    const speedMultiplier =
      minSpeedMultiplier +
      (maxSpeedMultiplier - minSpeedMultiplier) * clamp(random(), 0, 1);
    const targetLength = minLength + (maxLength - minLength) * clamp(random(), 0, 1);

    const position = resolveSpawnPosition(spawnRadius, worldRadius, playerHead, random);
    const angle = random() * TAU;
    const color = sampleBotColor(state, i);
    const ai = createBotAIState(state);

    const snake = createSnake(state.config, {
      kind: 'bot',
      length: targetLength,
      position,
      angle,
      speed: baseSpeed * speedMultiplier,
      targetLength,
      color,
      ai,
    }) as BotSnakeState;

    bots.push(snake);
  }

  state.bots = bots;
};

export const updateBots = (state: GameState, dt: number) => {
  if (state.bots.length === 0) return;

  const playerHead = state.player.segments[0];
  if (!playerHead) return;

  for (const bot of state.bots) {
    const head = bot.segments[0];
    const ai = bot.ai;
    if (!head || !ai) continue;

    ai.modeSince += dt;
    if (ai.cooldownTimer > 0) {
      ai.cooldownTimer = Math.max(0, ai.cooldownTimer - dt);
    }
    ai.wanderTimer -= dt;

    updateBotState(state, bot, head.position, playerHead.position);
    const steering = resolveBotSteering(state, bot, head.position, playerHead.position);
    updateSnakeMovement(state, bot, steering, dt, { allowBoost: false });
  }
};

const updateBotState = (
  state: GameState,
  bot: BotSnakeState,
  headPosition: Vector2,
  playerHead: Vector2,
) => {
  const ai = bot.ai;
  const {
    config: {
      bots: { evade },
    },
  } = state;

  const playerDistance = distance(headPosition, playerHead);

  if (playerDistance <= evade.playerRadius) {
    if (ai.mode !== 'evade') {
      enterMode(state, bot, 'evade');
    } else {
      ai.modeSince = 0;
    }
  } else if (ai.mode === 'evade') {
    if (ai.modeSince >= evade.duration) {
      enterMode(state, bot, 'wander');
    }
  }

  if (ai.mode !== 'evade' && ai.cooldownTimer <= 0) {
    const pellet = resolvePelletTarget(state, bot, headPosition);

    if (pellet) {
      ai.targetPelletId = pellet.id;
      ai.targetPosition = { ...pellet.position };
      if (ai.mode !== 'chase') {
        enterMode(state, bot, 'chase');
      } else {
        ai.modeSince = 0;
      }
    } else if (ai.mode === 'chase') {
      enterMode(state, bot, 'wander');
    }
  } else if (ai.mode === 'chase') {
    enterMode(state, bot, 'wander');
  }

  if (ai.mode === 'evade') {
    ai.targetPelletId = null;
    ai.targetPosition = null;
  }

  if (ai.mode === 'chase' && ai.targetPosition) {
    const pelletDistance = distance(headPosition, ai.targetPosition);
    if (pelletDistance < state.config.pellet.radius * 1.8) {
      ai.targetPelletId = null;
      ai.targetPosition = null;
      enterMode(state, bot, 'wander');
    }
  }
};

const resolveBotSteering = (
  state: GameState,
  bot: BotSnakeState,
  headPosition: Vector2,
  playerHead: Vector2,
): Vector2 => {
  const ai = bot.ai;
  switch (ai.mode) {
    case 'evade':
      return steerEvade(state, headPosition, playerHead, ai);
    case 'chase':
      return steerChase(state, headPosition, ai);
    case 'wander':
    default:
      return steerWander(state, headPosition, ai);
  }
};

const steerWander = (
  state: GameState,
  headPosition: Vector2,
  ai: BotAIState,
): Vector2 => {
  const {
    config: {
      bots: { wander },
      worldRadius,
    },
    random,
  } = state;

  if (ai.wanderTimer <= 0 || !Number.isFinite(ai.wanderAngle)) {
    ai.wanderTimer = randomRange(wander.intervalMin, wander.intervalMax, random);
    ai.wanderAngle =
      (ai.wanderAngle ?? random() * TAU) + (random() - 0.5) * 2 * wander.angleJitter;
  }

  const direction = {
    x: Math.cos(ai.wanderAngle),
    y: Math.sin(ai.wanderAngle),
  };

  const adjusted = avoidWalls(direction, headPosition, worldRadius);
  ai.targetDirection = adjusted;
  return adjusted;
};

const steerChase = (state: GameState, headPosition: Vector2, ai: BotAIState): Vector2 => {
  if (!ai.targetPosition) {
    return steerWander(state, headPosition, ai);
  }

  const desired = normalize(subtract(ai.targetPosition, headPosition));
  if (Math.abs(desired.x) < EPSILON && Math.abs(desired.y) < EPSILON) {
    return steerWander(state, headPosition, ai);
  }

  ai.targetDirection = desired;
  return desired;
};

const steerEvade = (
  state: GameState,
  headPosition: Vector2,
  playerHead: Vector2,
  ai: BotAIState,
): Vector2 => {
  const awayFromPlayer = subtract(headPosition, playerHead);
  let desired = normalize(awayFromPlayer);

  if (Math.abs(desired.x) < EPSILON && Math.abs(desired.y) < EPSILON) {
    desired = ai.targetDirection;
  }

  const inwardBias = normalize(scale(headPosition, -1));
  const blended = normalize(add(scale(desired, 0.75), scale(inwardBias, 0.25)));

  ai.targetDirection = blended;
  return blended;
};

const enterMode = (state: GameState, bot: BotSnakeState, mode: BotMode) => {
  const ai = bot.ai;
  if (ai.mode === mode) {
    ai.modeSince = 0;
    return;
  }

  ai.mode = mode;
  ai.modeSince = 0;

  const {
    config: {
      bots: { wander, evade },
    },
    random,
  } = state;

  switch (mode) {
    case 'wander':
      ai.targetPelletId = null;
      ai.targetPosition = null;
      ai.wanderTimer = randomRange(wander.intervalMin, wander.intervalMax, random);
      break;
    case 'chase':
      ai.wanderTimer = randomRange(
        wander.intervalMin * 0.5,
        wander.intervalMax * 0.5,
        random,
      );
      break;
    case 'evade':
      ai.cooldownTimer = evade.cooldown;
      ai.targetPelletId = null;
      ai.targetPosition = null;
      ai.wanderTimer = randomRange(wander.intervalMin, wander.intervalMax, random);
      break;
    default:
      break;
  }
};

const resolvePelletTarget = (
  state: GameState,
  bot: BotSnakeState,
  headPosition: Vector2,
): Pellet | null => {
  const {
    config: {
      bots: { chase },
    },
  } = state;

  if (bot.ai.targetPelletId) {
    const pellet = state.pellets.find((p) => p.id === bot.ai.targetPelletId);
    if (pellet) {
      const dist = distance(headPosition, pellet.position);
      if (dist <= chase.pelletRadius * 1.1) {
        return pellet;
      }
    }

    bot.ai.targetPelletId = null;
    bot.ai.targetPosition = null;
  }

  const nearby = querySpatialIndex(state.spatialIndex, headPosition, chase.pelletRadius, {
    kinds: ['pellet'],
  });

  let best: Pellet | null = null;
  let bestScore = -Infinity;

  for (const occupant of nearby) {
    const pellet = state.pellets.find((p) => p.id === occupant.id);
    if (!pellet) continue;
    if (pellet.value < chase.minPelletValue) continue;

    const dist = distance(headPosition, pellet.position);
    const score = pellet.value - dist * 0.01;

    if (score > bestScore) {
      best = pellet;
      bestScore = score;
    }
  }

  return best;
};

const resolveSpawnPosition = (
  spawnRadius: number,
  worldRadius: number,
  playerHead: Vector2,
  random: () => number,
): Vector2 => {
  const minDistanceFromPlayer = Math.min(worldRadius * 0.3, 480);

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const candidate = randomPointInCircle(spawnRadius, random);
    if (distance(candidate, playerHead) >= minDistanceFromPlayer) {
      return candidate;
    }
  }

  return randomPointInCircle(worldRadius * 0.8, random);
};

const randomPointInCircle = (radius: number, random: () => number): Vector2 => {
  const theta = random() * TAU;
  const distanceFromCenter = Math.sqrt(random()) * radius;
  return {
    x: Math.cos(theta) * distanceFromCenter,
    y: Math.sin(theta) * distanceFromCenter,
  };
};

const randomRange = (min: number, max: number, random: () => number) =>
  min + (max - min) * clamp(random(), 0, 1);

const avoidWalls = (
  direction: Vector2,
  position: Vector2,
  worldRadius: number,
): Vector2 => {
  const dist = length(position);
  if (dist < worldRadius * 0.82) {
    return normalize(direction);
  }

  const inward = normalize(scale(position, -1));
  const blend = clamp((dist - worldRadius * 0.82) / (worldRadius * 0.18), 0, 1);

  const adjusted = add(scale(direction, 1 - blend), scale(inward, blend));
  const normalized = normalize(adjusted);

  if (Math.abs(normalized.x) < EPSILON && Math.abs(normalized.y) < EPSILON) {
    return inward.x === 0 && inward.y === 0 ? direction : inward;
  }

  return normalized;
};

const createBotAIState = (state: GameState): BotAIState => {
  const {
    config: {
      bots: { wander },
    },
    random,
  } = state;

  const wanderAngle = random() * TAU;
  const direction = {
    x: Math.cos(wanderAngle),
    y: Math.sin(wanderAngle),
  };

  return {
    mode: 'wander',
    modeSince: 0,
    targetDirection: normalize(direction),
    targetPelletId: null,
    targetPosition: null,
    wanderAngle,
    wanderTimer: randomRange(wander.intervalMin, wander.intervalMax, random),
    cooldownTimer: 0,
  };
};

const sampleBotColor = (state: GameState, index: number) => {
  const palette = state.config.palette.bots;
  if (palette.length === 0) return '#ffffff';
  return palette[index % palette.length];
};
