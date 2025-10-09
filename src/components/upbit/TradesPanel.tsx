'use client';

import type { UpbitTrade } from '@/lib/upbit/types';
import { formatNumber, formatPrice, formatTradeTime } from '@/lib/format';
import { cn } from '@/lib/utils';

interface TradesPanelProps {
  trades: UpbitTrade[];
  loading: boolean;
  error: Error | null;
}

export function TradesPanel({ trades, loading, error }: TradesPanelProps) {
  return (
    <section className="flex h-full flex-col rounded-md border border-border bg-card shadow-sm">
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

      <div className="flex-1 overflow-y-auto">
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
              const tone = trade.ask_bid === 'ASK' ? 'text-destructive' : 'text-emerald-500';
              return (
                <tr key={trade.sequential_id} className="border-b border-border/60 last:border-none">
                  <td className="px-4 py-2 text-muted-foreground">{formatTradeTime(trade.timestamp)}</td>
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
