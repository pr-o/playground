import { create } from 'zustand';
import {
  DEFAULT_GAME_METRICS,
  WINNING_VALUE,
  applyMove,
  canMove,
  cloneGrid,
  createEmptyGrid,
  createInitialAchievements,
  evaluateAchievements,
  getMaxTileValue,
  hasReachedWinningTile,
  isGameOver,
  mergeAchievementsWithDefinitions,
  seedInitialTiles,
  spawnRandomTile,
} from '@/lib/game-2048';
import type {
  GameMetrics,
  GameSnapshot,
  GameState,
  Grid,
  MoveDirection,
} from '@/lib/game-2048';

const MAX_HISTORY_LENGTH = 16;

type TileView = {
  id: string;
  value: number;
  row: number;
  column: number;
  mergedFrom?: [string, string] | null;
};

type OverlayState = {
  hasWon: boolean;
  isOver: boolean;
  canContinue: boolean;
};

type Game2048DerivedState = {
  hasMoves: boolean;
  isHydrated: boolean;
};

type Game2048Selectors = {
  tiles: () => TileView[];
  canUndo: () => boolean;
  overlayState: () => OverlayState;
};

type Game2048Actions = {
  newGame: (options?: { seed?: number }) => void;
  move: (direction: MoveDirection) => void;
  undo: () => boolean;
  resetAchievements: () => void;
  hydrate: (snapshot: Partial<GameState> | null) => void;
};

export type Game2048Store = GameState &
  Game2048DerivedState &
  Game2048Selectors &
  Game2048Actions;

const createBaselineState = (): GameState => ({
  grid: createEmptyGrid(),
  score: 0,
  bestScore: 0,
  hasWon: false,
  isOver: false,
  moveCount: 0,
  metrics: { ...DEFAULT_GAME_METRICS },
  achievements: createInitialAchievements(),
  history: [],
  maxTile: 0,
  rngSeed: undefined,
});

const createSnapshot = (state: GameState): GameSnapshot => ({
  grid: cloneGrid(state.grid),
  score: state.score,
  moveCount: state.moveCount,
  maxTile: state.maxTile,
  timestamp: Date.now(),
});

const pushHistory = (history: GameSnapshot[], snapshot: GameSnapshot) => {
  const next = [...history, snapshot];
  if (next.length > MAX_HISTORY_LENGTH) {
    next.shift();
  }
  return next;
};

const extractTiles = (grid: Grid): TileView[] => {
  const tiles: TileView[] = [];
  grid.forEach((row, rowIndex) => {
    row.forEach((cell, columnIndex) => {
      if (!cell) return;
      tiles.push({
        id: cell.id,
        value: cell.value,
        row: rowIndex,
        column: columnIndex,
        mergedFrom: cell.mergedFrom ?? null,
      });
    });
  });
  return tiles;
};

const mergeState = (incoming?: Partial<GameState> | null): GameState => {
  const baseline = createBaselineState();
  if (!incoming) {
    return baseline;
  }

  const mergedGrid = incoming.grid ? cloneGrid(incoming.grid) : baseline.grid;
  const mergedMetrics = incoming.metrics
    ? { ...baseline.metrics, ...incoming.metrics }
    : baseline.metrics;
  const mergedHistory = Array.isArray(incoming.history)
    ? incoming.history.map((snapshot) => ({
        ...snapshot,
        grid: cloneGrid(snapshot.grid),
      }))
    : baseline.history;
  const mergedAchievements = evaluateAchievements(
    mergeAchievementsWithDefinitions(incoming.achievements),
    mergedMetrics,
  );

  return {
    ...baseline,
    grid: mergedGrid,
    metrics: mergedMetrics,
    achievements: mergedAchievements,
    history: mergedHistory,
    maxTile: incoming.maxTile ?? baseline.maxTile,
    score: incoming.score ?? baseline.score,
    bestScore: incoming.bestScore ?? baseline.bestScore,
    hasWon: incoming.hasWon ?? baseline.hasWon,
    isOver: incoming.isOver ?? baseline.isOver,
    moveCount: incoming.moveCount ?? baseline.moveCount,
    rngSeed: incoming.rngSeed ?? baseline.rngSeed,
  };
};

