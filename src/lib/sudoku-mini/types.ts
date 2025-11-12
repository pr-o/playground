export const DIGIT_VALUES = [1, 2, 3, 4, 5, 6] as const;

export type Digit = (typeof DIGIT_VALUES)[number];
export type CellValue = Digit | null;

export type CellCoordinate = {
  row: number;
  col: number;
};

export type RegionId = number;

export enum Difficulty {
  Beginner = 'beginner',
  Intermediate = 'intermediate',
  Expert = 'expert',
}

export type DifficultyConfig = {
  id: Difficulty;
  label: string;
  minGivens: number;
  maxGivens: number;
  maxHints: number;
};

export type MiniSudokuGrid = CellValue[][];

export type MiniSudokuCell = {
  value: CellValue;
  notes: Digit[];
  given: boolean;
  wasHint?: boolean;
};

export type MiniSudokuBoard = MiniSudokuCell[][];

export type PuzzleStatus = 'playing' | 'completed';

export type SerializedCell = {
  v: CellValue;
  n?: Digit[];
  g: boolean;
  h?: boolean;
};

export type SerializedPuzzle = {
  version: number;
  puzzleId: number;
  difficulty: Difficulty;
  cells: SerializedCell[][];
  notesMode: boolean;
  hintsUsed: number;
  mistakeCount: number;
  status: PuzzleStatus;
  lastHint: CellCoordinate | null;
};

export type PuzzleStatePayload = {
  puzzleId: number;
  difficulty: Difficulty;
  board: MiniSudokuBoard;
  notesMode: boolean;
  hintsUsed: number;
  mistakeCount: number;
  status: PuzzleStatus;
  lastHint: CellCoordinate | null;
};

export type GeneratedPuzzle = {
  puzzle: MiniSudokuGrid;
  solution: MiniSudokuGrid;
  givens: number;
  difficulty: Difficulty;
  seed: number;
};

export type PuzzleGeneratorOptions = {
  random?: () => number;
  forceNew?: boolean;
};
