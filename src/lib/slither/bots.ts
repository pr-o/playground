import { updateSnakeMovement } from './movement';
import { querySpatialIndex } from './spatial-index';
import { createSnake } from './snake';
import { spawnPelletCluster } from './pellets';
import { createId } from './id';
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
  SnakeState,
  Vector2,
} from './types';

type BotSpawnOptions = {
  generation: number;
  colorIndex?: number;
};

export const spawnBots = (state: GameState) => {
  state.bots = [];
  state.botRespawns = [];
  const targetCount = Math.max(
    0,
    Math.min(state.botBudget.targetCount, state.config.bots.count),
  );

  for (let i = 0; i < targetCount; i += 1) {
    const bot = createBotSnake(state, {
      generation: 0,
      colorIndex: i,
    });
    state.bots.push(bot);
  }
};

export const updateBots = (state: GameState, dt: number, frameTime?: number) => {
  updateBotBudget(state, frameTime ?? dt);
  processBotRespawns(state, dt);
  if (state.bots.length === 0) return;

  const playerHead = state.player.segments[0];
  if (!playerHead) return;

  for (let index = state.bots.length - 1; index >= 0; index -= 1) {
    const bot = state.bots[index];
    const head = bot.segments[0];
    const ai = bot.ai;
    if (!head || !ai) continue;

    ai.modeSince += dt;
    if (ai.cooldownTimer > 0) {
      ai.cooldownTimer = Math.max(0, ai.cooldownTimer - dt);
    }
    if (ai.avoidanceMistakeTimer > 0) {
      ai.avoidanceMistakeTimer = Math.max(0, ai.avoidanceMistakeTimer - dt);
    }
    ai.wanderTimer -= dt;

    updateBotState(state, bot, head.position, playerHead.position);
    const steering = resolveBotSteering(state, bot, head.position, playerHead.position);
    const adjusted = applyAvoidance(state, bot, head.position, steering);
    updateSnakeMovement(state, bot, adjusted, dt, { allowBoost: false });

    if (handleBotDefeat(state, bot, index)) {
      continue;
    }
  }
};

function createBotSnake(state: GameState, options: BotSpawnOptions): BotSnakeState {
  const { config, random } = state;

  const {
    bots: {
      minLength,
      maxLength,
      minSpeedMultiplier,
      maxSpeedMultiplier,
      spawnRadiusFactor,
      respawn,
    },
    worldRadius,
    baseSpeed,
  } = config;

  const baseLength = randomRange(minLength, maxLength, random);
  const lengthMultiplier = 1 + respawn.lengthGrowth * options.generation;
  const targetLength = baseLength * Math.max(1, lengthMultiplier);

  const speedMultiplier =
    randomRange(minSpeedMultiplier, maxSpeedMultiplier, random) *
    (1 + respawn.speedGrowth * options.generation);

  const spawnRadius = clamp(spawnRadiusFactor, 0.1, 1) * worldRadius;
  const position = resolveSpawnPosition(state, spawnRadius);
  const angle = random() * TAU;
  const color = sampleBotColor(state, options.colorIndex);
  const ai = createBotAIState(state);

  const snake = createSnake(config, {
    kind: 'bot',
    length: targetLength,
    targetLength,
    position,
    angle,
    speed: baseSpeed * speedMultiplier,
    color,
    ai,
    generation: options.generation,
  }) as BotSnakeState;

  snake.generation = options.generation;
  snake.ai = ai;

  return snake;
}

function updateBotBudget(state: GameState, frameTime: number) {
  const { performance, count: maxCount } = state.config.bots;

  const budget = state.botBudget;
  const clampedFrame = clamp(frameTime, 0, 0.12);
  const smoothing = clamp(performance.smoothing, 0.01, 1);

  if (!Number.isFinite(budget.averageFrameTime) || budget.averageFrameTime <= 0) {
    budget.averageFrameTime = clampedFrame;
  } else {
    budget.averageFrameTime += (clampedFrame - budget.averageFrameTime) * smoothing;
  }

  budget.cooldown = Math.max(0, budget.cooldown - clampedFrame);

  const minCount = Math.max(1, Math.min(performance.minCount, maxCount));
  const adjustStep = Math.max(1, Math.floor(performance.adjustStep));

  if (budget.cooldown <= 0) {
    if (
      budget.averageFrameTime > performance.degradeThreshold &&
      budget.targetCount > minCount
    ) {
      budget.targetCount = Math.max(minCount, budget.targetCount - adjustStep);
      budget.cooldown = performance.cooldown;
    } else if (
      budget.averageFrameTime < performance.recoveryThreshold &&
      budget.targetCount < maxCount
    ) {
      budget.targetCount = Math.min(maxCount, budget.targetCount + adjustStep);
      budget.cooldown = performance.cooldown;
    }
  }

  budget.targetCount = Math.min(
    maxCount,
    Math.max(minCount, Math.floor(budget.targetCount)),
  );
}

