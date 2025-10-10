'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchJson, openUpbitWebSocket } from '@/lib/upbit/client';
import type { UpbitTrade } from '@/lib/upbit/types';
import { TRADE_HISTORY_COUNT } from '@/lib/upbit/constants';

interface UseTradesOptions {
  enabled?: boolean;
  limit?: number;
}

export interface UseTradesResult {
  trades: UpbitTrade[];
  loading: boolean;
  error: Error | null;
}

interface UpbitTradeStreamMessage {
  type: 'trade';
  code: string;
  timestamp: number;
  trade_date: string;
  trade_time: string;
  trade_timestamp: number;
  trade_price: number;
  trade_volume: number;
  ask_bid: 'ASK' | 'BID';
  sequential_id: number;
  [key: string]: unknown;
}

function mergeTrades(
  next: UpbitTrade[],
  current: UpbitTrade[],
  limit: number,
): UpbitTrade[] {
  const combined = [...next, ...current].sort((a, b) => b.timestamp - a.timestamp);

  const deduped: UpbitTrade[] = [];
  const seen = new Set<number>();

  for (const trade of combined) {
    if (seen.has(trade.sequential_id)) continue;
    seen.add(trade.sequential_id);
    deduped.push(trade);
    if (deduped.length >= limit) break;
  }

  return deduped;
}

function normalizeStreamTrade(message: UpbitTradeStreamMessage): UpbitTrade {
  const timestampSource =
    typeof message.trade_timestamp === 'number'
      ? message.trade_timestamp
      : message.timestamp;
  const timestamp = Number.isFinite(timestampSource) ? timestampSource : Date.now();

  let trade_date_utc = '';
  if (typeof message.trade_date === 'string' && message.trade_date.length === 8) {
    trade_date_utc = `${message.trade_date.slice(0, 4)}-${message.trade_date.slice(
      4,
      6,
    )}-${message.trade_date.slice(6, 8)}`;
  }

  let trade_time_utc = '';
  if (typeof message.trade_time === 'string' && message.trade_time.length >= 6) {
    trade_time_utc = `${message.trade_time.slice(0, 2)}:${message.trade_time.slice(
      2,
      4,
    )}:${message.trade_time.slice(4, 6)}`;
  }

  if (!trade_date_utc || !trade_time_utc) {
    const iso = new Date(timestamp).toISOString();
    const [datePart, timeFragment] = iso.split('T');
    if (!trade_date_utc) {
      trade_date_utc = datePart ?? '';
    }
    if (!trade_time_utc) {
      trade_time_utc = timeFragment?.slice(0, 8) ?? '';
    }
  }

  return {
    market: message.code,
    trade_date_utc,
    trade_time_utc,
    timestamp,
    trade_price: message.trade_price,
    trade_volume: message.trade_volume,
    ask_bid: message.ask_bid,
    sequential_id: message.sequential_id,
  };
}

export function useTrades(
  market: string,
  { enabled = true, limit = TRADE_HISTORY_COUNT }: UseTradesOptions = {},
): UseTradesResult {
  const [trades, setTrades] = useState<UpbitTrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setTrades([]);
    setError(null);
    setLoading(Boolean(enabled && market));

    if (!enabled || !market) {
      return undefined;
    }

    let isActive = true;
    const abortController = new AbortController();

    async function loadInitialTrades() {
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

        if (!isActive) return;

        setTrades((current) => mergeTrades(payload, current, limit));
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

    loadInitialTrades();

    const unsubscribe = openUpbitWebSocket<UpbitTradeStreamMessage>({
      payload: [{ ticket: `trades-${market}` }, { type: 'trade', codes: [market] }],
      onMessage: (message) => {
        console.log('mes =>', message);
        if (!isActive || message?.type !== 'trade') return;

        const normalized = normalizeStreamTrade(message);
        setTrades((current) => mergeTrades([normalized], current, limit));
        setError(null);
        setLoading(false);
      },
      onError: (event) => {
        if (!isActive) return;
        console.error('Upbit trade websocket error', event);
        setError(new Error('Failed to stream trades from Upbit.'));
      },
      onClose: (event) => {
        if (!isActive || event.wasClean) return;
        console.warn('Upbit trade websocket closed unexpectedly', event);
        setError(new Error('Trade stream disconnected unexpectedly.'));
      },
    });

    return () => {
      isActive = false;
      abortController.abort();
      unsubscribe();
    };
  }, [market, enabled, limit]);

  const orderedTrades = useMemo(
    () => trades.slice().sort((a, b) => b.timestamp - a.timestamp),
    [trades],
  );

  return { trades: orderedTrades, loading, error };
}
