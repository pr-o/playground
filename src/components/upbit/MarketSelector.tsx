'use client';

import { useMemo, useState } from 'react';
import type { UpbitMarket } from '@/lib/upbit/types';
import { cn } from '@/lib/utils';

interface MarketSelectorProps {
  markets: UpbitMarket[];
  value: string;
  onChange: (market: string) => void;
  loading?: boolean;
  error?: Error | null;
}

export function MarketSelector({
  markets,
  value,
  onChange,
  loading = false,
  error = null,
}: MarketSelectorProps) {
  const [query, setQuery] = useState('');

  const filteredMarkets = useMemo(() => {
    if (!query) return markets;
    const lowered = query.toLowerCase();
    return markets.filter(
      (market) =>
        market.market.toLowerCase().includes(lowered) ||
        market.korean_name.toLowerCase().includes(lowered) ||
        market.english_name.toLowerCase().includes(lowered),
    );
  }, [markets, query]);

  return (
    <div className="w-full space-y-3 rounded-md border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Market</p>
          <h2 className="text-xl font-bold text-foreground">
            {value || 'Select Market'}
          </h2>
        </div>
        {error ? (
          <span className="text-xs font-semibold text-destructive">{error.message}</span>
        ) : loading ? (
          <span className="text-xs text-muted-foreground">Loading...</span>
        ) : (
          <span className="text-xs text-muted-foreground">{markets.length} pairs</span>
        )}
      </div>

      <input
        suppressHydrationWarning
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/40"
        placeholder="Search market (e.g. KRW-BTC)"
        defaultValue=""
        onChange={(event) => setQuery(event.target.value)}
        aria-label="Search market"
      />

      <div className="max-h-64 overflow-y-auto rounded-md border border-border bg-background">
        <ul>
          {filteredMarkets.slice(0, 100).map((market) => (
            <li key={market.market}>
              <button
                type="button"
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-accent',
                  value === market.market
                    ? 'bg-accent/60 font-semibold'
                    : 'bg-transparent',
                )}
                onClick={() => onChange(market.market)}
              >
                <span>
                  <span className="block text-foreground">{market.market}</span>
                  <span className="block text-xs text-muted-foreground">
                    {market.korean_name} · {market.english_name}
                  </span>
                </span>
                {market.market_warning === 'CAUTION' ? (
                  <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                    CAUTION
                  </span>
                ) : null}
              </button>
            </li>
          ))}
          {!filteredMarkets.length ? (
            <li className="px-3 py-4 text-center text-sm text-muted-foreground">
              No markets found
            </li>
          ) : null}
        </ul>
      </div>
    </div>
  );
}