function processBotRespawns(state: GameState, dt: number) {
  if (state.botRespawns.length === 0) return;

  const targetCount = Math.min(state.botBudget.targetCount, state.config.bots.count);

  for (let i = state.botRespawns.length - 1; i >= 0; i -= 1) {
    const entry = state.botRespawns[i];
    entry.timeRemaining -= dt;

    if (entry.timeRemaining > 0) continue;
    if (state.bots.length >= targetCount) {
      entry.timeRemaining = 0.1;
      continue;
    }

    const bot = createBotSnake(state, { generation: entry.generation });
    state.bots.push(bot);
    state.botRespawns.splice(i, 1);
  }
}

function handleBotDefeat(state: GameState, bot: BotSnakeState, index: number): boolean {
  const reason = detectBotDefeat(state, bot);
  if (!reason) return false;

  const head = bot.segments[0];
  if (head) {
    const spacing = state.config.snake.segmentSpacing;
    const pellets = Math.max(
      6,
      Math.round(
        (bot.length / Math.max(spacing, EPSILON)) *
          state.config.bots.respawn.pelletMultiplier,
      ),
    );

    spawnPelletCluster(state, {
      center: head.position,
      count: pellets,
      spread: state.config.bots.respawn.pelletSpread,
    });
  }

  state.bots.splice(index, 1);
  scheduleBotRespawn(state, (bot.generation ?? 0) + 1);

  return true;
}

function scheduleBotRespawn(state: GameState, generation: number) {
  const {
    respawn: { delayMin, delayMax },
  } = state.config.bots;

  const delay = randomRange(delayMin, delayMax, state.random);

  state.botRespawns.push({
    id: createId('bot-respawn'),
    timeRemaining: delay,
    generation,
  });
}

type BotDefeatReason = 'out-of-bounds' | 'player' | 'bot' | 'self';

function detectBotDefeat(state: GameState, bot: BotSnakeState): BotDefeatReason | null {
  const head = bot.segments[0];
  if (!head) return null;

  const spacing = state.config.snake.segmentSpacing;
  const worldRadius = state.config.worldRadius;
  const collisionRadius = spacing * 0.65;

  if (length(head.position) >= worldRadius - spacing * 0.25) {
    return 'out-of-bounds';
  }

  if (collidesWithSnake(head.position, state.player, collisionRadius)) {
    return 'player';
  }

  for (const other of state.bots) {
    if (other === bot) continue;
    if (collidesWithSnake(head.position, other, collisionRadius)) {
      return 'bot';
    }
  }

  if (collidesWithSnake(head.position, bot, collisionRadius, 6, 2)) {
    return 'self';
  }

  return null;
}

function collidesWithSnake(
  point: Vector2,
  snake: SnakeState,
  radius: number,
  skipSegments = 0,
  stride = 2,
): boolean {
  const radiusSq = radius * radius;
  const segments = snake.segments;

  for (let i = skipSegments; i < segments.length; i += Math.max(1, stride)) {
    const segment = segments[i];
    const dx = point.x - segment.position.x;
    const dy = point.y - segment.position.y;
    if (dx * dx + dy * dy <= radiusSq) {
      return true;
    }
  }

  return false;
}

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

