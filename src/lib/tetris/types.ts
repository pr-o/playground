export const TETROMINO_IDS = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'] as const;

export type TetrominoId = (typeof TETROMINO_IDS)[number];

export type RotationIndex = 0 | 1 | 2 | 3;

export type CellPosition = {
  row: number;
  col: number;
};

export type CellDelta = Readonly<CellPosition>;

export type PieceShape = readonly CellDelta[];

export type BoardCell = TetrominoId | null;

export type Board = BoardCell[][];

export type ActivePiece = {
  id: TetrominoId;
  rotation: RotationIndex;
  position: CellPosition;
  shape: PieceShape;
};
