import { spawnPelletCluster } from './pellets';
import { EPSILON, distanceSquared, length } from './math';
import type { GameState, PlayerCrashState, SnakeState, Vector2 } from './types';

export const updatePlayerCollisions = (state: GameState) => {
  if (state.status !== 'running') return;

  const boundary = detectPlayerBoundaryCollision(state);
  if (boundary) {
    applyPlayerCrash(state, boundary);
    return;
  }

  const self = detectPlayerSelfCollision(state);
  if (self) {
    applyPlayerCrash(state, self);
  }
};

export const detectPlayerBoundaryCollision = (
  state: GameState,
): PlayerCrashState | null => {
  const head = state.player.segments[0];
  if (!head) return null;

  const forgiveness = state.config.player.boundaryForgiveness;
  const radius = Math.max(0, state.config.worldRadius - forgiveness);
  const distanceFromCenter = length(head.position);

  if (distanceFromCenter <= radius) {
    return null;
  }

  return {
    reason: 'boundary',
    position: { ...head.position },
    at: state.elapsed,
  };
};

export const detectPlayerSelfCollision = (state: GameState): PlayerCrashState | null => {
  const head = state.player.segments[0];
  if (!head) return null;

  const {
    player: { selfCollisionSkip, selfCollisionStride },
    snake: { segmentSpacing },
  } = state.config;

  const radius = segmentSpacing * 0.7;

  if (
    collidesWithSnake(
      head.position,
      state.player,
      radius,
      selfCollisionSkip,
      selfCollisionStride,
    )
  ) {
    return {
      reason: 'self',
      position: { ...head.position },
      at: state.elapsed,
    };
  }

  return null;
};

export const collidesWithSnake = (
  point: Vector2,
  snake: SnakeState,
  radius: number,
  skipSegments = 0,
  stride = 2,
): boolean => {
  const radiusSq = radius * radius;
  const segments = snake.segments;

  for (let i = Math.max(0, skipSegments); i < segments.length; i += Math.max(1, stride)) {
    const segment = segments[i];
    if (distanceSquared(point, segment.position) <= radiusSq) {
      return true;
    }
  }

  return false;
};

const applyPlayerCrash = (state: GameState, crash: PlayerCrashState) => {
  if (state.status !== 'running') return;

  state.status = 'player-crashed';
  state.playerCrash = crash;

  const {
    player: { crashPelletMultiplier, crashPelletSpread },
    snake: { segmentSpacing },
  } = state.config;

  state.player.isBoosting = false;
  state.player.currentSpeed = 0;

  const pelletCount = Math.max(
    8,
    Math.round(
      (state.player.length / Math.max(segmentSpacing, EPSILON)) * crashPelletMultiplier,
    ),
  );

  spawnPelletCluster(state, {
    center: crash.position,
    count: pelletCount,
    spread: crashPelletSpread,
    valueMultiplier: crash.reason === 'self' ? 0.75 : 1,
  });
};
