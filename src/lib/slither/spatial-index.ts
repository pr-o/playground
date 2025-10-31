import { distanceSquared } from './math';
import type {
  SpatialHashCell,
  SpatialHashIndex,
  SpatialOccupant,
  SpatialOccupantKind,
  Vector2,
} from './types';

export type SpatialIndexOptions = {
  cellSize: number;
};

export type SpatialQueryOptions = {
  kinds?: SpatialOccupantKind[];
  excludeIds?: Iterable<string>;
};

export const createSpatialIndex = (options: SpatialIndexOptions): SpatialHashIndex => {
  if (options.cellSize <= 0) {
    throw new Error('Spatial index cell size must be greater than zero.');
  }

  return {
    cellSize: options.cellSize,
    lookup: new Map(),
    occupants: new Map(),
  };
};

export const clearSpatialIndex = (index: SpatialHashIndex) => {
  index.lookup.clear();
  index.occupants.clear();
};

export const insertSpatialOccupant = (
  index: SpatialHashIndex,
  occupant: SpatialOccupant,
) => {
  if (index.occupants.has(occupant.id)) {
    removeSpatialOccupant(index, occupant.id);
  }

  index.occupants.set(occupant.id, { ...occupant });

  const cellKeys = getCellKeys(index, occupant.position, occupant.radius);
  for (const key of cellKeys) {
    getOrCreateCell(index, key).occupantIds.add(occupant.id);
  }
};

export const updateSpatialOccupant = (
  index: SpatialHashIndex,
  occupant: SpatialOccupant,
) => {
  removeSpatialOccupant(index, occupant.id);
  insertSpatialOccupant(index, occupant);
};

export const removeSpatialOccupant = (index: SpatialHashIndex, occupantId: string) => {
  const existing = index.occupants.get(occupantId);
  if (!existing) return;

  const cellKeys = getCellKeys(index, existing.position, existing.radius);
  for (const key of cellKeys) {
    const cell = index.lookup.get(key);
    if (!cell) continue;
    cell.occupantIds.delete(occupantId);
    if (cell.occupantIds.size === 0) {
      index.lookup.delete(key);
    }
  }

  index.occupants.delete(occupantId);
};

export const querySpatialIndex = (
  index: SpatialHashIndex,
  position: Vector2,
  radius: number,
  options: SpatialQueryOptions = {},
): SpatialOccupant[] => {
  const cellKeys = getCellKeys(index, position, radius);
  const kinds = options.kinds ? new Set(options.kinds) : null;
  const exclude = options.excludeIds ? new Set(options.excludeIds) : null;
  const results: SpatialOccupant[] = [];
  const seen = new Set<string>();

  const combinedRadius = (queryRadius: number, occupantRadius: number) =>
    (queryRadius + occupantRadius) * (queryRadius + occupantRadius);

  for (const key of cellKeys) {
    const cell = index.lookup.get(key);
    if (!cell) continue;

    for (const occupantId of cell.occupantIds) {
      if (seen.has(occupantId)) continue;
      if (exclude?.has(occupantId)) continue;

      const occupant = index.occupants.get(occupantId);
      if (!occupant) continue;

      if (kinds && !kinds.has(occupant.kind)) {
        seen.add(occupantId);
        continue;
      }

      const maxDistanceSq = combinedRadius(radius, occupant.radius);
      if (distanceSquared(position, occupant.position) <= maxDistanceSq) {
        results.push(occupant);
      }

      seen.add(occupantId);
    }
  }

  return results;
};

export const forEachSpatialOccupant = (
  index: SpatialHashIndex,
  callback: (occupant: SpatialOccupant) => void,
) => {
  index.occupants.forEach((occupant) => callback(occupant));
};

const getCellKeys = (
  index: SpatialHashIndex,
  position: Vector2,
  radius: number,
): string[] => {
  const { minX, maxX, minY, maxY } = getCellBounds(index, position, radius);
  const keys: string[] = [];

  for (let ix = minX; ix <= maxX; ix += 1) {
    for (let iy = minY; iy <= maxY; iy += 1) {
      keys.push(makeCellKey(ix, iy));
    }
  }

  return keys;
};

const getCellBounds = (index: SpatialHashIndex, position: Vector2, radius: number) => {
  const size = index.cellSize;

  const minX = Math.floor((position.x - radius) / size);
  const maxX = Math.floor((position.x + radius) / size);
  const minY = Math.floor((position.y - radius) / size);
  const maxY = Math.floor((position.y + radius) / size);

  return { minX, maxX, minY, maxY };
};

const getOrCreateCell = (index: SpatialHashIndex, key: string): SpatialHashCell => {
  let cell = index.lookup.get(key);
  if (!cell) {
    cell = { key, occupantIds: new Set() };
    index.lookup.set(key, cell);
  }
  return cell;
};

const makeCellKey = (ix: number, iy: number): string => `${ix}:${iy}`;
