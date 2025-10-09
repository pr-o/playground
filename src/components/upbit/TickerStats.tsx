'use client';

import type { UpbitTicker } from '@/lib/upbit/types';
import { formatNumber, formatPercentage, formatPrice } from '@/lib/format';
import { tickerChangeLabel } from '@/lib/upbit/selectors';

interface TickerStatsProps {
  ticker: UpbitTicker | null;
  lastUpdated: number | null;
}

export function TickerStats({ ticker, lastUpdated }: TickerStatsProps) {
  if (!ticker) {
    return (
      <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">
        Waiting for ticker data…
      </div>
    );
  }

  const { label, tone } = tickerChangeLabel(ticker);
  const toneClass =
    tone === 'rise' ? 'text-emerald-500' : tone === 'fall' ? 'text-destructive' : 'text-muted-foreground';

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">{formatPrice(ticker.trade_price)}</h2>
          <p className="text-xs text-muted-foreground">{ticker.market}</p>
        </div>
        <div className="text-right text-sm font-semibold">
          <span className={toneClass}>
            {label} {formatPrice(ticker.change_price)} ({formatPercentage(ticker.change_rate)})
          </span>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-3">
        <div>
          <dt className="uppercase tracking-wide">24h High</dt>
          <dd className="text-sm font-semibold text-foreground">{formatPrice(ticker.high_price)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">24h Low</dt>
          <dd className="text-sm font-semibold text-foreground">{formatPrice(ticker.low_price)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">24h Volume</dt>
          <dd className="text-sm font-semibold text-foreground">
            {formatNumber(ticker.acc_trade_volume_24h)}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">24h Value</dt>
          <dd className="text-sm font-semibold text-foreground">
            ₩{formatNumber(ticker.acc_trade_price_24h)}
          </dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Prev Close</dt>
          <dd className="text-sm font-semibold text-foreground">{formatPrice(ticker.prev_closing_price)}</dd>
        </div>
        <div>
          <dt className="uppercase tracking-wide">Last Updated</dt>
          <dd className="text-sm font-semibold text-foreground">
            {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
          </dd>
        </div>
      </dl>
    </div>
  );
}
