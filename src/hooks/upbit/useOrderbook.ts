'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import { fetchJson } from "@/lib/upbit/client";
import type {
  OrderbookLevel,
  UpbitOrderbook,
  UpbitOrderbookUnit,
} from "@/lib/upbit/types";
import { ORDERBOOK_DEPTH } from "@/lib/upbit/constants";

interface UseOrderbookOptions {
  depth?: number;
  intervalMs?: number;
  enabled?: boolean;
}

export interface UseOrderbookResult {
  orderbook: UpbitOrderbook | null;
  asks: OrderbookLevel[];
  bids: OrderbookLevel[];
  loading: boolean;
  error: Error | null;
}

const DEFAULT_INTERVAL = 1500;

function buildLevels(
  units: UpbitOrderbookUnit[],
  side: "ask" | "bid",
  totalSize: number,
): OrderbookLevel[] {
  const sorted = [...units].sort((a, b) =>
    side === "ask" ? a.ask_price - b.ask_price : b.bid_price - a.bid_price,
  );

  let cumulative = 0;

  return sorted.map((unit) => {
    const size = side === "ask" ? unit.ask_size : unit.bid_size;
    cumulative += size;

    return {
      ...unit,
      side,
      size,
      cumulativeSize: cumulative,
      share: totalSize ? size / totalSize : 0,
    };
  });
}

export function useOrderbook(
  market: string,
  {
    depth = ORDERBOOK_DEPTH,
    intervalMs = DEFAULT_INTERVAL,
    enabled = true,
  }: UseOrderbookOptions = {},
): UseOrderbookResult {
  const [orderbook, setOrderbook] = useState<UpbitOrderbook | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!enabled || !market) {
      setOrderbook(null);
      setLoading(false);
      return undefined;
    }

    const abortController = new AbortController();

    async function loadOrderbook() {
      try {
        const payload = await fetchJson<UpbitOrderbook[]>(
          '/orderbook',
          undefined,
          { markets: market },
          abortController.signal,
        );
        if (payload?.length) {
          const nextUnits = payload[0].orderbook_units.slice(0, depth);
          setOrderbook({
            ...payload[0],
            orderbook_units: nextUnits,
          });
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

    loadOrderbook();
    intervalRef.current = setInterval(loadOrderbook, intervalMs);

    return () => {
      abortController.abort();
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [market, depth, intervalMs, enabled]);

  const asks = useMemo(() => {
    if (!orderbook) return [];
    return buildLevels(orderbook.orderbook_units, "ask", orderbook.total_ask_size);
  }, [orderbook]);

  const bids = useMemo(() => {
    if (!orderbook) return [];
    return buildLevels(orderbook.orderbook_units, "bid", orderbook.total_bid_size);
  }, [orderbook]);

  return { orderbook, asks, bids, loading, error };
}
