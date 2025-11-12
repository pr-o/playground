import {
  ALL_DIFFICULTIES,
  BOARD_SIZE,
  DEFAULT_DIFFICULTY,
  DIFFICULTY_CONFIGS,
  DIGITS,
  TOTAL_CELLS,
} from './constants';
import {
  cloneBoard,
  countFilledCells,
  createEmptyBoard,
  getNextEmptyCell,
  getRandomInt,
  isPlacementValid,
  shuffle,
} from './helpers';
import type {
  Difficulty,
  GeneratedPuzzle,
  MiniSudokuGrid,
  PuzzleGeneratorOptions,
} from './types';

type RandomSource = () => number;

const DEFAULT_RANDOM: RandomSource = () => Math.random();

const puzzleCache = new Map<Difficulty, GeneratedPuzzle>();

export const createSeededRandom = (seed: number): RandomSource => {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const buildSolvedBoard = (random: RandomSource): MiniSudokuGrid => {
  const board = createEmptyBoard();
  const cellOrder = shuffle(
    Array.from({ length: TOTAL_CELLS }, (_, index) => index),
    random,
  );

  const fillCell = (orderIndex: number): boolean => {
    if (orderIndex >= cellOrder.length) {
      return true;
    }

    const cell = cellOrder[orderIndex];
    const row = Math.floor(cell / BOARD_SIZE);
    const col = cell % BOARD_SIZE;

    if (board[row][col] !== null) {
      return fillCell(orderIndex + 1);
    }

    const digits = shuffle(DIGITS, random);

    for (const digit of digits) {
      if (!isPlacementValid(board, row, col, digit)) {
        continue;
      }

      board[row][col] = digit;
      if (fillCell(orderIndex + 1)) {
        return true;
      }
    }

    board[row][col] = null;
    return false;
  };

  const success = fillCell(0);
  if (!success) {
    throw new Error('Failed to generate solved Mini Sudoku board.');
  }

  return board;
};

const countSolutions = (
  board: MiniSudokuGrid,
  random: RandomSource,
  limit = 2,
): number => {
  let solutions = 0;
  const workBoard = cloneBoard(board);

  const backtrack = (startIndex = 0) => {
    if (solutions >= limit) return;
    const empty = getNextEmptyCell(workBoard, startIndex);
    if (!empty) {
      solutions += 1;
      return;
    }

    const { row, col } = empty;
    const digits = shuffle(DIGITS, random);

    for (const digit of digits) {
      if (solutions >= limit) return;
      if (!isPlacementValid(workBoard, row, col, digit)) {
        continue;
      }
      workBoard[row][col] = digit;
      backtrack(row * BOARD_SIZE + col + 1);
      workBoard[row][col] = null;
    }
  };

  backtrack(0);
  return solutions;
};

const ensureUniqueSolution = (board: MiniSudokuGrid, random: RandomSource): boolean =>
  countSolutions(board, random, 2) === 1;

const removeCellsForDifficulty = (
  solved: MiniSudokuGrid,
  targetGivens: number,
  random: RandomSource,
): MiniSudokuGrid => {
  const puzzle = cloneBoard(solved);
  const cells = shuffle(
    Array.from({ length: TOTAL_CELLS }, (_, index) => index),
    random,
  );

  let givens = TOTAL_CELLS;

  for (const cellIndex of cells) {
    if (givens <= targetGivens) {
      break;
    }

    const row = Math.floor(cellIndex / BOARD_SIZE);
    const col = cellIndex % BOARD_SIZE;
    if (puzzle[row][col] === null) continue;

    const backup = puzzle[row][col];
    puzzle[row][col] = null;

    if (ensureUniqueSolution(puzzle, random)) {
      givens -= 1;
    } else {
      puzzle[row][col] = backup;
    }
  }

  return puzzle;
};

const cloneGeneratedPuzzle = (puzzle: GeneratedPuzzle): GeneratedPuzzle => ({
  ...puzzle,
  puzzle: cloneBoard(puzzle.puzzle),
  solution: cloneBoard(puzzle.solution),
});

export const generateMiniSudokuPuzzle = (
  difficulty: Difficulty = DEFAULT_DIFFICULTY,
  options: PuzzleGeneratorOptions = {},
): GeneratedPuzzle => {
  const { random = DEFAULT_RANDOM, forceNew = false } = options;
  if (!forceNew) {
    const cached = puzzleCache.get(difficulty);
    if (cached) {
      return cloneGeneratedPuzzle(cached);
    }
  }

  const config = DIFFICULTY_CONFIGS[difficulty];
  const solved = buildSolvedBoard(random);
  const targetGivens = getRandomInt(config.minGivens, config.maxGivens, random);
  const puzzle = removeCellsForDifficulty(solved, targetGivens, random);

  const generated: GeneratedPuzzle = {
    puzzle,
    solution: cloneBoard(solved),
    givens: countFilledCells(puzzle),
    difficulty,
    seed: Date.now(),
  };

  puzzleCache.set(difficulty, cloneGeneratedPuzzle(generated));
  return cloneGeneratedPuzzle(generated);
};

export const primePuzzleCache = (difficulties: Difficulty[] = ALL_DIFFICULTIES) => {
  difficulties.forEach((difficulty) => {
    if (!puzzleCache.has(difficulty)) {
      puzzleCache.set(
        difficulty,
        generateMiniSudokuPuzzle(difficulty, { forceNew: true }),
      );
    }
  });
};

export const clearPuzzleCache = () => {
  puzzleCache.clear();
};

export const generateDeterministicPuzzle = (
  difficulty: Difficulty,
  seed: number,
): GeneratedPuzzle =>
  generateMiniSudokuPuzzle(difficulty, {
    random: createSeededRandom(seed),
    forceNew: true,
  });
