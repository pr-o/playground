import {
  Difficulty,
  type CellCoordinate,
  type Digit,
  type MiniSudokuBoard,
  type MiniSudokuCell,
  type MiniSudokuGrid,
  type PuzzleStatePayload,
  type SerializedCell,
  type SerializedPuzzle,
} from './types';

const SERIAL_VERSION = 1;

const normalizeDigitArray = (input: unknown): Digit[] => {
  if (!Array.isArray(input)) return [];
  const normalized = Array.from(
    new Set(
      input
        .filter((value): value is number => typeof value === 'number')
        .map((value) => Math.min(Math.max(Math.round(value), 1), 6)),
    ),
  ).sort((a, b) => a - b);
  return normalized as Digit[];
};

const normalizeCellCoordinate = (coordinate: unknown): CellCoordinate | null => {
  if (
    coordinate &&
    typeof coordinate === 'object' &&
    typeof (coordinate as CellCoordinate).row === 'number' &&
    typeof (coordinate as CellCoordinate).col === 'number'
  ) {
    return {
      row: Math.max(0, Math.min(5, Math.round((coordinate as CellCoordinate).row))),
      col: Math.max(0, Math.min(5, Math.round((coordinate as CellCoordinate).col))),
    };
  }
  return null;
};

const sanitizeDifficulty = (value: unknown): Difficulty => {
  if (Object.values(Difficulty).includes(value as Difficulty)) {
    return value as Difficulty;
  }
  return Difficulty.Beginner;
};

export const toMiniSudokuCell = (cell: Partial<MiniSudokuCell> = {}): MiniSudokuCell => ({
  value: typeof cell.value === 'number' ? cell.value : null,
  notes: normalizeDigitArray(cell.notes),
  given: Boolean(cell.given),
  wasHint: cell.wasHint,
});

export const deserializeBoard = (cells: SerializedCell[][]): MiniSudokuBoard =>
  cells.map((row) =>
    row.map((cell) =>
      toMiniSudokuCell({
        value: typeof cell?.v === 'number' ? cell.v : null,
        notes: normalizeDigitArray(cell?.n),
        given: Boolean(cell?.g),
        wasHint: Boolean(cell?.h),
      }),
    ),
  );

export const serializeBoard = (board: MiniSudokuBoard): SerializedCell[][] =>
  board.map((row) =>
    row.map((cell) => ({
      v: cell.value,
      n: cell.notes.length ? cell.notes : undefined,
      g: cell.given,
      h: cell.wasHint ? true : undefined,
    })),
  );

export const serializePuzzleState = (payload: PuzzleStatePayload): SerializedPuzzle => ({
  version: SERIAL_VERSION,
  puzzleId: payload.puzzleId,
  difficulty: payload.difficulty,
  cells: serializeBoard(payload.board),
  puzzle: payload.puzzle,
  solution: payload.solution,
  notesMode: payload.notesMode,
  hintsUsed: payload.hintsUsed,
  mistakeCount: payload.mistakeCount,
  status: payload.status,
  lastHint: payload.lastHint,
});

export const deserializePuzzleState = (
  serialized: unknown,
  defaults: PuzzleStatePayload,
): PuzzleStatePayload => {
  if (!serialized || typeof serialized !== 'object') {
    return defaults;
  }

  const payload = serialized as SerializedPuzzle;

  const board =
    Array.isArray(payload.cells) && payload.cells.length
      ? deserializeBoard(payload.cells)
      : defaults.board;

  return {
    puzzleId: typeof payload.puzzleId === 'number' ? payload.puzzleId : defaults.puzzleId,
    difficulty: sanitizeDifficulty(payload.difficulty),
    board,
    puzzle:
      Array.isArray(payload.puzzle) && payload.puzzle.length
        ? (payload.puzzle as MiniSudokuGrid)
        : defaults.puzzle,
    solution:
      Array.isArray(payload.solution) && payload.solution.length
        ? (payload.solution as MiniSudokuGrid)
        : defaults.solution,
    notesMode:
      typeof payload.notesMode === 'boolean' ? payload.notesMode : defaults.notesMode,
    hintsUsed:
      typeof payload.hintsUsed === 'number' ? payload.hintsUsed : defaults.hintsUsed,
    mistakeCount:
      typeof payload.mistakeCount === 'number'
        ? payload.mistakeCount
        : defaults.mistakeCount,
    status: payload.status === 'completed' ? 'completed' : defaults.status,
    lastHint: normalizeCellCoordinate(payload.lastHint) ?? defaults.lastHint,
  };
};

export const gridToBoard = (
  grid: MiniSudokuGrid,
  givensMask?: boolean[][],
): MiniSudokuBoard =>
  grid.map((row, rowIndex) =>
    row.map((value, colIndex) => ({
      value,
      notes: [] as Digit[],
      given: givensMask?.[rowIndex]?.[colIndex] ?? value !== null,
    })),
  );
