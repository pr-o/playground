import { useEffect } from 'react';
import { useGame2048Store } from '@/store/game-2048';
import {
  createPersistableState,
  loadPersistedAchievements,
  loadPersistedBestScore,
  loadPersistedGameState,
  savePersistedAchievements,
  savePersistedBestScore,
  savePersistedGameState,
} from '@/lib/game-2048/storage';

const isBrowser = typeof window !== 'undefined';

const createDebounce = <Args extends unknown[]>(
  callback: (...args: Args) => void,
  delayMs: number,
) => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  const debounced = (...args: Args) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      timeout = null;
      callback(...args);
    }, delayMs);
  };
  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  return debounced;
};

export function useGamePersistence() {
  const hydrate = useGame2048Store((state) => state.hydrate);

  useEffect(() => {
    if (!isBrowser) return;
    const state = useGame2048Store.getState();
    if (state.isHydrated) return;

    const persistedState = loadPersistedGameState();
    const persistedBestScore = loadPersistedBestScore();
    const persistedAchievements = loadPersistedAchievements();

    const snapshot = {
      ...(persistedState ?? {}),
      bestScore: persistedBestScore ?? state.bestScore,
      achievements: persistedAchievements ?? state.achievements,
    };

    hydrate(snapshot);
  }, [hydrate]);

  useEffect(() => {
    if (!isBrowser) return;
    const saveState = createDebounce(
      (state: ReturnType<typeof useGame2048Store.getState>) => {
        savePersistedGameState(createPersistableState(state));
      },
      200,
    );

    const unsubscribe = useGame2048Store.subscribe((state, previous) => {
      if (!state.isHydrated) {
        return;
      }

      const stateChanged =
        state.grid !== previous.grid ||
        state.score !== previous.score ||
        state.moveCount !== previous.moveCount ||
        state.maxTile !== previous.maxTile ||
        state.hasWon !== previous.hasWon ||
        state.isOver !== previous.isOver ||
        state.rngSeed !== previous.rngSeed ||
        state.history !== previous.history ||
        state.metrics !== previous.metrics;

      if (stateChanged) {
        saveState(state);
      }

      if (state.bestScore !== previous.bestScore) {
        savePersistedBestScore(state.bestScore);
      }

      if (state.achievements !== previous.achievements) {
        savePersistedAchievements(state.achievements);
      }
    });

    return () => {
      unsubscribe();
      saveState.cancel();
    };
  }, []);
}
