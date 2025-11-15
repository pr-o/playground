import { Difficulty } from './types';
import type { DifficultyConfig, Digit } from './types';

export const BOARD_SIZE = 6;
export const REGION_WIDTH = 3;
export const REGION_HEIGHT = 2;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6];

export const DEFAULT_DIFFICULTY: Difficulty = Difficulty.Beginner;
export const ALL_DIFFICULTIES: Difficulty[] = [
  Difficulty.Beginner,
  Difficulty.Intermediate,
  Difficulty.Expert,
];

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  [Difficulty.Beginner]: {
    id: Difficulty.Beginner,
    label: 'Beginner',
    minGivens: 22,
    maxGivens: 24,
    maxHints: 5,
  },
  [Difficulty.Intermediate]: {
    id: Difficulty.Intermediate,
    label: 'Intermediate',
    minGivens: 18,
    maxGivens: 21,
    maxHints: 4,
  },
  [Difficulty.Expert]: {
    id: Difficulty.Expert,
    label: 'Expert',
    minGivens: 14,
    maxGivens: 17,
    maxHints: 3,
  },
};
