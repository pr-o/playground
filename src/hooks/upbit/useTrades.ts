'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchJson } from '@/lib/upbit/client';
import type { UpbitTrade } from '@/lib/upbit/types';
import { TRADE_HISTORY_COUNT } from '@/lib/upbit/constants';

interface UseTradesOptions {
  intervalMs?: number;
  enabled?: boolean;
  limit?: number;
}

export interface UseTradesResult {
  trades: UpbitTrade[];
  loading: boolean;
  error: Error | null;
}

const DEFAULT_INTERVAL = 2000;

export function useTrades(
  market: string,
  { intervalMs = DEFAULT_INTERVAL, enabled = true, limit = TRADE_HISTORY_COUNT }: UseTradesOptions = {},
): UseTradesResult {
  const [trades, setTrades] = useState<UpbitTrade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !market) {
      setTrades([]);
      setLoading(false);
      return undefined;
    }

    const abortController = new AbortController();

    async function fetchTrades() {
      try {
        const payload = await fetchJson<UpbitTrade[]>(
          '/trades/ticks',
          undefined,
          {
            market,
            count: Math.min(limit, 200),
          },
          abortController.signal,
        );
        setTrades((current) => {
          const combined = [...payload, ...current].sort(
            (a, b) => b.timestamp - a.timestamp,
          );
          const deduped: UpbitTrade[] = [];
          const seen = new Set<number>();
          for (const trade of combined) {
            if (seen.has(trade.sequential_id)) continue;
            seen.add(trade.sequential_id);
            deduped.push(trade);
            if (deduped.length >= limit) break;
          }
          return deduped;
        });
        setError(null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error(err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchTrades();
    intervalRef.current = setInterval(fetchTrades, intervalMs);

    return () => {
      abortController.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [market, enabled, intervalMs, limit]);

  const sortedTrades = useMemo(
    () => trades.slice().sort((a, b) => b.timestamp - a.timestamp),
    [trades],
  );

  return { trades: sortedTrades, loading, error };
}
