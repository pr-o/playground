import { EPSILON, add, clamp, distance, rotateTowards } from './math';
import type { GameState, SlitherInputState, SnakeSegment, Vector2 } from './types';

const PATH_RESERVE_FACTOR = 4;
const MIN_LENGTH_PADDING = 0.5;

export const updatePlayerMovement = (
  state: GameState,
  input: SlitherInputState,
  dt: number,
) => {
  const snake = state.player;
  const spacing = state.config.snake.segmentSpacing;
  const head = snake.segments[0];
  if (!head) return;

  const baseLength = Math.max(state.config.snake.initialLength, spacing);
  const drainRate = state.config.boostDrainRate / baseLength;
  const regenRate = state.config.boostRegenRate / baseLength;

  let boostCharge = snake.boostCharge;
  let speedMultiplier = 1;
  let isBoosting = false;

  if (input.isBoosting && boostCharge > EPSILON) {
    boostCharge = clamp(boostCharge - drainRate * dt, 0, 1);
    if (boostCharge > EPSILON) {
      speedMultiplier = state.config.boostMultiplier;
      isBoosting = true;

      const shedRate = spacing * Math.max(drainRate, EPSILON);
      const minLength = Math.max(baseLength * MIN_LENGTH_PADDING, spacing * 2);
      snake.targetLength = Math.max(minLength, snake.targetLength - shedRate * dt);
    }
  }

  if (!isBoosting) {
    boostCharge = clamp(boostCharge + regenRate * dt, 0, 1);
  }

  const baseSpeed = snake.speed;
  const speed = baseSpeed * speedMultiplier;

  const steering = input.steering;
  const hasSteering = Math.abs(steering.x) > EPSILON || Math.abs(steering.y) > EPSILON;
  const desiredAngle = hasSteering ? Math.atan2(steering.y, steering.x) : head.angle;
  const maxTurnRate = speed / Math.max(state.config.snake.minTurnRadius, 1);
  const maxDelta = maxTurnRate * dt;
  const nextAngle = rotateTowards(head.angle, desiredAngle, maxDelta);

  const distanceTravelled = speed * dt;
  if (distanceTravelled <= EPSILON) {
    snake.segments[0] = { ...head, angle: nextAngle };
    return;
  }

  const movement = {
    x: Math.cos(nextAngle) * distanceTravelled,
    y: Math.sin(nextAngle) * distanceTravelled,
  };

  const newHeadPosition = add(head.position, movement);

  if (!snake.path || snake.path.length === 0) {
    snake.path = snake.segments.map((segment) => ({ ...segment.position }));
  }

  snake.path.unshift({ ...newHeadPosition });

  const maxPathLength = snake.targetLength + spacing * PATH_RESERVE_FACTOR;
  const trimmedPath = trimPathToLength(snake.path, maxPathLength);
  const pathLength = computePathLength(trimmedPath);
  const effectiveLength = Math.min(snake.targetLength, pathLength);

  const resampled = resamplePath(trimmedPath, spacing, effectiveLength, nextAngle);

  snake.segments = resampled;
  snake.path = trimmedPath;
  const tail = resampled[resampled.length - 1];
  snake.length = tail ? tail.distance : snake.length;

  snake.isBoosting = isBoosting;
  snake.boostCharge = boostCharge;
};

// Resamples the recorded path into evenly spaced segments using linear interpolation.
const resamplePath = (
  path: Vector2[],
  spacing: number,
  targetLength: number,
  headAngle: number,
): SnakeSegment[] => {
  const sampleLength = Math.max(0, targetLength);
  const steps = Math.max(1, Math.ceil(sampleLength / spacing));
  const sampleDistances: number[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const dist = Math.min(i * spacing, sampleLength);
    if (
      sampleDistances.length === 0 ||
      dist - sampleDistances[sampleDistances.length - 1] > EPSILON
    ) {
      sampleDistances.push(dist);
    }
  }

  if (sampleDistances[sampleDistances.length - 1] < sampleLength - EPSILON) {
    sampleDistances.push(sampleLength);
  }

  if (sampleDistances.length < 2) {
    sampleDistances.push(sampleLength);
  }

  const segments: SnakeSegment[] = [];
  let segmentIndex = 0;
  let segmentStart = path[0] ?? { x: 0, y: 0 };
  let segmentEnd = path[1] ?? segmentStart;
  let accumulated = 0;
  let segmentLength = distance(segmentStart, segmentEnd);

  for (let i = 0; i < sampleDistances.length; i += 1) {
    const target = sampleDistances[i];

    while (
      segmentIndex < path.length - 1 &&
      accumulated + segmentLength < target - EPSILON
    ) {
      accumulated += segmentLength;
      segmentIndex += 1;
      segmentStart = path[segmentIndex];
      segmentEnd = path[segmentIndex + 1] ?? segmentStart;
      segmentLength = distance(segmentStart, segmentEnd);
    }

    let position: Vector2;
    if (segmentLength <= EPSILON) {
      position = { x: segmentStart.x, y: segmentStart.y };
    } else {
      const t = clamp((target - accumulated) / segmentLength, 0, 1);
      position = {
        x: segmentStart.x + (segmentEnd.x - segmentStart.x) * t,
        y: segmentStart.y + (segmentEnd.y - segmentStart.y) * t,
      };
    }

    const angle =
      i === 0
        ? headAngle
        : Math.atan2(
            segments[i - 1].position.y - position.y,
            segments[i - 1].position.x - position.x,
          );

    segments.push({
      position,
      angle,
      distance: target,
    });
  }

  return segments;
};

const trimPathToLength = (path: Vector2[], maxLength: number): Vector2[] => {
  if (path.length <= 1) return path.slice();

  const trimmed: Vector2[] = [{ ...path[0] }];
  let accumulated = 0;

  for (let i = 1; i < path.length; i += 1) {
    const prev = trimmed[trimmed.length - 1];
    const current = path[i];
    const segmentLength = distance(prev, current);

    if (accumulated + segmentLength > maxLength) {
      const remaining = maxLength - accumulated;
      if (segmentLength > EPSILON) {
        const t = clamp(remaining / segmentLength, 0, 1);
        trimmed.push({
          x: prev.x + (current.x - prev.x) * t,
          y: prev.y + (current.y - prev.y) * t,
        });
      } else {
        trimmed.push({ ...prev });
      }
      break;
    }

    trimmed.push({ ...current });
    accumulated += segmentLength;

    if (accumulated >= maxLength - EPSILON) {
      break;
    }
  }

  return trimmed;
};

const computePathLength = (path: Vector2[]): number => {
  if (path.length <= 1) return 0;
  let total = 0;
  for (let i = 1; i < path.length; i += 1) {
    total += distance(path[i - 1], path[i]);
  }
  return total;
};
