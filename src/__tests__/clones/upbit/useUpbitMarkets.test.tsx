import { render, screen, waitFor, within } from '@testing-library/react';
import { rest } from 'msw';
import { PropsWithChildren } from 'react';
import { UpbitProvider } from '@/providers/upbit-provider';
import { useUpbitContext } from '@/providers/upbit-provider';
import { useUpbitMarkets } from '@/hooks/upbit';
import type { UpbitMarket } from '@/lib/upbit/types';
import { server } from '../../msw-server';

function ProviderWrapper({ children }: PropsWithChildren) {
  return <UpbitProvider>{children}</UpbitProvider>;
}

function MarketsProbe() {
  const { markets, loading, error } = useUpbitMarkets();
  const { markets: contextMarkets } = useUpbitContext();

  if (loading) {
    return <div data-testid="status">loading</div>;
  }

  if (error) {
    return <div data-testid="status">error: {error.message}</div>;
  }

  return (
    <div>
      <div data-testid="context-count">{contextMarkets.length}</div>
      <ul aria-label="available markets">
        {markets.map((market) => (
          <li key={market.market}>{market.market}</li>
        ))}
      </ul>
    </div>
  );
}

const sampleMarkets: UpbitMarket[] = [
  {
    market: 'KRW-ETH',
    english_name: 'Ethereum',
    korean_name: '이더리움',
    market_warning: 'NONE',
  },
  {
    market: 'KRW-ADA',
    english_name: 'Cardano',
    korean_name: '카르다노',
    market_warning: 'NONE',
  },
  {
    market: 'KRW-BTC',
    english_name: 'Bitcoin',
    korean_name: '비트코인',
    market_warning: 'NONE',
  },
];

describe('useUpbitMarkets', () => {
  it('fetches, sorts, and stores markets in context', async () => {
    server.use(
      rest.get('/api/upbit/market/all', (_req, res, ctx) => res(ctx.json(sampleMarkets))),
    );

    render(<MarketsProbe />, { wrapper: ProviderWrapper });

    const list = await screen.findByRole('list', { name: /available markets/i });
    await waitFor(() => expect(screen.queryByTestId('status')).not.toBeInTheDocument());

    const items = within(list).getAllByRole('listitem');
    expect(items.map((item) => item.textContent)).toEqual([
      'KRW-ADA',
      'KRW-BTC',
      'KRW-ETH',
    ]);
    expect(screen.getByTestId('context-count')).toHaveTextContent('3');
  });

  it('exposes errors when the markets endpoint fails', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    server.use(
      rest.get('/api/upbit/market/all', (_req, res, ctx) =>
        res(ctx.status(500), ctx.json({ error: { message: 'Upbit says nope' } })),
      ),
    );

    render(<MarketsProbe />, { wrapper: ProviderWrapper });

    const status = await screen.findByTestId('status');
    await waitFor(() =>
      expect(status).toHaveTextContent('Upbit API error: Upbit says nope'),
    );

    consoleSpy.mockRestore();
  });
});
