export const BEJEWELED_ASSET_BASE_PATH = '/assets/games/bejeweled';

export const BEJEWELED_CONFIG = {
  rows: 8,
  cols: 8,
  tileSize: 64,
  boardPadding: 16,
  swapDuration: 0.25,
  fallDuration: 0.35,
  minimumMatch: 3,
  textures: {
    background: `${BEJEWELED_ASSET_BASE_PATH}/bg.png`,
    field: `${BEJEWELED_ASSET_BASE_PATH}/field.png`,
    fieldSelected: `${BEJEWELED_ASSET_BASE_PATH}/field-selected.png`,
  },
  tileTypes: [
    { id: 'red', texture: `${BEJEWELED_ASSET_BASE_PATH}/red.png` },
    { id: 'blue', texture: `${BEJEWELED_ASSET_BASE_PATH}/blue.png` },
    { id: 'green', texture: `${BEJEWELED_ASSET_BASE_PATH}/green.png` },
    { id: 'yellow', texture: `${BEJEWELED_ASSET_BASE_PATH}/yellow.png` },
    { id: 'orange', texture: `${BEJEWELED_ASSET_BASE_PATH}/orange.png` },
    { id: 'pink', texture: `${BEJEWELED_ASSET_BASE_PATH}/pink.png` },
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

export type BejeweledTileId = (typeof BEJEWELED_CONFIG.tileTypes)[number]['id'];

export type BejeweledRuleOffset = {
  col: number;
  row: number;
};
