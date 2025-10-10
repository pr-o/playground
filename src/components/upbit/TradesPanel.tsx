'use client';

import { useEffect, useRef, useState } from 'react';
import type { UpbitTrade } from '@/lib/upbit/types';
import { formatNumber, formatPrice, formatTradeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface TradesPanelProps {
  trades: UpbitTrade[];
  loading: boolean;
  error: Error | null;
}

type TradeHighlight = {
  side: 'ASK' | 'BID';
  variant: 0 | 1;
};

export function TradesPanel({ trades, loading, error }: TradesPanelProps) {
  const [flashMap, setFlashMap] = useState<Record<number, TradeHighlight>>({});
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());
  const previousIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const scheduleHighlight = (id: number, side: 'ASK' | 'BID') => {
      setFlashMap((current) => {
        const previous = current[id];
        const nextVariant = previous ? (previous.variant === 0 ? 1 : 0) : 0;
        return {
          ...current,
          [id]: { side, variant: nextVariant },
        };
      });

      const existingTimer = timersRef.current.get(id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      const timeout = setTimeout(() => {
        setFlashMap((current) => {
          if (!(id in current)) return current;
          const next = { ...current };
          delete next[id];
          return next;
        });
        timersRef.current.delete(id);
      }, 900);

      timersRef.current.set(id, timeout);
    };

    const prevIds = previousIdsRef.current;
    const nextIds = new Set<number>();

    trades.forEach((trade) => {
      nextIds.add(trade.sequential_id);
      if (!prevIds.has(trade.sequential_id)) {
        scheduleHighlight(trade.sequential_id, trade.ask_bid);
      }
    });

    previousIdsRef.current = nextIds;
  }, [trades]);

  useEffect(
    () => () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current.clear();
    },
    [],
  );

  return (
    <section className="flex max-h-[1200px] flex-col rounded-md border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Market Trades</h2>
          <p className="text-xs text-muted-foreground">Latest executions from Upbit</p>
        </div>
        {loading ? <span className="text-xs text-muted-foreground">Syncing…</span> : null}
      </header>

      {error ? (
        <div className="border-b border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          Failed to load trades: {error.message}
        </div>
      ) : null}

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <table className="min-w-full text-left text-xs">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b border-border text-[10px] uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-2 font-semibold">Time</th>
              <th className="px-4 py-2 font-semibold">Price</th>
              <th className="px-4 py-2 font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade) => {
              const tone =
                trade.ask_bid === 'ASK' ? 'text-destructive' : 'text-emerald-500';
              const highlight = flashMap[trade.sequential_id];
              const highlightClasses = highlight
                ? cn(
                    'flash-border',
                    highlight.side === 'ASK' ? 'flash-border-ask' : 'flash-border-bid',
                  )
                : undefined;

              return (
                <tr
                  key={trade.sequential_id}
                  className={cn(
                    'border-b border-border/60 last:border-none transition-[box-shadow] duration-500',
                    highlightClasses,
                  )}
                  style={
                    highlight
                      ? {
                          animationName:
                            highlight.variant === 0 ? 'flash-border' : 'flash-border-alt',
                        }
                      : undefined
                  }
                >
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatTradeTime(trade.timestamp)}
                  </td>
                  <td className={cn('px-4 py-2 font-mono font-semibold', tone)}>
                    {formatPrice(trade.trade_price)}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {formatNumber(trade.trade_volume, { maximumFractionDigits: 4 })}
                  </td>
                </tr>
              );
            })}
            {!trades.length && !loading ? (
              <tr>
                <td className="px-4 py-6 text-center text-muted-foreground" colSpan={3}>
                  No trades yet
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
