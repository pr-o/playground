'use client';

import { useEffect } from 'react';

import { useHevyStore } from '@/store/hevy/store';

export function useRestTimer() {
  const restTimer = useHevyStore((state) => state.restTimer);
  const setRemaining = useHevyStore((state) => state.setRestTimerRemaining);
  const completeTimer = useHevyStore((state) => state.completeRestTimer);

  useEffect(() => {
    if (!restTimer || restTimer.status !== 'running') return;

    const elapsedSeconds = Math.floor((Date.now() - restTimer.startedAt) / 1000);
    const remaining = Math.max(restTimer.durationSeconds - elapsedSeconds, 0);
    if (remaining <= 0) {
      setRemaining(0);
      completeTimer();
      return;
    }

    const worker = new Worker(
      new URL('../workers/rest-timer-worker.ts', import.meta.url),
    );
    worker.postMessage({ type: 'start', duration: remaining });
    const handleMessage = (
      event: MessageEvent<{ status: 'running' | 'finished'; remainingSeconds: number }>,
    ) => {
      const { status, remainingSeconds } = event.data;
      if (status === 'running') {
        setRemaining(remainingSeconds);
      } else {
        setRemaining(0);
        completeTimer();
        worker.terminate();
      }
    };

    worker.addEventListener('message', handleMessage);

    return () => {
      worker.postMessage({ type: 'cancel' });
      worker.removeEventListener('message', handleMessage);
      worker.terminate();
    };
  }, [restTimer, setRemaining, completeTimer]);
}
