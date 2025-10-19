export const MATCH3_ASSET_BASE_PATH = '/assets/games/bejeweled';

export const MATCH3_CONFIG = {
  rows: 8,
  cols: 8,
  tileSize: 64,
  boardPadding: 16,
  swapDuration: 0.25,
  fallDuration: 0.35,
  textures: {
    background: `${MATCH3_ASSET_BASE_PATH}/bg.png`,
    field: `${MATCH3_ASSET_BASE_PATH}/field.png`,
    fieldSelected: `${MATCH3_ASSET_BASE_PATH}/field-selected.png`,
  },
  tileTypes: [
    { id: 'red', texture: `${MATCH3_ASSET_BASE_PATH}/red.png` },
    { id: 'blue', texture: `${MATCH3_ASSET_BASE_PATH}/blue.png` },
    { id: 'green', texture: `${MATCH3_ASSET_BASE_PATH}/green.png` },
    { id: 'yellow', texture: `${MATCH3_ASSET_BASE_PATH}/yellow.png` },
    { id: 'orange', texture: `${MATCH3_ASSET_BASE_PATH}/orange.png` },
    { id: 'pink', texture: `${MATCH3_ASSET_BASE_PATH}/pink.png` },
  ] as const,
  combinationRules: [
    [
      { col: 1, row: 0 },
      { col: 2, row: 0 },
    ],
    [
      { col: 0, row: 1 },
      { col: 0, row: 2 },
    ],
  ] as const,
} as const;

export type Match3TileId = (typeof MATCH3_CONFIG.tileTypes)[number]['id'];
