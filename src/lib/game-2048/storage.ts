import { STORAGE_KEYS } from './constants';
import type { Achievement, GameMetrics, GameSnapshot, GameState, Grid } from './types';

const isBrowser = typeof window !== 'undefined';

type PersistedGameState = {
  grid: Grid;
  score: number;
  moveCount: number;
  maxTile: number;
  hasWon: boolean;
  isOver: boolean;
  history: GameSnapshot[];
  metrics: GameMetrics;
  rngSeed?: number;
  savedAt: number;
};

const safeParse = <T>(raw: string | null): T | null => {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[2048] Failed to parse persisted data', error);
    }
    return null;
  }
};

const safeStringify = (value: unknown) => {
  try {
    return JSON.stringify(value);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[2048] Failed to serialize data for storage', error);
    }
    return null;
  }
};

export const loadPersistedGameState = (): PersistedGameState | null => {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.STATE);
  const parsed = safeParse<PersistedGameState>(raw);
  if (!parsed) return null;
  if (!Array.isArray(parsed.grid) || !Array.isArray(parsed.history)) {
    return null;
  }
  return parsed;
};

export const savePersistedGameState = (state: PersistedGameState | null) => {
  if (!isBrowser) return;
  if (!state) {
    window.localStorage.removeItem(STORAGE_KEYS.STATE);
    return;
  }
  const payload = safeStringify(state);
  if (!payload) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.STATE, payload);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[2048] Failed to write game state to storage', error);
    }
  }
};

export const clearPersistedGameState = () => {
  if (!isBrowser) return;
  window.localStorage.removeItem(STORAGE_KEYS.STATE);
};

export const loadPersistedBestScore = (): number | null => {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.BEST_SCORE);
  const parsed = safeParse<number>(raw);
  return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : null;
};

export const savePersistedBestScore = (bestScore: number) => {
  if (!isBrowser) return;
  const payload = safeStringify(bestScore);
  if (!payload) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.BEST_SCORE, payload);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[2048] Failed to write best score to storage', error);
    }
  }
};

export const loadPersistedAchievements = (): Achievement[] | null => {
  if (!isBrowser) return null;
  const raw = window.localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);
  const parsed = safeParse<Achievement[]>(raw);
  if (!parsed || !Array.isArray(parsed)) {
    return null;
  }
  return parsed;
};

export const savePersistedAchievements = (achievements: Achievement[]) => {
  if (!isBrowser) return;
  const payload = safeStringify(achievements);
  if (!payload) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.ACHIEVEMENTS, payload);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[2048] Failed to write achievements to storage', error);
    }
  }
};

export const createPersistableState = (state: GameState): PersistedGameState => ({
  grid: state.grid,
  score: state.score,
  moveCount: state.moveCount,
  maxTile: state.maxTile,
  hasWon: state.hasWon,
  isOver: state.isOver,
  history: state.history,
  metrics: state.metrics,
  rngSeed: state.rngSeed,
  savedAt: Date.now(),
});

export type { PersistedGameState };
