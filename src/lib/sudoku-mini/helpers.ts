import { BOARD_SIZE, REGION_HEIGHT, REGION_WIDTH, TOTAL_CELLS } from './constants';
import type { CellCoordinate, CellValue, Digit, MiniSudokuBoard } from './types';

export const createEmptyBoard = (): MiniSudokuBoard =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null as CellValue),
  );

export const cloneBoard = (board: MiniSudokuBoard): MiniSudokuBoard =>
  board.map((row) => row.slice());

export const getRegionIndex = (row: number, col: number): number => {
  const regionRow = Math.floor(row / REGION_HEIGHT);
  const regionCol = Math.floor(col / REGION_WIDTH);
  const regionsPerRow = BOARD_SIZE / REGION_WIDTH;
  return regionRow * regionsPerRow + regionCol;
};

export const isPlacementValid = (
  board: MiniSudokuBoard,
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

export const countFilledCells = (board: MiniSudokuBoard): number =>
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
  board: MiniSudokuBoard,
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
