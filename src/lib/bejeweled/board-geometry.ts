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
    width:
      BEJEWELED_CONFIG.cols * BEJEWELED_CONFIG.tileSize +
      (BEJEWELED_CONFIG.cols - 1) * BEJEWELED_CONFIG.tileSpacing,
    height:
      BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.tileSize +
      (BEJEWELED_CONFIG.rows - 1) * BEJEWELED_CONFIG.tileSpacing,
  };
}

export function boardToWorld(point: BoardPoint): WorldPoint {
  const strideX = BEJEWELED_CONFIG.tileSize + BEJEWELED_CONFIG.tileSpacing;
  const strideY = BEJEWELED_CONFIG.tileSize + BEJEWELED_CONFIG.tileSpacing;
  return {
    x: point.col * strideX + BEJEWELED_CONFIG.tileSize / 2,
    y: point.row * strideY + BEJEWELED_CONFIG.tileSize / 2,
  };
}

export function worldToBoard(point: WorldPoint): BoardPoint {
  const strideX = BEJEWELED_CONFIG.tileSize + BEJEWELED_CONFIG.tileSpacing;
  const strideY = BEJEWELED_CONFIG.tileSize + BEJEWELED_CONFIG.tileSpacing;
  const col = Math.min(
    BEJEWELED_CONFIG.cols - 1,
    Math.max(0, Math.floor(point.x / strideX)),
  );
  const row = Math.min(
    BEJEWELED_CONFIG.rows - 1,
    Math.max(0, Math.floor(point.y / strideY)),
  );

  return { row, col };
}

export function clampToBoard(point: BoardPoint): BoardPoint {
  const row = Math.min(BEJEWELED_CONFIG.rows - 1, Math.max(0, Math.round(point.row)));
  const col = Math.min(BEJEWELED_CONFIG.cols - 1, Math.max(0, Math.round(point.col)));

  return { row, col };
}
