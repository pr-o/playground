'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { DEFAULT_MARKET } from '@/lib/upbit/constants';

interface UpbitContextValue {
  market: string;
  setMarket: (market: string) => void;
  markets: string[];
  setMarkets: (markets: string[]) => void;
}

const STORAGE_KEY = 'upbit-selected-market';

const UpbitContext = createContext<UpbitContextValue | undefined>(undefined);

export function UpbitProvider({ children }: { children: React.ReactNode }) {
  const [market, setMarketState] = useState(DEFAULT_MARKET);
  const [markets, setMarketsState] = useState<string[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setMarketState(stored);
    }
  }, []);

  const setMarket = useCallback((next: string) => {
    setMarketState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const setMarkets = useCallback((next: string[]) => {
    setMarketsState(next);
  }, []);

  const value = useMemo(
    () => ({
      market,
      setMarket,
      markets,
      setMarkets,
    }),
    [market, setMarket, markets, setMarkets],
  );

  return <UpbitContext.Provider value={value}>{children}</UpbitContext.Provider>;
}

export function useUpbitContext(): UpbitContextValue {
  const context = useContext(UpbitContext);
  if (!context) {
    throw new Error('useUpbitContext must be used within UpbitProvider');
  }
  return context;
}