export const useGame2048Store = create<Game2048Store>((set, get) => ({
  ...createBaselineState(),
  hasMoves: true,
  isHydrated: false,

  tiles: () => extractTiles(get().grid),
  canUndo: () => get().history.length > 0,
  overlayState: () => {
    const state = get();
    return {
      hasWon: state.hasWon,
      isOver: state.isOver,
      canContinue: state.hasWon && !state.isOver,
    };
  },

  newGame: (options) => {
    const previous = get();
    const rngSeed = options?.seed ?? Date.now();
    const { grid: seededGrid, tiles } = seedInitialTiles(createEmptyGrid());
    const spawnedFours = tiles.filter((tile) => tile.value === 4).length;
    const maxTile = getMaxTileValue(seededGrid);
    const hasMoves = canMove(seededGrid);
    const nextMetrics: GameMetrics = {
      totalMoves: previous.metrics.totalMoves,
      totalFours: previous.metrics.totalFours + spawnedFours,
      gamesStarted: previous.metrics.gamesStarted + 1,
      maxTile: Math.max(previous.metrics.maxTile, maxTile),
    };
    const nextAchievements = evaluateAchievements(previous.achievements, nextMetrics);

    set(() => ({
      ...previous,
      grid: seededGrid,
      score: 0,
      hasWon: false,
      isOver: false,
      moveCount: 0,
      history: [],
      maxTile,
      metrics: nextMetrics,
      achievements: nextAchievements,
      hasMoves,
      rngSeed,
    }));
  },

  move: (direction) => {
    const current = get();
    if (current.isOver) {
      return;
    }

    const moveResult = applyMove(current.grid, direction);
    if (!moveResult.moved) {
      return;
    }

    const snapshot = createSnapshot(current);
    const { grid: gridWithSpawn, tile: spawnedTile } = spawnRandomTile(moveResult.grid);

    const score = current.score + moveResult.scoreGained;
    const bestScore = Math.max(current.bestScore, score);
    const moveCount = current.moveCount + 1;
    const maxTile = Math.max(current.maxTile, getMaxTileValue(gridWithSpawn));
    const hasWon = current.hasWon || hasReachedWinningTile(gridWithSpawn);
    const hasMoves = !isGameOver(gridWithSpawn);
    const nextMetrics: GameMetrics = {
      totalMoves: current.metrics.totalMoves + 1,
      totalFours: current.metrics.totalFours + (spawnedTile?.value === 4 ? 1 : 0),
      gamesStarted: current.metrics.gamesStarted,
      maxTile: Math.max(current.metrics.maxTile, maxTile),
    };
    const nextAchievements = evaluateAchievements(current.achievements, nextMetrics);

    set(() => ({
      ...current,
      grid: gridWithSpawn,
      score,
      bestScore,
      moveCount,
      hasWon,
      isOver: !hasMoves,
      maxTile,
      metrics: nextMetrics,
      achievements: nextAchievements,
      history: pushHistory(current.history, snapshot),
      hasMoves,
    }));
  },

  undo: () => {
    const current = get();
    if (!current.history.length) {
      return false;
    }

    const previousSnapshot = current.history[current.history.length - 1];
    const nextHistory = current.history.slice(0, -1);
    const restoredGrid = cloneGrid(previousSnapshot.grid);
    const hasMoves = !isGameOver(restoredGrid);
    const maxTile = Math.max(previousSnapshot.maxTile, getMaxTileValue(restoredGrid));

    set(() => ({
      ...current,
      grid: restoredGrid,
      score: previousSnapshot.score,
      moveCount: previousSnapshot.moveCount,
      history: nextHistory,
      hasWon: maxTile >= WINNING_VALUE,
      isOver: false,
      maxTile,
      hasMoves,
    }));

    return true;
  },

  resetAchievements: () => {
    set((state) => {
      const metrics = { ...DEFAULT_GAME_METRICS };
      return {
        ...state,
        metrics,
        achievements: createInitialAchievements(),
      };
    });
  },

  hydrate: (snapshot) => {
    const merged = mergeState(snapshot);
    const hasMoves = !isGameOver(merged.grid);
    set(() => ({
      ...merged,
      hasMoves,
      isHydrated: true,
    }));
  },
}));

export type { TileView, OverlayState };
