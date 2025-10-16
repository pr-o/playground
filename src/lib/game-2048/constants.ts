import type { MoveDirection } from './types';

export const BOARD_SIZE = 4;
export const INITIAL_TILE_COUNT = 2;
export const WINNING_VALUE = 2048;

/**
 * The canonical spawn odds from the original 2048 implementation:
 * 90% chance to spawn a 2, 10% chance to spawn a 4.
 */
export const SPAWN_PROBABILITY = {
  2: 0.9,
  4: 0.1,
} as const;

export const MOVE_DIRECTIONS: MoveDirection[] = ['up', 'down', 'left', 'right'];

export const STORAGE_KEYS = {
  STATE: '2048_clone/state',
  BEST_SCORE: '2048_clone/best_score',
  ACHIEVEMENTS: '2048_clone/achievements',
} as const;
