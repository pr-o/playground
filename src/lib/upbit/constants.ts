export const UPBIT_API_BASE = 'https://api.upbit.com/v1';
export const UPBIT_PROXY_ENDPOINT = '/api/upbit';
export const UPBIT_WEBSOCKET_ENDPOINT = 'wss://api.upbit.com/websocket/v1';

export const DEFAULT_MARKET = 'KRW-BTC';
export const DEFAULT_CANDLE_INTERVAL = 'minutes/1' as const;

export const ORDERBOOK_DEPTH = 15;
export const TRADE_HISTORY_COUNT = 60;

export const UPBIT_TICKET =
  process.env.NEXT_PUBLIC_UPBIT_TICKET ?? 'codex-dashboard-client';
