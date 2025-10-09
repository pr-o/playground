'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchJson } from '@/lib/upbit/client';
import type { CandleInterval, UpbitCandle } from '@/lib/upbit/types';

interface UseCandlesOptions {
  interval?: CandleInterval;
  limit?: number;
  refreshMs?: number;
  enabled?: boolean;
}

interface UseCandlesResult {
  candles: UpbitCandle[];
  loading: boolean;
  error: Error | null;
}

const DEFAULT_REFRESH_MS = 30000;
const DEFAULT_INTERVAL: CandleInterval = 'minutes/1';
const DEFAULT_LIMIT = 200;

function resolveCandlePath(interval: CandleInterval): string {
  if (interval.startsWith('minutes/')) {
    const [, unit] = interval.split('/');
    return `/candles/minutes/${unit}`;
  }
  if (interval === 'days') return '/candles/days';
  if (interval === 'weeks') return '/candles/weeks';
  if (interval === 'months') return '/candles/months';
  return '/candles/minutes/1';
}

export function useCandles(
  market: string,
  {
    interval = DEFAULT_INTERVAL,
    limit = DEFAULT_LIMIT,
    refreshMs = DEFAULT_REFRESH_MS,
    enabled = true,
  }: UseCandlesOptions = {},
): UseCandlesResult {
  const [candles, setCandles] = useState<UpbitCandle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !market) {
      setCandles([]);
      setLoading(false);
      return undefined;
    }

    const abortController = new AbortController();

    async function loadCandles() {
      try {
        const payload = await fetchJson<UpbitCandle[]>(
          resolveCandlePath(interval),
          undefined,
          {
            market,
            count: Math.min(limit, 400),
          },
          abortController.signal,
        );
        const sorted = payload.slice().sort((a, b) => a.timestamp - b.timestamp);
        setCandles(sorted);
        setError(null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error(err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadCandles();
    intervalRef.current = setInterval(loadCandles, refreshMs);

    return () => {
      abortController.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [market, interval, limit, refreshMs, enabled]);

  const memoized = useMemo(() => candles, [candles]);

  return { candles: memoized, loading, error };
}
