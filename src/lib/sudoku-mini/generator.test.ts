import { BOARD_SIZE, DIFFICULTY_CONFIGS } from './constants';
import { createSeededRandom, generateMiniSudokuPuzzle } from './generator';
import type { Difficulty, MiniSudokuGrid } from './types';

const DIGIT_LIST = Array.from({ length: BOARD_SIZE }, (_, index) => index + 1);

const expectPermutation = (values: Array<number | null>) => {
  values.forEach((value) => {
    expect(typeof value === 'number').toBeTruthy();
  });
  const sorted = (values as number[]).slice().sort((a, b) => a - b);
  expect(sorted).toEqual(DIGIT_LIST);
};

const expectValidSolvedBoard = (board: MiniSudokuGrid) => {
  // Validate rows
  board.forEach((row) => {
    expectPermutation(row);
  });

  // Validate columns
  for (let col = 0; col < BOARD_SIZE; col += 1) {
    const columnValues = board.map((row) => row[col]);
    expectPermutation(columnValues);
  }

  // Validate regions
  for (let regionRow = 0; regionRow < BOARD_SIZE; regionRow += 2) {
    for (let regionCol = 0; regionCol < BOARD_SIZE; regionCol += 3) {
      const regionValues: number[] = [];
      for (let r = 0; r < 2; r += 1) {
        for (let c = 0; c < 3; c += 1) {
          regionValues.push(board[regionRow + r][regionCol + c]!);
        }
      }
      expectPermutation(regionValues);
    }
  }
};

describe('generateMiniSudokuPuzzle', () => {
  const getRandom = (seed: number) => createSeededRandom(seed);
  const difficultyCases = Object.keys(DIFFICULTY_CONFIGS) as Difficulty[];

  it.each(difficultyCases)(
    'produces valid puzzle for %s difficulty',
    (difficulty) => {
      const seed = 100 + difficultyCases.indexOf(difficulty) * 7;
      const random = getRandom(seed);
      const { puzzle, solution, givens } = generateMiniSudokuPuzzle(difficulty, {
        random,
        forceNew: true,
      });
      const config = DIFFICULTY_CONFIGS[difficulty];

      expect(givens).toBeGreaterThanOrEqual(config.minGivens);
      expect(givens).toBeLessThanOrEqual(config.maxGivens);

      expectValidSolvedBoard(solution);

      let countedGivens = 0;
      puzzle.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell !== null) {
            countedGivens += 1;
            expect(cell).toBe(solution[rowIndex][colIndex]);
          }
        });
      });
      expect(countedGivens).toBe(givens);
    },
    60000,
  );

  it('returns deep clones when serving cached puzzles', () => {
    const base = generateMiniSudokuPuzzle('beginner', {
      random: getRandom(99),
      forceNew: true,
    });
    const cached = generateMiniSudokuPuzzle('beginner');
    expect(cached).not.toBe(base);
    expect(cached.puzzle).not.toBe(base.puzzle);
    expect(cached.solution).not.toBe(base.solution);

    // Mutate cached puzzle to prove cache integrity.
    cached.puzzle[0][0] = cached.puzzle[0][0] === null ? 1 : null;
    const nextCached = generateMiniSudokuPuzzle('beginner');
    expect(nextCached.puzzle[0][0]).toBe(base.puzzle[0][0]);
  });
});
