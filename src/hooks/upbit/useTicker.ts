'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchJson } from '@/lib/upbit/client';
import type { UpbitTicker } from '@/lib/upbit/types';

interface UseTickerOptions {
  enabled?: boolean;
  intervalMs?: number;
}

interface UseTickerResult {
  ticker: UpbitTicker | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: number | null;
}

export function useTicker(
  market: string,
  { enabled = true, intervalMs = 5000 }: UseTickerOptions = {},
): UseTickerResult {
  const [ticker, setTicker] = useState<UpbitTicker | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !market) {
      setTicker(null);
      setLoading(false);
      return undefined;
    }

    const abortController = new AbortController();

    async function fetchTicker() {
      try {
        const payload = await fetchJson<UpbitTicker[]>('/ticker', undefined, {
          markets: market,
        }, abortController.signal);
        if (payload?.length) {
          setTicker(payload[0]);
          setLastUpdated(Date.now());
        }
        setError(null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error(err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchTicker();

    intervalRef.current = setInterval(fetchTicker, intervalMs);

    return () => {
      abortController.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [market, enabled, intervalMs]);

  return { ticker, loading, error, lastUpdated };
}
