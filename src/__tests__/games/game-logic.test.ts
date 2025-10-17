import {
  applyMove,
  canMove,
  createEmptyGrid,
  spawnRandomTile,
} from '@/lib/game-2048/logic';
import { resetTileIdCounter } from '@/lib/game-2048/ids';
import type { Cell, Grid } from '@/lib/game-2048/types';

const makeTile = (id: string, value: number): Cell => ({
  id,
  value,
  mergedFrom: null,
});

describe('game logic helpers', () => {
  beforeEach(() => {
    resetTileIdCounter();
  });

  it('merges identical tiles once per move direction', () => {
    const grid: Grid = createEmptyGrid();
    grid[0][0] = makeTile('a', 2);
    grid[0][1] = makeTile('b', 2);
    grid[0][2] = makeTile('c', 4);
    grid[0][3] = makeTile('d', 4);

    const result = applyMove(grid, 'left');

    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(12);
    expect(result.grid[0][0]?.value).toBe(4);
    expect(result.grid[0][1]?.value).toBe(8);
    expect(result.grid[0][2]).toBeNull();
    expect(result.grid[0][3]).toBeNull();
  });

  it('prevents double merges within a single move', () => {
    const grid: Grid = createEmptyGrid();
    grid[1][0] = makeTile('a', 2);
    grid[1][1] = makeTile('b', 2);
    grid[1][2] = makeTile('c', 2);
    grid[1][3] = makeTile('d', 2);

    const result = applyMove(grid, 'left');
    const row = result.grid[1];

    expect(result.moved).toBe(true);
    expect(row[0]?.value).toBe(4);
    expect(row[1]?.value).toBe(4);
    expect(row[2]).toBeNull();
    expect(row[3]).toBeNull();
  });

  it('spawns deterministic tiles with supplied RNG', () => {
    const grid: Grid = createEmptyGrid();
    const sequence = [0, 0.95];
    let callIndex = 0;
    const rng = () => {
      const value = sequence[callIndex] ?? 0;
      callIndex += 1;
      return value;
    };

    const { grid: nextGrid, tile } = spawnRandomTile(grid, rng);

    expect(tile).not.toBeNull();
    expect(tile?.value).toBe(4);
    expect(nextGrid[0][0]?.value).toBe(4);
  });

  it('detects when no moves remain on a full board', () => {
    const grid: Grid = [
      [makeTile('a', 2), makeTile('b', 4), makeTile('c', 2), makeTile('d', 4)],
      [makeTile('e', 4), makeTile('f', 2), makeTile('g', 4), makeTile('h', 2)],
      [makeTile('i', 2), makeTile('j', 4), makeTile('k', 2), makeTile('l', 4)],
      [makeTile('m', 4), makeTile('n', 2), makeTile('o', 4), makeTile('p', 2)],
    ];

    expect(canMove(grid)).toBe(false);
  });
});
