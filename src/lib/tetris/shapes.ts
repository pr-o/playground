import type { PieceShape, RotationIndex, TetrominoId } from './types';

type TetrominoDefinition = {
  rotations: readonly PieceShape[];
};

const createShape = (cells: Array<[row: number, col: number]>): PieceShape =>
  cells.map(([row, col]) => ({ row, col }));

const TETROMINO_DEFINITIONS: Record<TetrominoId, TetrominoDefinition> = {
  I: {
    rotations: [
      createShape([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ]),
      createShape([
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ]),
      createShape([
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ]),
      createShape([
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
      ]),
    ],
  },
  O: {
    rotations: [
      createShape([
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ]),
    ],
  },
  T: {
    rotations: [
      createShape([
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 1],
      ]),
      createShape([
        [0, 1],
        [1, 0],
        [1, 1],
        [2, 1],
      ]),
      createShape([
        [0, 1],
        [1, 0],
        [1, 1],
        [1, 2],
      ]),
      createShape([
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 0],
      ]),
    ],
  },
  S: {
    rotations: [
      createShape([
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
      ]),
      createShape([
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ]),
      createShape([
        [0, 1],
        [0, 2],
        [1, 0],
        [1, 1],
      ]),
      createShape([
        [0, 0],
        [1, 0],
        [1, 1],
        [2, 1],
      ]),
    ],
  },
  Z: {
    rotations: [
      createShape([
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ]),
      createShape([
        [0, 1],
        [1, 0],
        [1, 1],
        [2, 0],
      ]),
      createShape([
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 2],
      ]),
      createShape([
        [0, 1],
        [1, 0],
        [1, 1],
        [2, 0],
      ]),
    ],
  },
  J: {
    rotations: [
      createShape([
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 2],
      ]),
      createShape([
        [0, 0],
        [0, 1],
        [1, 0],
        [2, 0],
      ]),
      createShape([
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 2],
      ]),
      createShape([
        [0, 1],
        [1, 1],
        [2, 0],
        [2, 1],
      ]),
    ],
  },
  L: {
    rotations: [
      createShape([
        [0, 2],
        [1, 0],
        [1, 1],
        [1, 2],
      ]),
      createShape([
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
      ]),
      createShape([
        [0, 0],
        [0, 1],
        [0, 2],
        [1, 0],
      ]),
      createShape([
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
      ]),
    ],
  },
};

export function getRotationCount(id: TetrominoId): number {
  return TETROMINO_DEFINITIONS[id].rotations.length;
}

export function getTetrominoShape(id: TetrominoId, rotation: RotationIndex): PieceShape {
  const { rotations } = TETROMINO_DEFINITIONS[id];
  const index = rotation % rotations.length;
  return rotations[index];
}

export const getNextRotation = (
  id: TetrominoId,
  rotation: RotationIndex,
): RotationIndex => ((rotation + 1) % getRotationCount(id)) as RotationIndex;

export const getPreviousRotation = (
  id: TetrominoId,
  rotation: RotationIndex,
): RotationIndex =>
  ((rotation - 1 + getRotationCount(id)) % getRotationCount(id)) as RotationIndex;
