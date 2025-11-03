import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  canPlaceShape,
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
});
