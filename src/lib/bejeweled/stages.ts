import { BEJEWELED_CONFIG } from './config';

export type BejeweledStageKey = 'default' | 'l-shape' | 'l-rotated';

export type BejeweledStageDefinition = {
  key: BejeweledStageKey;
  label: string;
  mask?: boolean[][];
};

const rows = BEJEWELED_CONFIG.rows;
const cols = BEJEWELED_CONFIG.cols;

const L_VERTICAL_WIDTH = Math.min(4, cols);

const createMask = (predicate: (row: number, col: number) => boolean) =>
  Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => predicate(row, col)),
  );

const footHeight = Math.min(3, rows);

const L_SHAPE_MASK = createMask(
  (row, col) => row >= rows - footHeight || col < L_VERTICAL_WIDTH,
);

const L_ROTATED_MASK = createMask(
  (row, col) => row < footHeight || col >= cols - L_VERTICAL_WIDTH,
);

const validateMask = (mask: boolean[][]) => {
  if (mask.length !== BEJEWELED_CONFIG.rows) {
    throw new Error('Stage mask rows do not match configuration');
  }
  mask.forEach((row) => {
    if (row.length !== BEJEWELED_CONFIG.cols) {
      throw new Error('Stage mask columns do not match configuration');
    }
  });
};

[L_SHAPE_MASK, L_ROTATED_MASK].forEach((mask) => validateMask(mask));

export const BEJEWELED_STAGES: Record<BejeweledStageKey, BejeweledStageDefinition> = {
  default: { key: 'default', label: 'Classic Board' },
  'l-shape': { key: 'l-shape', label: 'L-Shape Stage', mask: L_SHAPE_MASK },
  'l-rotated': {
    key: 'l-rotated',
    label: 'Rotated L Stage',
    mask: L_ROTATED_MASK,
  },
};

export const BEJEWELED_STAGE_LIST: BejeweledStageDefinition[] = [
  BEJEWELED_STAGES['l-shape'],
  BEJEWELED_STAGES.default,
  BEJEWELED_STAGES['l-rotated'],
];
