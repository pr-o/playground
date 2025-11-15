import { BOARD_SIZE } from './constants';
import {
  cloneBoard,
  createEmptyBoard,
  getNextEmptyCell,
  getRandomInt,
  getRegionIndex,
  isPlacementValid,
  shuffle,
} from './helpers';

describe('sudoku helpers', () => {
  it('computes region indices correctly', () => {
    expect(getRegionIndex(0, 0)).toBe(0);
    expect(getRegionIndex(0, 4)).toBe(1);
    expect(getRegionIndex(2, 1)).toBe(2);
    expect(getRegionIndex(5, 5)).toBe(5);
  });

  it('validates placements across rows, columns and regions', () => {
    const board = createEmptyBoard();
    board[0][0] = 1;
    expect(isPlacementValid(board, 0, 1, 1)).toBe(false); // row conflict
    expect(isPlacementValid(board, 1, 0, 1)).toBe(false); // column conflict
    expect(isPlacementValid(board, 1, 2, 1)).toBe(false); // region conflict
    expect(isPlacementValid(board, 1, 2, 2)).toBe(true);
  });

  it('finds next empty cell based on start index', () => {
    const board = createEmptyBoard();
    board[0][0] = 1;
    board[0][1] = 2;
    expect(getNextEmptyCell(board)).toEqual({ row: 0, col: 2 });
    expect(getNextEmptyCell(board, BOARD_SIZE)).toEqual({ row: 1, col: 0 });
  });

  it('clones boards without sharing references', () => {
    const board = createEmptyBoard();
    board[0][0] = 3;
    const clone = cloneBoard(board);
    expect(clone).toEqual(board);
    clone[0][0] = 4;
    expect(board[0][0]).toBe(3);
  });

  it('produces deterministic shuffle output when random source is predictable', () => {
    const values = [1, 2, 3, 4];
    const createRandom = () => {
      const sequence = [0.9, 0.2, 0.7, 0.1];
      let callCount = 0;
      return () => sequence[callCount++ % sequence.length];
    };
    const first = shuffle(values, createRandom());
    const second = shuffle(values, createRandom());
    expect(first).toEqual(second);
    expect(values).toEqual([1, 2, 3, 4]); // original remains untouched
  });

  it('returns inclusive random integers', () => {
    const random = () => 0.999;
    expect(getRandomInt(1, 6, random)).toBe(6);
  });
});
