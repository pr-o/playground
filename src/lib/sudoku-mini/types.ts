export const DIGIT_VALUES = [1, 2, 3, 4, 5, 6] as const;

export type Digit = (typeof DIGIT_VALUES)[number];

export type CellValue = Digit | null;

export type MiniSudokuBoard = CellValue[][];

export type CellCoordinate = {
  row: number;
  col: number;
};

export type RegionId = number;

export type Difficulty = 'beginner' | 'intermediate' | 'expert';

export type DifficultyConfig = {
  id: Difficulty;
  label: string;
  minGivens: number;
  maxGivens: number;
  maxHints: number;
};

export type GeneratedPuzzle = {
  puzzle: MiniSudokuBoard;
  solution: MiniSudokuBoard;
  givens: number;
  difficulty: Difficulty;
  seed: number;
};

export type PuzzleGeneratorOptions = {
  random?: () => number;
  forceNew?: boolean;
};
