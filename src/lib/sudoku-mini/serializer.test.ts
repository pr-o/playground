import { Difficulty, type MiniSudokuBoard } from './types';
import {
  deserializeBoard,
  deserializePuzzleState,
  gridToBoard,
  serializeBoard,
  serializePuzzleState,
} from './serializer';

const sampleBoard: MiniSudokuBoard = Array.from({ length: 2 }, () =>
  Array.from({ length: 2 }, () => ({
    value: null,
    notes: [],
    given: false,
    wasHint: false,
  })),
);

sampleBoard[0][0].value = 1;
sampleBoard[0][0].given = true;
sampleBoard[1][1].notes = [2, 3];

describe('serializer', () => {
  it('serializes and deserializes boards losslessly', () => {
    const serialized = serializeBoard(sampleBoard);
    const roundTrip = deserializeBoard(serialized);
    expect(roundTrip).toEqual(sampleBoard);
  });

  it('serializes puzzle state with metadata', () => {
    const payload = {
      puzzleId: 42,
      difficulty: Difficulty.Intermediate,
      board: sampleBoard,
      notesMode: true,
      hintsUsed: 2,
      mistakeCount: 1,
      status: 'playing' as const,
      lastHint: { row: 0, col: 1 },
    };
    const serialized = serializePuzzleState(payload);
    expect(serialized.version).toBeGreaterThan(0);
    const restored = deserializePuzzleState(serialized, payload);
    expect(restored).toEqual(payload);
  });

  it('falls back to defaults when payload is invalid', () => {
    const defaults = {
      puzzleId: 1,
      difficulty: Difficulty.Beginner,
      board: sampleBoard,
      notesMode: false,
      hintsUsed: 0,
      mistakeCount: 0,
      status: 'playing' as const,
      lastHint: null,
    };
    const restored = deserializePuzzleState('invalid', defaults);
    expect(restored).toEqual(defaults);
  });

  it('transforms numeric grids into board cells with givens mask', () => {
    const board = gridToBoard(
      [
        [1, null],
        [null, 2],
      ],
      [
        [true, false],
        [false, true],
      ],
    );
    expect(board[0][0].given).toBe(true);
    expect(board[0][1].given).toBe(false);
    expect(board[0][0].value).toBe(1);
    expect(board[1][1].value).toBe(2);
  });
});
