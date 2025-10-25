import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MarketSelector } from '@/components/apps/upbit/MarketSelector';
import type { UpbitMarket } from '@/lib/upbit/types';

const markets: UpbitMarket[] = [
  {
    market: 'KRW-BTC',
    english_name: 'Bitcoin',
    korean_name: '비트코인',
    market_warning: 'NONE',
  },
  {
    market: 'KRW-ETH',
    english_name: 'Ethereum',
    korean_name: '이더리움',
    market_warning: 'NONE',
  },
  {
    market: 'BTC-XRP',
    english_name: 'Ripple',
    korean_name: '리플',
    market_warning: 'CAUTION',
  },
];

describe('MarketSelector', () => {
  it('shows loading and total pairs labels', () => {
    const { rerender } = render(
      <MarketSelector markets={[]} value="" onChange={() => undefined} loading />,
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();

    rerender(
      <MarketSelector
        markets={markets}
        value="KRW-BTC"
        onChange={() => undefined}
        loading={false}
      />,
    );

    expect(screen.getByText(/3 pairs/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'KRW-BTC' })).toBeInTheDocument();
  });

  it('filters markets and notifies selection', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();

    render(<MarketSelector markets={markets} value="" onChange={onChange} />);

    const input = screen.getByPlaceholderText(/search market/i);
    await user.type(input, 'eth');

    expect(screen.getByText('KRW-ETH')).toBeInTheDocument();
    expect(screen.queryByText('KRW-BTC')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /KRW-ETH/i }));
    expect(onChange).toHaveBeenCalledWith('KRW-ETH');
  });
});
