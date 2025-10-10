'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchJson, openUpbitWebSocket } from '@/lib/upbit/client';
import type {
  OrderbookLevel,
  UpbitOrderbook,
  UpbitOrderbookUnit,
} from '@/lib/upbit/types';
import { ORDERBOOK_DEPTH } from '@/lib/upbit/constants';

interface UseOrderbookOptions {
  depth?: number;
  enabled?: boolean;
}

export interface UseOrderbookResult {
  orderbook: UpbitOrderbook | null;
  asks: OrderbookLevel[];
  bids: OrderbookLevel[];
  loading: boolean;
  error: Error | null;
}

interface UpbitOrderbookStreamMessageUnit {
  ask_price: number;
  bid_price: number;
  ask_size: number;
  bid_size: number;
}

interface UpbitOrderbookStreamMessage {
  type: 'orderbook';
  code: string;
  timestamp: number;
  total_ask_size: number;
  total_bid_size: number;
  orderbook_units: UpbitOrderbookStreamMessageUnit[];
  [key: string]: unknown;
}

function buildLevels(
  units: UpbitOrderbookUnit[],
  side: 'ask' | 'bid',
  totalSize: number,
): OrderbookLevel[] {
  const sorted = [...units].sort((a, b) =>
    side === 'ask' ? a.ask_price - b.ask_price : b.bid_price - a.bid_price,
  );

  let cumulative = 0;

  return sorted.map((unit) => {
    const size = side === 'ask' ? unit.ask_size : unit.bid_size;
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

function normalizeStreamOrderbook(
  message: UpbitOrderbookStreamMessage,
  depth: number,
): UpbitOrderbook {
  return {
    market: message.code,
    timestamp: message.timestamp,
    total_ask_size: message.total_ask_size,
    total_bid_size: message.total_bid_size,
    orderbook_units: message.orderbook_units.slice(0, depth).map((unit) => ({
      ask_price: unit.ask_price,
      bid_price: unit.bid_price,
      ask_size: unit.ask_size,
      bid_size: unit.bid_size,
    })),
  };
}

export function useOrderbook(
  market: string,
  { depth = ORDERBOOK_DEPTH, enabled = true }: UseOrderbookOptions = {},
): UseOrderbookResult {
  const [orderbook, setOrderbook] = useState<UpbitOrderbook | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setOrderbook(null);
    setError(null);
    setLoading(Boolean(enabled && market));

    if (!enabled || !market) {
      return undefined;
    }

    let isActive = true;
    const abortController = new AbortController();

    async function loadInitialOrderbook() {
      try {
        const payload = await fetchJson<UpbitOrderbook[]>(
          '/orderbook',
          undefined,
          { markets: market },
          abortController.signal,
        );

        if (!isActive || !payload?.length) return;

        const nextUnits = payload[0].orderbook_units.slice(0, depth);
        setOrderbook({
          ...payload[0],
          orderbook_units: nextUnits,
        });
        setError(null);
      } catch (err) {
        if (!isActive || (err as Error).name === 'AbortError') return;
        console.error(err);
        setError(err as Error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    loadInitialOrderbook();

    const unsubscribe = openUpbitWebSocket<UpbitOrderbookStreamMessage>({
      payload: [
        { ticket: `orderbook-${market}` },
        { type: 'orderbook', codes: [market], isOnlyRealtime: true },
      ],
      onMessage: (message) => {
        if (!isActive || message?.type !== 'orderbook') return;

        const normalized = normalizeStreamOrderbook(message, depth);
        setOrderbook(normalized);
        setError(null);
        setLoading(false);
      },
      onError: (event) => {
        if (!isActive) return;
        console.error('Upbit orderbook websocket error', event);
        setError(new Error('Failed to stream order book from Upbit.'));
      },
      onClose: (event) => {
        if (!isActive || event.wasClean) return;
        console.warn('Upbit orderbook websocket closed unexpectedly', event);
        setError(new Error('Order book stream disconnected unexpectedly.'));
      },
    });

    return () => {
      isActive = false;
      abortController.abort();
      unsubscribe();
    };
  }, [market, depth, enabled]);

  const asks = useMemo(() => {
    if (!orderbook) return [];
    return buildLevels(orderbook.orderbook_units, 'ask', orderbook.total_ask_size);
  }, [orderbook]);

  const bids = useMemo(() => {
    if (!orderbook) return [];
    return buildLevels(orderbook.orderbook_units, 'bid', orderbook.total_bid_size);
  }, [orderbook]);

  return { orderbook, asks, bids, loading, error };
}