const applyAvoidance = (
  state: GameState,
  bot: BotSnakeState,
  headPosition: Vector2,
  desired: Vector2,
): Vector2 => {
  const {
    bots: { avoidance },
  } = state.config;

  const desiredNormalized = normalize(desired);
  if (
    avoidance.radius <= EPSILON ||
    avoidance.strength <= 0 ||
    (Math.abs(desiredNormalized.x) < EPSILON && Math.abs(desiredNormalized.y) < EPSILON)
  ) {
    return desired;
  }

  if (bot.ai.avoidanceMistakeTimer > 0) {
    return desiredNormalized;
  }

  const avoidanceVector = computeAvoidanceVector(
    state,
    bot,
    headPosition,
    desiredNormalized,
  );
  if (!avoidanceVector) {
    return desiredNormalized;
  }

  if (state.random() < avoidance.mistakeChance) {
    bot.ai.avoidanceMistakeTimer = avoidance.mistakeDuration;
    return desiredNormalized;
  }

  const weight = clamp(avoidance.strength, 0, 1);
  const blended = add(
    scale(desiredNormalized, 1 - weight),
    scale(avoidanceVector, weight),
  );
  const normalized = normalize(blended);

  if (Math.abs(normalized.x) < EPSILON && Math.abs(normalized.y) < EPSILON) {
    return avoidanceVector;
  }

  return normalized;
};

const computeAvoidanceVector = (
  state: GameState,
  bot: BotSnakeState,
  headPosition: Vector2,
  desiredDirection: Vector2,
): Vector2 | null => {
  const {
    bots: {
      avoidance: { radius, sampleStride },
    },
  } = state.config;

  const stride = Math.max(1, Math.floor(sampleStride));
  let accumulator = vec(0, 0);
  let found = false;

  const accumulateFromSnake = (snake: SnakeState, origin: Vector2, weight: number) => {
    const segments = snake.segments;
    const bias = snake.kind === 'player' ? weight * 1.2 : weight;

    for (let i = 0; i < segments.length; i += stride) {
      if (snake === bot && i < 6) continue;
      const segment = segments[i];
      const offset = subtract(origin, segment.position);
      const dist = length(offset);
      if (dist <= EPSILON || dist > radius) continue;

      const falloff = (1 - dist / radius) * bias;
      if (falloff <= 0) continue;

      const contribution = scale(offset, falloff / Math.max(dist, EPSILON));
      accumulator = add(accumulator, contribution);
      found = true;
    }
  };

  const gather = (origin: Vector2, weight: number) => {
    accumulateFromSnake(state.player, origin, weight);
    for (const other of state.bots) {
      if (other === bot) continue;
      accumulateFromSnake(other, origin, weight);
    }
  };

  gather(headPosition, 1);

  const hasDirection =
    Math.abs(desiredDirection.x) > EPSILON || Math.abs(desiredDirection.y) > EPSILON;
  if (hasDirection) {
    const lookaheadDistance = radius * 0.65;
    const lookahead = add(headPosition, scale(desiredDirection, lookaheadDistance));
    gather(lookahead, 0.75);
  }

  if (!found) {
    return null;
  }

  const magnitude = length(accumulator);
  if (magnitude <= EPSILON) {
    return null;
  }

  return scale(accumulator, 1 / magnitude);
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

const resolveSpawnPosition = (state: GameState, spawnRadius: number): Vector2 => {
  const {
    config: { worldRadius },
    random,
    player,
    bots,
  } = state;

  const playerHead = player.segments[0]?.position ?? vec(0, 0);
  const minDistanceFromPlayer = Math.min(worldRadius * 0.3, 520);
  const minDistanceFromBots = state.config.snake.segmentSpacing * 8;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = randomPointInCircle(spawnRadius, random);
    if (distance(candidate, playerHead) < minDistanceFromPlayer) continue;

    let tooClose = false;

    for (const other of bots) {
      const head = other.segments[0];
      if (!head) continue;
      if (distance(candidate, head.position) < minDistanceFromBots) {
        tooClose = true;
        break;
      }
    }

    if (!tooClose) {
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
    avoidanceMistakeTimer: 0,
  };
};

const sampleBotColor = (state: GameState, index?: number) => {
  const palette = state.config.palette.bots;
  if (palette.length === 0) return '#ffffff';
  if (typeof index === 'number') {
    return palette[index % palette.length];
  }
  const randomIndex = Math.floor(state.random() * palette.length);
  return palette[randomIndex];
};
