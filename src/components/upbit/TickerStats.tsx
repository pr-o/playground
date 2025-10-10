'use client';

import { formatNumber, formatPercentage, formatPrice } from '@/lib/format';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { tickerChangeLabel } from '@/lib/upbit/selectors';
import type { UpbitTicker } from '@/lib/upbit/types';

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
    tone === 'rise'
      ? 'text-emerald-500'
      : tone === 'fall'
        ? 'text-destructive'
        : 'text-muted-foreground';
  const volumeDisplay = formatNumber(ticker.acc_trade_volume_24h);
  const valueDisplay = `₩${formatNumber(ticker.acc_trade_price_24h)}`;

  return (
    <div className="space-y-3 rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {formatPrice(ticker.trade_price)}
          </h2>
          <p className="text-xs text-muted-foreground">{ticker.market}</p>
        </div>
        <div className="text-right text-sm font-semibold">
          <span className={toneClass}>
            {label} {formatPrice(ticker.change_price)} (
            {formatPercentage(ticker.change_rate)})
          </span>
        </div>
      </div>

      <TooltipProvider>
        <dl className="grid grid-cols-2 gap-x-2 gap-y-4 text-xs text-muted-foreground max-[640px]:grid-cols-2 max-[420px]:grid-cols-1">
          <div>
            <dt className="uppercase tracking-wide text-[10px]">24h High</dt>
            <dd className="text-xs font-semibold text-foreground">
              {formatPrice(ticker.high_price)}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide text-[10px]">24h Low</dt>
            <dd className="text-xs font-semibold text-foreground">
              {formatPrice(ticker.low_price)}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide text-[10px]">24h Volume</dt>
            <Tooltip>
              <TooltipTrigger asChild>
                <dd className="truncate text-xs font-semibold text-foreground">
                  {volumeDisplay}
                </dd>
              </TooltipTrigger>
              <TooltipContent side="top">{volumeDisplay}</TooltipContent>
            </Tooltip>
          </div>
          <div>
            <dt className="uppercase tracking-wide text-[10px]">24h Value</dt>
            <Tooltip>
              <TooltipTrigger asChild>
                <dd className="truncate text-xs font-semibold text-foreground">
                  {valueDisplay}
                </dd>
              </TooltipTrigger>
              <TooltipContent side="top">{valueDisplay}</TooltipContent>
            </Tooltip>
          </div>
          <div>
            <dt className="uppercase tracking-wide text-[10px]">Prev Close</dt>
            <dd className="text-xs font-semibold text-foreground">
              {formatPrice(ticker.prev_closing_price)}
            </dd>
          </div>
          <div>
            <dt className="uppercase tracking-wide text-[10px]">Last Updated</dt>
            <dd className="text-xs font-semibold text-foreground">
              {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : '—'}
            </dd>
          </div>
        </dl>
      </TooltipProvider>
    </div>
  );
}
