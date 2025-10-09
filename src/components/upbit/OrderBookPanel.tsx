'use client';

import { useMemo } from 'react';
import type { OrderbookLevel, UpbitTicker } from '@/lib/upbit/types';
import { calculateMidPrice, calculateSpread, totalDepth } from '@/lib/upbit/selectors';
import { formatNumber, formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

interface OrderBookPanelProps {
  asks: OrderbookLevel[];
  bids: OrderbookLevel[];
  loading: boolean;
  error: Error | null;
  ticker: UpbitTicker | null;
}

function useOrderbookStats(asks: OrderbookLevel[], bids: OrderbookLevel[]) {
  return useMemo(() => {
    const spread = calculateSpread(asks, bids);
    const mid = calculateMidPrice(asks, bids);
    const totalAsks = totalDepth(asks);
    const totalBids = totalDepth(bids);
    const maxShare = Math.max(
      ...asks.map((level) => level.share),
      ...bids.map((level) => level.share),
      0,
    );
    return { spread, mid, totalAsks, totalBids, maxShare };
  }, [asks, bids]);
}

function LevelRow({ level, maxShare }: { level: OrderbookLevel; maxShare: number }) {
  const side = level.side;
  const size = level.size;
  const price = side === 'ask' ? level.ask_price : level.bid_price;
  const percentage = maxShare ? (level.share / maxShare) * 100 : 0;
  const bgClass = side === 'ask' ? 'bg-destructive/10' : 'bg-emerald-500/10';
  const barClass = side === 'ask' ? 'bg-destructive/40' : 'bg-emerald-500/40';

  return (
    <div className={cn('relative flex items-center gap-3 px-2 py-1 text-xs font-mono', bgClass)}>
      <div
        className={cn('absolute inset-y-0', barClass, side === 'ask' ? 'right-0' : 'left-0')}
        style={{ width: `${percentage}%` }}
      />
      <div className="z-10 flex w-full items-center justify-between">
        <span className={cn('font-semibold', side === 'ask' ? 'text-destructive' : 'text-emerald-500')}>
          {formatPrice(price)}
        </span>
        <span className="text-muted-foreground">{formatNumber(size, { maximumFractionDigits: 4 })}</span>
        <span className="text-muted-foreground">
          {formatNumber(level.cumulativeSize, { maximumFractionDigits: 4 })}
        </span>
      </div>
    </div>
  );
}

export function OrderBookPanel({ asks, bids, loading, error, ticker }: OrderBookPanelProps) {
  const { spread, mid, totalAsks, totalBids, maxShare } = useOrderbookStats(asks, bids);

  return (
    <section className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-sm">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Order Book</h2>
          <p className="text-xs text-muted-foreground">Every {loading ? '—' : '1.5s'} refresh</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p>
            Mid price:{' '}
            <span className="font-semibold text-foreground">{mid ? formatPrice(mid) : '—'}</span>
          </p>
          <p>
            Spread:{' '}
            <span className="font-semibold text-foreground">{spread ? formatPrice(spread) : '—'}</span>
          </p>
        </div>
      </header>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          Failed to load order book: {error.message}
        </div>
      ) : null}

      {loading && !asks.length && !bids.length ? (
        <div className="rounded-md border border-border bg-muted/20 px-3 py-6 text-center text-sm text-muted-foreground">
          Loading order book…
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-border">
          <div className="flex items-center justify-between border-b border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span>Ask Price</span>
            <span>Size</span>
            <span>Total</span>
          </div>
          <div className="flex flex-col">
            {[...asks].reverse().map((level) => (
              <LevelRow key={`ask-${level.ask_price}-${level.cumulativeSize}`} level={level} maxShare={maxShare} />
            ))}
          </div>
          <div className="border-t border-border px-2 py-1 text-right text-xs text-muted-foreground">
            Total asks: {formatNumber(totalAsks)}
          </div>
        </div>

        <div className="rounded-md border border-border">
          <div className="flex items-center justify-between border-b border-border px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">
            <span>Bid Price</span>
            <span>Size</span>
            <span>Total</span>
          </div>
          <div className="flex flex-col">
            {bids.map((level) => (
              <LevelRow key={`bid-${level.bid_price}-${level.cumulativeSize}`} level={level} maxShare={maxShare} />
            ))}
          </div>
          <div className="border-t border-border px-2 py-1 text-right text-xs text-muted-foreground">
            Total bids: {formatNumber(totalBids)}
          </div>
        </div>
      </div>

      {ticker ? (
        <footer className="mt-auto rounded-md bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <p>
            Last trade price: <span className="font-semibold text-foreground">{formatPrice(ticker.trade_price)}</span>
          </p>
          <p>
            24h volume: {formatNumber(ticker.acc_trade_volume_24h)} · 24h value: ₩{formatNumber(
              ticker.acc_trade_price_24h,
            )}
          </p>
        </footer>
      ) : null}
    </section>
  );
}
