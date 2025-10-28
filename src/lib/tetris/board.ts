import { BOARD_HEIGHT, BOARD_WIDTH } from './constants';
import type { Board, CellDelta, CellPosition, PieceShape, TetrominoId } from './types';

export function createEmptyBoard({
  height = BOARD_HEIGHT,
  width = BOARD_WIDTH,
}: {
  height?: number;
  width?: number;
} = {}): Board {
  return Array.from({ length: height }, () =>
    Array<TetrominoId | null>(width).fill(null),
  );
}

export const cloneBoard = (board: Board): Board => board.map((row) => [...row]);

export const forEachCell = (
  shape: PieceShape,
  position: CellPosition,
  iteratee: (cell: CellDelta) => void,
) => {
  shape.forEach(({ row, col }) => {
    iteratee({ row: row + position.row, col: col + position.col });
  });
};

const isInsideBounds = (row: number, col: number, board: Board) =>
  row >= 0 && row < board.length && col >= 0 && col < board[0].length;

export const canPlaceShape = (
  board: Board,
  shape: PieceShape,
  position: CellPosition,
): boolean => {
  for (const { row, col } of shape) {
    const targetRow = position.row + row;
    const targetCol = position.col + col;

    if (!isInsideBounds(targetRow, targetCol, board)) {
      return false;
    }

    if (board[targetRow][targetCol] !== null) {
      return false;
    }
  }

  return true;
};

export const lockShapeIntoBoard = (
  board: Board,
  shape: PieceShape,
  position: CellPosition,
  id: TetrominoId,
): Board => {
  const next = cloneBoard(board);

  shape.forEach(({ row, col }) => {
    const targetRow = position.row + row;
    const targetCol = position.col + col;
    if (isInsideBounds(targetRow, targetCol, board)) {
      next[targetRow][targetCol] = id;
    }
  });

  return next;
};

export const getCompletedLineIndexes = (board: Board): number[] => {
  const filled: number[] = [];
  board.forEach((row, index) => {
    if (row.every((cell) => cell !== null)) {
      filled.push(index);
    }
  });
  return filled;
};

export const clearCompletedLines = (board: Board): { board: Board; cleared: number } => {
  const clearedIndexes = getCompletedLineIndexes(board);

  if (clearedIndexes.length === 0) {
    return { board, cleared: 0 };
  }

  const remainingRows = board.filter((_, index) => !clearedIndexes.includes(index));
  const clearedBoard = [
    ...Array.from({ length: clearedIndexes.length }, () =>
      Array(board[0].length).fill(null),
    ),
    ...remainingRows,
  ] as Board;

  return { board: clearedBoard, cleared: clearedIndexes.length };
};
