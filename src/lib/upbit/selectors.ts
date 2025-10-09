import type { OrderbookLevel, UpbitTicker } from './types';

export function calculateMidPrice(asks: OrderbookLevel[], bids: OrderbookLevel[]) {
  const bestAsk = asks[0]?.ask_price;
  const bestBid = bids[0]?.bid_price;
  if (!bestAsk || !bestBid) return null;
  return (bestAsk + bestBid) / 2;
}

export function calculateSpread(asks: OrderbookLevel[], bids: OrderbookLevel[]) {
  const bestAsk = asks[0]?.ask_price;
  const bestBid = bids[0]?.bid_price;
  if (!bestAsk || !bestBid) return null;
  return bestAsk - bestBid;
}

export function totalDepth(levels: OrderbookLevel[]) {
  return levels.reduce((acc, level) => acc + level.size, 0);
}

export function tickerChangeLabel(ticker: UpbitTicker | null) {
  if (!ticker) return { label: '—', tone: 'neutral' as const };
  if (ticker.change === 'RISE') return { label: '▲', tone: 'rise' as const };
  if (ticker.change === 'FALL') return { label: '▼', tone: 'fall' as const };
  return { label: '■', tone: 'even' as const };
}
