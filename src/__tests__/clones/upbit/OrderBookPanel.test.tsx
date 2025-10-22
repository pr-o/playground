import { render, screen } from '@testing-library/react';
import { OrderBookPanel } from '@/components/clones/upbit/OrderBookPanel';
import type { OrderbookLevel, UpbitTicker } from '@/lib/upbit/types';

const asks: OrderbookLevel[] = [
  {
    ask_price: 100_500,
    bid_price: 100_000,
    ask_size: 1.5,
    bid_size: 0,
    side: 'ask',
    size: 1.5,
    cumulativeSize: 1.5,
    share: 0.75,
  },
  {
    ask_price: 100_550,
    bid_price: 99_950,
    ask_size: 0.5,
    bid_size: 0,
    side: 'ask',
    size: 0.5,
    cumulativeSize: 2,
    share: 0.25,
  },
];

const bids: OrderbookLevel[] = [
  {
    ask_price: 100_600,
    bid_price: 100_000,
    ask_size: 0,
    bid_size: 1.2,
    side: 'bid',
    size: 1.2,
    cumulativeSize: 1.2,
    share: 0.6,
  },
  {
    ask_price: 100_620,
    bid_price: 99_950,
    ask_size: 0,
    bid_size: 0.8,
    side: 'bid',
    size: 0.8,
    cumulativeSize: 2,
    share: 0.4,
  },
];

const ticker: UpbitTicker = {
  market: 'KRW-BTC',
  trade_date: '2024-06-01',
  trade_time: '010203',
  trade_price: 100_100,
  prev_closing_price: 99_500,
  change: 'RISE',
  change_price: 600,
  change_rate: 0.006,
  high_price: 101_000,
  low_price: 98_000,
  acc_trade_price_24h: 123_456_789,
  acc_trade_volume_24h: 42.1234,
};

describe('OrderBookPanel', () => {
  it('renders calculated order book statistics', () => {
    render(
      <OrderBookPanel
        asks={asks}
        bids={bids}
        loading={false}
        error={null}
        ticker={ticker}
      />,
    );

    expect(screen.getByText(/Mid price:/)).toHaveTextContent('Mid price: 100,250');
    expect(screen.getByText(/Spread:/)).toHaveTextContent('Spread: 500');
    expect(screen.getByText(/Total asks/)).toHaveTextContent('Total asks: 2');
    expect(screen.getByText(/Total bids/)).toHaveTextContent('Total bids: 2');
    expect(screen.getByText(/Last trade price/)).toHaveTextContent(
      'Last trade price: 100,100',
    );
    expect(screen.getByText(/24h volume/)).toHaveTextContent('24h volume: 42.12');
  });
});
