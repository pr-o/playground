import { useCallback } from 'react';

export function usePersistentPuzzle<T>(storageKey: string) {
  const loadState = useCallback((): T | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }, [storageKey]);

  const saveState = useCallback(
    (value: T) => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(value));
      } catch {
        // Ignore storage errors
      }
    },
    [storageKey],
  );

  const clearState = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Ignore storage errors
    }
  }, [storageKey]);

  return { loadState, saveState, clearState };
}
