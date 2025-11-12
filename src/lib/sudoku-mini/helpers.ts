import {
  BOARD_SIZE,
  DIGITS,
  REGION_HEIGHT,
  REGION_WIDTH,
  TOTAL_CELLS,
} from './constants';
import type { CellCoordinate, CellValue, Digit, MiniSudokuGrid, RegionId } from './types';

export const createEmptyBoard = (): MiniSudokuGrid =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null as CellValue),
  );

export const cloneBoard = (board: MiniSudokuGrid): MiniSudokuGrid =>
  board.map((row) => row.slice());

export const getRegionIndex = (row: number, col: number): RegionId => {
  const regionRow = Math.floor(row / REGION_HEIGHT);
  const regionCol = Math.floor(col / REGION_WIDTH);
  const regionsPerRow = BOARD_SIZE / REGION_WIDTH;
  return regionRow * regionsPerRow + regionCol;
};

export const isPlacementValid = (
  board: MiniSudokuGrid,
  row: number,
  col: number,
  value: Digit,
): boolean => {
  for (let index = 0; index < BOARD_SIZE; index += 1) {
    if (board[row][index] === value) return false;
    if (board[index][col] === value) return false;
  }

  const startRow = Math.floor(row / REGION_HEIGHT) * REGION_HEIGHT;
  const startCol = Math.floor(col / REGION_WIDTH) * REGION_WIDTH;

  for (let r = 0; r < REGION_HEIGHT; r += 1) {
    for (let c = 0; c < REGION_WIDTH; c += 1) {
      if (board[startRow + r][startCol + c] === value) {
        return false;
      }
    }
  }

  return true;
};

export const getRowValues = (board: MiniSudokuGrid, row: number): CellValue[] =>
  board[row] ?? [];

export const getColumnValues = (board: MiniSudokuGrid, col: number): CellValue[] =>
  board.map((row) => row[col]);

export const getRegionValues = (
  board: MiniSudokuGrid,
  row: number,
  col: number,
): CellValue[] => {
  const startRow = Math.floor(row / REGION_HEIGHT) * REGION_HEIGHT;
  const startCol = Math.floor(col / REGION_WIDTH) * REGION_WIDTH;
  const values: CellValue[] = [];

  for (let r = 0; r < REGION_HEIGHT; r += 1) {
    for (let c = 0; c < REGION_WIDTH; c += 1) {
      values.push(board[startRow + r][startCol + c]);
    }
  }

  return values;
};

export const countFilledCells = (board: MiniSudokuGrid): number =>
  board.reduce(
    (acc, row) => acc + row.reduce((rowAcc, cell) => rowAcc + (cell ? 1 : 0), 0),
    0,
  );

export const shuffle = <T>(input: T[], random: () => number): T[] => {
  const array = [...input];
  for (let i = array.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export const getRandomInt = (min: number, max: number, random: () => number): number => {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(random() * (high - low + 1)) + low;
};

export const getNextEmptyCell = (
  board: MiniSudokuGrid,
  startIndex = 0,
): CellCoordinate | null => {
  for (let index = startIndex; index < TOTAL_CELLS; index += 1) {
    const row = Math.floor(index / BOARD_SIZE);
    const col = index % BOARD_SIZE;
    if (board[row][col] === null) {
      return { row, col };
    }
  }
  return null;
};

export const getCandidateDigits = (
  board: MiniSudokuGrid,
  row: number,
  col: number,
): Digit[] => {
  if (board[row][col] !== null) {
    return [];
  }

  const used = new Set<number>();
  getRowValues(board, row).forEach((value) => value && used.add(value));
  getColumnValues(board, col).forEach((value) => value && used.add(value));
  getRegionValues(board, row, col).forEach((value) => value && used.add(value));

  return DIGITS.filter((digit) => !used.has(digit));
};

export const detectConflicts = (board: MiniSudokuGrid): Record<string, boolean> => {
  const conflicts: Record<string, boolean> = {};

  const markConflicts = (coordinates: CellCoordinate[]) => {
    if (coordinates.length <= 1) return;
    coordinates.forEach(({ row, col }) => {
      conflicts[`${row}-${col}`] = true;
    });
  };

  // Rows
  for (let row = 0; row < BOARD_SIZE; row += 1) {
    const buckets: Record<number, CellCoordinate[]> = {};
    for (let col = 0; col < BOARD_SIZE; col += 1) {
      const value = board[row][col];
      if (value == null) continue;
      buckets[value] = buckets[value] ?? [];
      buckets[value].push({ row, col });
    }
    Object.values(buckets).forEach(markConflicts);
  }

  // Columns
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    const buckets: Record<number, CellCoordinate[]> = {};
    for (let row = 0; row < BOARD_SIZE; row += 1) {
      const value = board[row][col];
      if (value == null) continue;
      buckets[value] = buckets[value] ?? [];
      buckets[value].push({ row, col });
    }
    Object.values(buckets).forEach(markConflicts);
  }

  // Regions
  for (let startRow = 0; startRow < BOARD_SIZE; startRow += REGION_HEIGHT) {
    for (let startCol = 0; startCol < BOARD_SIZE; startCol += REGION_WIDTH) {
      const buckets: Record<number, CellCoordinate[]> = {};
      for (let r = 0; r < REGION_HEIGHT; r += 1) {
        for (let c = 0; c < REGION_WIDTH; c += 1) {
          const row = startRow + r;
          const col = startCol + c;
          const value = board[row][col];
          if (value == null) continue;
          buckets[value] = buckets[value] ?? [];
          buckets[value].push({ row, col });
        }
      }
      Object.values(buckets).forEach(markConflicts);
    }
  }

  return conflicts;
};
