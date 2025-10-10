'use client';

import { useUpbitContext } from '@/providers/upbit-provider';
import { useOrderbook, useTicker, useTrades, useUpbitMarkets } from '@/hooks/upbit';
import { MarketSelector } from './MarketSelector';
import { OrderBookPanel } from './OrderBookPanel';
import { ChartPanel } from './ChartPanel';
import { TickerStats } from './TickerStats';
import { TradesPanel } from './TradesPanel';

export function Dashboard() {
  const { market, setMarket } = useUpbitContext();
  const { markets, loading: marketsLoading, error: marketsError } = useUpbitMarkets();
  const { ticker, error: tickerError, lastUpdated } = useTicker(market);
  const {
    asks,
    bids,
    loading: orderbookLoading,
    error: orderbookError,
  } = useOrderbook(market);
  const { trades, loading: tradesLoading, error: tradesError } = useTrades(market);
  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-foreground sm:text-3xl">
            UpBit Market Overview
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitor live order book, trades, and price movement using the Upbit Open API.
          </p>
        </header>

        {tickerError ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-4 py-2 text-sm text-destructive">
            Ticker data error: {tickerError.message}
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1.2fr)] xl:grid-cols-[320px_minmax(0,1.6fr)_280px]">
          <aside className="flex flex-col gap-4">
            <MarketSelector
              markets={markets}
              value={market}
              onChange={setMarket}
              loading={marketsLoading}
              error={marketsError}
            />
            <OrderBookPanel
              asks={asks}
              bids={bids}
              loading={orderbookLoading}
              error={orderbookError}
              ticker={ticker}
            />
          </aside>

          <div className="flex flex-col gap-4">
            <ChartPanel market={market} />
          </div>

          <aside className="flex flex-col gap-4">
            <TickerStats ticker={ticker} lastUpdated={lastUpdated} />
            <TradesPanel trades={trades} loading={tradesLoading} error={tradesError} />
          </aside>
        </div>
      </div>
    </div>
  );
}
