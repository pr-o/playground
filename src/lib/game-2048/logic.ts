import { BOARD_SIZE, INITIAL_TILE_COUNT, SPAWN_PROBABILITY } from './constants';
import { createTileId } from './ids';
import type { Cell, Grid, MoveDirection } from './types';

export type Rng = () => number;

const defaultRng: Rng = () => Math.random();

export const createEmptyGrid = (): Grid =>
  Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );

export const cloneGrid = (grid: Grid): Grid =>
  grid.map((row) =>
    row.map((cell) => (cell ? { ...cell, mergedFrom: cell.mergedFrom ?? null } : null)),
  );

export const getEmptyPositions = (grid: Grid): Array<[number, number]> => {
  const positions: Array<[number, number]> = [];
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (!cell) {
        positions.push([rowIndex, columnIndex]);
      }
    });
  });
  return positions;
};

const randomTileValue = (rng: Rng) => (rng() < SPAWN_PROBABILITY[2] ? 2 : 4);

const pickRandomPosition = (positions: Array<[number, number]>, rng: Rng) => {
  const index = Math.floor(rng() * positions.length);
  return positions[index] ?? positions[0];
};

export const spawnRandomTile = (
  grid: Grid,
  rng: Rng = defaultRng,
): { grid: Grid; tile: Cell | null } => {
  const emptyPositions = getEmptyPositions(grid);
  if (!emptyPositions.length) {
    return { grid: cloneGrid(grid), tile: null };
  }

  const [row, column] = pickRandomPosition(emptyPositions, rng);
  const value = randomTileValue(rng);

  const nextGrid = cloneGrid(grid);
  const tile: Cell = {
    id: createTileId(),
    value,
    mergedFrom: null,
  };
  nextGrid[row][column] = tile;

  return { grid: nextGrid, tile };
};

export const seedInitialTiles = (
  grid: Grid,
  rng: Rng = defaultRng,
  count: number = INITIAL_TILE_COUNT,
): { grid: Grid; tiles: Cell[] } => {
  let nextGrid = cloneGrid(grid);
  const tiles: Cell[] = [];

  for (let index = 0; index < count; index += 1) {
    const { grid: seededGrid, tile } = spawnRandomTile(nextGrid, rng);
    nextGrid = seededGrid;
    if (tile) {
      tiles.push(tile);
    } else {
      break;
    }
  }

  return { grid: nextGrid, tiles };
};

export const getMaxTileValue = (grid: Grid): number => {
  let max = 0;
  grid.forEach((row) => {
    row.forEach((cell) => {
      if (cell && cell.value > max) {
        max = cell.value;
      }
    });
  });
  return max;
};

export type MoveOperationResult = {
  grid: Grid;
  moved: boolean;
  scoreGained: number;
  maxTile: number;
};

export const applyMove = (grid: Grid, direction: MoveDirection): MoveOperationResult => {
  void direction;
  return {
    grid: cloneGrid(grid),
    moved: false,
    scoreGained: 0,
    maxTile: getMaxTileValue(grid),
  };
};

export const canMove = (grid: Grid): boolean => {
  if (getEmptyPositions(grid).length > 0) {
    return true;
  }

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const cell = grid[row]?.[column];
      if (!cell) continue;

      const right = grid[row]?.[column + 1];
      const down = grid[row + 1]?.[column];

      if ((right && right.value === cell.value) || (down && down.value === cell.value)) {
        return true;
      }
    }
  }

  return false;
};
