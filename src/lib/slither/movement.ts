import { EPSILON, add, clamp, distance, rotateTowards } from './math';
import type { GameState, SlitherInputState, SnakeSegment, Vector2 } from './types';

const MAX_PATH_PADDING = 4;

export const updatePlayerMovement = (
  state: GameState,
  input: SlitherInputState,
  dt: number,
) => {
  const snake = state.player;
  const spacing = state.config.snake.segmentSpacing;
  const head = snake.segments[0];
  if (!head) return;

  const steering = input.steering;
  const hasSteering = Math.abs(steering.x) > EPSILON || Math.abs(steering.y) > EPSILON;
  const desiredAngle = hasSteering ? Math.atan2(steering.y, steering.x) : head.angle;
  const speed = snake.speed;
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

  const maxSamples = Math.max(
    snake.segments.length + MAX_PATH_PADDING,
    Math.ceil(snake.targetLength / spacing) + MAX_PATH_PADDING,
  );

  if (snake.path.length > maxSamples) {
    snake.path.length = maxSamples;
  }

  const resampled = resamplePath(snake.path, spacing, snake.targetLength, nextAngle);

  snake.segments = resampled;
  snake.path = resampled.map((segment) => ({ ...segment.position }));
  const tail = resampled[resampled.length - 1];
  snake.length = tail ? tail.distance : snake.length;

  snake.isBoosting = input.isBoosting;
};

const resamplePath = (
  path: Vector2[],
  spacing: number,
  targetLength: number,
  headAngle: number,
): SnakeSegment[] => {
  const maxDistance = Math.max(targetLength, spacing);
  const sampleCount = Math.max(2, Math.ceil(maxDistance / spacing) + 1);
  const sampleDistances = Array.from({ length: sampleCount }, (_, index) =>
    Math.min(index * spacing, maxDistance),
  );

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
