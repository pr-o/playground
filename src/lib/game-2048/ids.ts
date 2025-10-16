let counter = 0;

/**
 * Generates stable tile IDs that remain unique within a session.
 */
export const createTileId = () => {
  counter += 1;
  const prefix = Date.now().toString(36);
  return `tile-${prefix}-${counter.toString(36)}`;
};

export const resetTileIdCounter = () => {
  counter = 0;
};
