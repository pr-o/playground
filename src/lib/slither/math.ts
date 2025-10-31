import type { Vector2 } from './types';

export const TAU = Math.PI * 2;
export const EPSILON = 1e-6;

export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

export const lerp = (start: number, end: number, t: number): number =>
  start + (end - start) * clamp(t, 0, 1);

export const lerpAngle = (current: number, target: number, t: number): number => {
  const shortest = ((target - current + Math.PI) % TAU) - Math.PI;
  return current + shortest * clamp(t, 0, 1);
};

export const vec = (x = 0, y = 0): Vector2 => ({ x, y });

export const add = (a: Vector2, b: Vector2): Vector2 => ({ x: a.x + b.x, y: a.y + b.y });

export const subtract = (a: Vector2, b: Vector2): Vector2 => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const scale = (v: Vector2, scalar: number): Vector2 => ({
  x: v.x * scalar,
  y: v.y * scalar,
});

export const lengthSquared = (v: Vector2): number => v.x * v.x + v.y * v.y;

export const length = (v: Vector2): number => Math.sqrt(lengthSquared(v));

export const normalize = (v: Vector2): Vector2 => {
  const mag = length(v);
  if (mag < EPSILON) return vec(0, 0);
  return scale(v, 1 / mag);
};

export const angleTo = (from: Vector2, to: Vector2): number =>
  Math.atan2(to.y - from.y, to.x - from.x);

export const distanceSquared = (a: Vector2, b: Vector2): number =>
  lengthSquared(subtract(a, b));
