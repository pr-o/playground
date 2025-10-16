import {
  BOARD_SIZE,
  INITIAL_TILE_COUNT,
  SPAWN_PROBABILITY,
  WINNING_VALUE,
} from './constants';
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

const VECTORS: Record<MoveDirection, [number, number]> = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

const withinBounds = (row: number, column: number) =>
  row >= 0 && row < BOARD_SIZE && column >= 0 && column < BOARD_SIZE;

const buildTraversals = (direction: MoveDirection) => {
  const vector = VECTORS[direction];
  const rows = Array.from({ length: BOARD_SIZE }, (_, index) => index);
  const columns = Array.from({ length: BOARD_SIZE }, (_, index) => index);

  if (vector[0] === 1) {
    rows.reverse();
  }
  if (vector[1] === 1) {
    columns.reverse();
  }

  return { rows, columns, vector };
};

export const applyMove = (grid: Grid, direction: MoveDirection): MoveOperationResult => {
  const { rows, columns, vector } = buildTraversals(direction);
  const [deltaRow, deltaColumn] = vector;
  const nextGrid = createEmptyGrid();

  let moved = false;
  let scoreGained = 0;
  let maxTile = 0;

  const recordMax = (value: number) => {
    if (value > maxTile) {
      maxTile = value;
    }
  };

  for (const rowIndex of rows) {
    for (const columnIndex of columns) {
      const cell = grid[rowIndex]?.[columnIndex];
      if (!cell) continue;

      let targetRow = rowIndex;
      let targetColumn = columnIndex;

      let nextRow = targetRow + deltaRow;
      let nextColumn = targetColumn + deltaColumn;

      while (
        withinBounds(nextRow, nextColumn) &&
        nextGrid[nextRow]?.[nextColumn] === null
      ) {
        targetRow = nextRow;
        targetColumn = nextColumn;
        nextRow += deltaRow;
        nextColumn += deltaColumn;
      }

      if (
        withinBounds(nextRow, nextColumn) &&
        nextGrid[nextRow]?.[nextColumn] &&
        nextGrid[nextRow]?.[nextColumn]?.value === cell.value &&
        nextGrid[nextRow]?.[nextColumn]?.mergedFrom === null
      ) {
        const base = nextGrid[nextRow][nextColumn] as Cell;
        const mergedValue = base.value + cell.value;
        const mergedCell: Cell = {
          id: createTileId(),
          value: mergedValue,
          mergedFrom: [base.id, cell.id],
        };

        nextGrid[nextRow][nextColumn] = mergedCell;
        scoreGained += mergedValue;
        recordMax(mergedValue);
        moved = true;
      } else {
        const destinationCell: Cell = {
          id: cell.id,
          value: cell.value,
          mergedFrom: null,
        };

        nextGrid[targetRow][targetColumn] = destinationCell;
        recordMax(destinationCell.value);
        if (targetRow !== rowIndex || targetColumn !== columnIndex) {
          moved = true;
        }
      }
    }
  }

  if (!moved) {
    return {
      grid: cloneGrid(grid),
      moved: false,
      scoreGained: 0,
      maxTile: getMaxTileValue(grid),
    };
  }

  return {
    grid: nextGrid,
    moved: true,
    scoreGained,
    maxTile: maxTile || getMaxTileValue(nextGrid),
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

export const hasTileWithValue = (grid: Grid, target: number): boolean =>
  grid.some((row) => row.some((cell) => cell?.value === target));

export const hasReachedWinningTile = (grid: Grid, winningValue = WINNING_VALUE) =>
  grid.some((row) => row.some((cell) => (cell?.value ?? 0) >= winningValue));

export const isGameOver = (grid: Grid): boolean => !canMove(grid);
