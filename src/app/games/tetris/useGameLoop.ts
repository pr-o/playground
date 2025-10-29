import { useCallback, useEffect, useRef, useState } from 'react';

const BASE_INTERVAL_MS = 900;
const LEVEL_ACCELERATION = 0.82;
const MIN_INTERVAL_MS = 55;
const SOFT_DROP_MULTIPLIER = 0.18;
const SOFT_DROP_MIN_MS = 45;

export const getGravityIntervalForLevel = (level: number): number => {
  const safeLevel = Math.max(1, level);
  const acceleratedInterval =
    BASE_INTERVAL_MS * Math.pow(LEVEL_ACCELERATION, safeLevel - 1);
  return Math.max(MIN_INTERVAL_MS, Math.round(acceleratedInterval));
};

export type UseGameLoopOptions = {
  level: number;
  onTick: () => void;
  autoStart?: boolean;
  paused?: boolean;
};

export type UseGameLoopReturn = {
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  setSoftDrop: (enabled: boolean) => void;
  isRunning: boolean;
};

export function useGameLoop({
  level,
  onTick,
  autoStart = false,
  paused = false,
}: UseGameLoopOptions): UseGameLoopReturn {
  const frameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef(0);

  const baseIntervalRef = useRef(getGravityIntervalForLevel(level));
  const currentIntervalRef = useRef(baseIntervalRef.current);
  const softDropRef = useRef(false);
  const runningRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);

  const cancelLoop = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const applyIntervalChange = useCallback((interval: number) => {
    currentIntervalRef.current = interval;
  }, []);

  const loop = useCallback(
    (time: number) => {
      if (!runningRef.current) {
        return;
      }

      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }

      const delta = time - lastTimeRef.current;
      lastTimeRef.current = time;

      accumulatorRef.current += delta;

      while (accumulatorRef.current >= currentIntervalRef.current) {
        accumulatorRef.current -= currentIntervalRef.current;
        onTick();
      }

      frameRef.current = requestAnimationFrame(loop);
    },
    [onTick],
  );

  const start = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    lastTimeRef.current = null;
    accumulatorRef.current = 0;
    setIsRunning(true);
    frameRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const pause = useCallback(() => {
    if (!runningRef.current && !isRunning) return;
    runningRef.current = false;
    if (isRunning) {
      setIsRunning(false);
    }
    cancelLoop();
  }, [cancelLoop, isRunning]);

  const resume = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    setIsRunning(true);
    lastTimeRef.current = null;
    frameRef.current = requestAnimationFrame(loop);
  }, [loop]);

  const reset = useCallback(() => {
    pause();
    accumulatorRef.current = 0;
    lastTimeRef.current = null;
  }, [pause]);

  const setSoftDrop = useCallback(
    (enabled: boolean) => {
      softDropRef.current = enabled;
      const baseInterval = baseIntervalRef.current;
      const nextInterval = enabled
        ? Math.max(SOFT_DROP_MIN_MS, baseInterval * SOFT_DROP_MULTIPLIER)
        : baseInterval;
      applyIntervalChange(nextInterval);
    },
    [applyIntervalChange],
  );

  useEffect(() => {
    const baseInterval = getGravityIntervalForLevel(level);
    baseIntervalRef.current = baseInterval;
    if (!softDropRef.current) {
      applyIntervalChange(baseInterval);
    }
  }, [level, applyIntervalChange]);

  useEffect(() => {
    if (paused && runningRef.current) {
      pause();
    } else if (!paused && autoStart && !runningRef.current) {
      resume();
    }
  }, [paused, autoStart, pause, resume]);

  useEffect(() => {
    if (autoStart) {
      start();
    }

    return () => {
      runningRef.current = false;
      cancelLoop();
    };
  }, [autoStart, start, cancelLoop]);

  return {
    start,
    pause,
    resume,
    reset,
    setSoftDrop,
    isRunning,
  };
}
