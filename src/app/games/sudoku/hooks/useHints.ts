import { DIFFICULTY_CONFIGS, type Difficulty } from '@/lib/sudoku-mini';

export function useHints(difficulty: Difficulty, hintsUsed: number) {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const maxHints = config?.maxHints ?? 0;
  const remaining = Math.max(maxHints - hintsUsed, 0);
  const hasHints = remaining > 0;

  return {
    maxHints,
    remaining,
    hasHints,
  };
}
