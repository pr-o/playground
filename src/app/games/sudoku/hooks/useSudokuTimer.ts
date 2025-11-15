import { useCallback, useEffect, useRef, useState } from 'react';

const TIMER_STORAGE_KEY = 'mini-sudoku-timer-v1';

export type TimerStatus = 'idle' | 'loading' | 'playing' | 'completed' | 'error';

type UseSudokuTimerOptions = {
  puzzleId: number;
  status: TimerStatus;
};

const formatElapsed = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

export function useSudokuTimer({ puzzleId, status }: UseSudokuTimerOptions) {
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    lastTimestampRef.current = null;
  }, []);

  const step = useCallback((timestamp: number) => {
    if (lastTimestampRef.current == null) {
      lastTimestampRef.current = timestamp;
    }
    const delta = timestamp - lastTimestampRef.current;
    lastTimestampRef.current = timestamp;
    setElapsedMs((current) => current + delta);
    rafRef.current = requestAnimationFrame(step);
  }, []);

  const start = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(step);
  }, [step]);

  const reset = useCallback(() => {
    stop();
    setElapsedMs(0);
  }, [stop]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
      if (!raw) {
        setElapsedMs(0);
        return;
      }
      const parsed = JSON.parse(raw) as { puzzleId: number; elapsedMs: number };
      if (parsed?.puzzleId === puzzleId) {
        setElapsedMs(parsed.elapsedMs ?? 0);
      } else {
        setElapsedMs(0);
      }
    } catch {
      setElapsedMs(0);
    }
  }, [puzzleId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        TIMER_STORAGE_KEY,
        JSON.stringify({ puzzleId, elapsedMs }),
      );
    } catch {
      // Ignore storage errors
    }
  }, [elapsedMs, puzzleId]);

  useEffect(() => {
    if (status === 'playing') {
      start();
      return () => stop();
    }
    stop();
  }, [start, status, stop]);

  return {
    elapsedMs,
    formatted: formatElapsed(elapsedMs),
    start,
    stop,
    reset,
    setElapsedMs,
  };
}
