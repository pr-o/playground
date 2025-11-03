'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export type LeaderboardEntry = {
  id: string;
  score: number;
  lines: number;
  level: number;
  achievedAt: number;
};

type StoredLeaderboard = {
  entries: LeaderboardEntry[];
  version: 1;
};

const STORAGE_KEY = 'tetris.localLeaderboard.v1';
const MAX_ENTRIES = 10;

const isBrowser = () => typeof window !== 'undefined';

const isValidEntry = (value: unknown): value is LeaderboardEntry => {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<LeaderboardEntry>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.score === 'number' &&
    Number.isFinite(candidate.score) &&
    typeof candidate.lines === 'number' &&
    Number.isFinite(candidate.lines) &&
    typeof candidate.level === 'number' &&
    Number.isFinite(candidate.level) &&
    typeof candidate.achievedAt === 'number' &&
    Number.isFinite(candidate.achievedAt)
  );
};

const parseStored = (raw: string | null): LeaderboardEntry[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as StoredLeaderboard;
    if (parsed.version !== 1 || !Array.isArray(parsed.entries)) {
      return [];
    }
    return parsed.entries.filter(isValidEntry);
  } catch {
    return [];
  }
};

const saveToStorage = (entries: LeaderboardEntry[]) => {
  if (!isBrowser()) return;
  const payload: StoredLeaderboard = {
    version: 1,
    entries,
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // ignore write errors (storage quota, private mode, etc)
  }
};

export type UseLocalLeaderboardReturn = {
  entries: LeaderboardEntry[];
  isReady: boolean;
  submitScore: (score: number, lines: number, level: number) => void;
  reset: () => void;
};

export function useLocalLeaderboard(): UseLocalLeaderboardReturn {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!isBrowser()) return;
    const stored = parseStored(window.localStorage.getItem(STORAGE_KEY));
    setEntries(stored);
    setIsReady(true);
  }, []);

  const submitScore = useCallback(
    (score: number, lines: number, level: number) => {
      if (!isBrowser() || !isReady) return;
      if (score <= 0) return;
      const achievedAt = Date.now();
      const entry: LeaderboardEntry = {
        id: `${achievedAt}-${Math.random().toString(36).slice(2, 8)}`,
        score,
        lines,
        level,
        achievedAt,
      };
      setEntries((prev) => {
        const next = [...prev, entry]
          .sort((a, b) => {
            if (b.score === a.score) {
              return b.achievedAt - a.achievedAt;
            }
            return b.score - a.score;
          })
          .slice(0, MAX_ENTRIES);
        saveToStorage(next);
        return next;
      });
    },
    [isReady],
  );

  const reset = useCallback(() => {
    setEntries([]);
    saveToStorage([]);
  }, []);

  const memoizedEntries = useMemo(() => entries, [entries]);

  return {
    entries: memoizedEntries,
    isReady,
    submitScore,
    reset,
  };
}
