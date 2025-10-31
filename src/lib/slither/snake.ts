import type { SlitherConfig } from './config';
import { createId } from './id';
import { clamp, vec } from './math';
import type { SnakeKind, SnakeSegment, SnakeState, Vector2 } from './types';

export type SnakeInitOptions = {
  id?: string;
  kind?: SnakeKind;
  length?: number;
  position?: Vector2;
  angle?: number;
  speed?: number;
  color?: string;
  targetLength?: number;
  boostCharge?: number;
};

export const createSnake = (
  config: SlitherConfig,
  options: SnakeInitOptions = {},
): SnakeState => {
  const kind = options.kind ?? 'player';
  const baseLength = Math.max(
    options.length ?? config.snake.initialLength,
    config.snake.segmentSpacing,
  );
  const segmentSpacing = config.snake.segmentSpacing;
  const headPosition = options.position ?? vec(0, 0);
  const baseAngle = options.angle ?? 0;

  const segments = createSegmentStrip({
    count: segmentsForLength(baseLength, segmentSpacing),
    spacing: segmentSpacing,
    head: headPosition,
    angle: baseAngle,
  });

  const totalLength = computeSegmentLength(segments, segmentSpacing);
  const paletteColor = defaultSnakeColor(kind, config);
  const path = segments.map((segment) => ({ ...segment.position }));

  return {
    id: options.id ?? createId(kind),
    kind,
    segments,
    length: totalLength,
    targetLength: options.targetLength ?? Math.max(baseLength, totalLength),
    speed: options.speed ?? config.baseSpeed,
    color: options.color ?? paletteColor,
    boostCharge: clamp(options.boostCharge ?? 1, 0, 1),
    isBoosting: false,
    path,
  };
};

export const segmentsForLength = (length: number, spacing: number): number =>
  Math.max(2, Math.ceil(length / spacing) + 1);

export const createSegmentStrip = ({
  count,
  spacing,
  head,
  angle,
}: {
  count: number;
  spacing: number;
  head: Vector2;
  angle: number;
}): SnakeSegment[] => {
  const segments: SnakeSegment[] = [];
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);

  for (let i = 0; i < count; i += 1) {
    const distance = i * spacing;
    segments.push({
      position: {
        x: head.x - dx * distance,
        y: head.y - dy * distance,
      },
      angle,
      distance,
    });
  }

  return segments;
};

export const computeSegmentLength = (
  segments: SnakeSegment[],
  spacing: number,
): number => {
  if (segments.length <= 1) return 0;
  return (segments.length - 1) * spacing;
};

const defaultSnakeColor = (kind: SnakeKind, config: SlitherConfig): string => {
  const palette = kind === 'player' ? config.palette.player : config.palette.bots;
  if (palette.length === 0) return '#ffffff';
  if (kind === 'player') {
    return palette[0];
  }

  const index = Math.floor(Math.random() * palette.length);
  return palette[index];
};
