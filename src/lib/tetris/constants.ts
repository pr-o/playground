import type { CellPosition } from './types';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const VISIBLE_ROWS = BOARD_HEIGHT;

export const SPAWN_COLUMN = Math.floor(BOARD_WIDTH / 2) - 2;

export const SPAWN_POSITION: CellPosition = {
  row: 0,
  col: SPAWN_COLUMN,
};
