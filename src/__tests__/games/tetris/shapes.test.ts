import {
  getNextRotation,
  getPreviousRotation,
  getRotationCount,
  getTetrominoShape,
  TETROMINO_IDS,
  type PieceShape,
  type TetrominoId,
  type RotationIndex,
} from '@/lib/tetris';

const canonicalizeShape = (shape: PieceShape): string =>
  [...shape]
    .sort((a, b) => a.row - b.row || a.col - b.col)
    .map(({ row, col }) => `${row},${col}`)
    .join('|');

const EXPECTED_UNIQUE_ROTATIONS: Record<TetrominoId, number> = {
  I: 2,
  O: 1,
  T: 4,
  S: 2,
  Z: 2,
  J: 4,
  L: 4,
};

describe('tetromino rotation helpers', () => {
  it('returns the expected number of unique shapes and wraps correctly', () => {
    TETROMINO_IDS.forEach((id) => {
      const rotationCount = getRotationCount(id);
      const seen = new Set<string>();
      let rotation: RotationIndex = 0;

      for (let i = 0; i < rotationCount; i += 1) {
        const shapeAtRotation = getTetrominoShape(id, rotation);
        seen.add(canonicalizeShape(shapeAtRotation));
        rotation = getNextRotation(id, rotation);
      }

      const wrapShape = canonicalizeShape(getTetrominoShape(id, rotation));
      const baseShape = canonicalizeShape(getTetrominoShape(id, 0));

      expect(seen.size).toBe(EXPECTED_UNIQUE_ROTATIONS[id]);
      expect(wrapShape).toBe(baseShape);
    });
  });

  it('cycles through rotations using getNextRotation and getPreviousRotation', () => {
    TETROMINO_IDS.forEach((id) => {
      const rotationCount = getRotationCount(id);
      let rotation: RotationIndex = 0;
      const seen = new Set<number>();

      for (let i = 0; i < rotationCount; i += 1) {
        seen.add(rotation);
        const next = getNextRotation(id, rotation);
        expect(next).toBe((rotation + 1) % rotationCount);
        rotation = next;
      }

      expect(rotation).toBe(0);
      expect(seen.size).toBe(rotationCount);

      rotation = 0;
      for (let i = 0; i < rotationCount; i += 1) {
        const prev = getPreviousRotation(id, rotation);
        expect(prev).toBe((rotation - 1 + rotationCount) % rotationCount);
        rotation = prev;
      }
      expect(rotation).toBe(0);
    });
  });

  it('next and previous rotations are inverse operations', () => {
    TETROMINO_IDS.forEach((id) => {
      const rotationCount = getRotationCount(id);
      for (let rotation = 0; rotation < rotationCount; rotation += 1) {
        const index = (rotation % rotationCount) as RotationIndex;
        const next = getNextRotation(id, index);
        const prev = getPreviousRotation(id, index);
        expect(getPreviousRotation(id, next)).toBe(index);
        expect(getNextRotation(id, prev)).toBe(index);
      }
    });
  });
});
