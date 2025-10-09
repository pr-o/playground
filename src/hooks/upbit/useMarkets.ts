'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchJson } from '@/lib/upbit/client';
import type { UpbitMarket } from '@/lib/upbit/types';
import { useUpbitContext } from '@/providers/upbit-provider';

interface UseUpbitMarketsResult {
  markets: UpbitMarket[];
  loading: boolean;
  error: Error | null;
}

export function useUpbitMarkets(): UseUpbitMarketsResult {
  const [markets, setMarketsState] = useState<UpbitMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { setMarkets } = useUpbitContext();

  useEffect(() => {
    const abortController = new AbortController();

    async function loadMarkets() {
      setLoading(true);
      try {
        const payload = await fetchJson<UpbitMarket[]>(
          '/market/all',
          undefined,
          { isDetails: true },
          abortController.signal,
        );
        setMarketsState(payload);
        setMarkets(payload.map((market) => market.market));
        setError(null);
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        console.error(err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    loadMarkets();

    return () => {
      abortController.abort();
    };
  }, [setMarkets]);

  const sortedMarkets = useMemo(
    () =>
      [...markets].sort((a, b) => {
        if (a.market < b.market) return -1;
        if (a.market > b.market) return 1;
        return 0;
      }),
    [markets],
  );

  return {
    markets: sortedMarkets,
    loading,
    error,
  };
}
