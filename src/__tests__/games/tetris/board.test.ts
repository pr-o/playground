import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  canPlaceShape,
  clearCompletedLines,
  createEmptyBoard,
  getTetrominoShape,
  lockShapeIntoBoard,
} from '@/lib/tetris';

describe('board placement helpers', () => {
  it('allows placement when all cells remain in bounds and empty', () => {
    const board = createEmptyBoard();
    const result = canPlaceShape(board, getTetrominoShape('I', 0), { row: 10, col: 3 });
    expect(result).toBe(true);
  });

  it('prevents placement when any cell would exit the board horizontally', () => {
    const board = createEmptyBoard();
    expect(canPlaceShape(board, getTetrominoShape('L', 0), { row: 5, col: -1 })).toBe(
      false,
    );
    expect(
      canPlaceShape(board, getTetrominoShape('J', 0), {
        row: 5,
        col: BOARD_WIDTH - 1,
      }),
    ).toBe(false);
  });

  it('prevents placement when any cell would exit the board vertically', () => {
    const board = createEmptyBoard();
    expect(
      canPlaceShape(board, getTetrominoShape('I', 1), {
        row: BOARD_HEIGHT - 2,
        col: 4,
      }),
    ).toBe(false);
  });

  it('detects collisions with occupied cells', () => {
    const board = lockShapeIntoBoard(
      createEmptyBoard(),
      getTetrominoShape('O', 0),
      { row: 10, col: 4 },
      'O',
    );

    expect(canPlaceShape(board, getTetrominoShape('T', 0), { row: 10, col: 4 })).toBe(
      false,
    );
    expect(canPlaceShape(board, getTetrominoShape('T', 0), { row: 8, col: 4 })).toBe(
      true,
    );
  });

  it('locks shapes into a cloned board without mutating the input', () => {
    const board = createEmptyBoard();
    const shape = getTetrominoShape('T', 0);
    const position = { row: 8, col: 3 };

    const locked = lockShapeIntoBoard(board, shape, position, 'T');

    expect(board).not.toBe(locked);
    shape.forEach(({ row, col }) => {
      expect(board[position.row + row][position.col + col]).toBeNull();
      expect(locked[position.row + row][position.col + col]).toBe('T');
    });
  });

  it('clears completed lines and preserves row order above cleared section', () => {
    const board = createEmptyBoard();

    // Fill bottom two rows completely.
    board[BOARD_HEIGHT - 1] = Array(BOARD_WIDTH).fill('I');
    board[BOARD_HEIGHT - 2] = Array(BOARD_WIDTH).fill('J');

    // Add a partial row above so we can verify it shifts down intact.
    board[BOARD_HEIGHT - 3][0] = 'L';
    board[BOARD_HEIGHT - 3][1] = 'L';

    const { board: clearedBoard, cleared } = clearCompletedLines(board);

    expect(cleared).toBe(2);
    // Cleared rows should be replaced with empty rows at the top.
    expect(clearedBoard[0].every((cell) => cell === null)).toBe(true);
    expect(clearedBoard[1].every((cell) => cell === null)).toBe(true);

    // Former partial row should now sit at the bottom.
    const shiftedRow = clearedBoard[BOARD_HEIGHT - 1];
    expect(shiftedRow[0]).toBe('L');
    expect(shiftedRow[1]).toBe('L');
    expect(shiftedRow.slice(2).every((cell) => cell === null)).toBe(true);
  });
});
