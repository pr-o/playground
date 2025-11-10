import type { Difficulty, DifficultyConfig, Digit } from './types';

export const BOARD_SIZE = 6;
export const REGION_WIDTH = 3;
export const REGION_HEIGHT = 2;
export const TOTAL_CELLS = BOARD_SIZE * BOARD_SIZE;

export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6];

export const DEFAULT_DIFFICULTY: Difficulty = 'beginner';
export const ALL_DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'expert'];

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  beginner: {
    id: 'beginner',
    label: 'Beginner',
    minGivens: 22,
    maxGivens: 24,
    maxHints: 5,
  },
  intermediate: {
    id: 'intermediate',
    label: 'Intermediate',
    minGivens: 18,
    maxGivens: 21,
    maxHints: 4,
  },
  expert: {
    id: 'expert',
    label: 'Expert',
    minGivens: 14,
    maxGivens: 17,
    maxHints: 3,
  },
};
