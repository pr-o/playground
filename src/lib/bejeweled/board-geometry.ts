import { BEJEWELED_CONFIG } from './config';

export type BoardPoint = {
  row: number;
  col: number;
};

export type WorldPoint = {
  x: number;
  y: number;
};

export function getBoardDimensions() {
  return {
    width: BEJEWELED_CONFIG.cols * BEJEWELED_CONFIG.tileSize,
    height: BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.tileSize,
  };
}

export function boardToWorld(point: BoardPoint): WorldPoint {
  const { tileSize } = BEJEWELED_CONFIG;
  return {
    x: point.col * tileSize + tileSize / 2,
    y: point.row * tileSize + tileSize / 2,
  };
}

export function worldToBoard(point: WorldPoint): BoardPoint {
  const { tileSize, rows, cols } = BEJEWELED_CONFIG;
  const col = Math.min(cols - 1, Math.max(0, Math.floor(point.x / tileSize)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor(point.y / tileSize)));

  return { row, col };
}

export function clampToBoard(point: BoardPoint): BoardPoint {
  const row = Math.min(BEJEWELED_CONFIG.rows - 1, Math.max(0, Math.round(point.row)));
  const col = Math.min(BEJEWELED_CONFIG.cols - 1, Math.max(0, Math.round(point.col)));

  return { row, col };
}
