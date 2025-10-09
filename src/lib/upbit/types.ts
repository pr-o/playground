export interface UpbitMarket {
  market: string;
  korean_name: string;
  english_name: string;
  market_warning?: 'NONE' | 'CAUTION';
}

export interface UpbitTicker {
  market: string;
  trade_date: string;
  trade_time: string;
  trade_price: number;
  prev_closing_price: number;
  change: 'RISE' | 'EVEN' | 'FALL';
  change_price: number;
  change_rate: number;
  high_price: number;
  low_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume_24h: number;
}

export interface UpbitOrderbookUnit {
  ask_price: number;
  bid_price: number;
  ask_size: number;
  bid_size: number;
}

export interface UpbitOrderbook {
  market: string;
  timestamp: number;
  total_ask_size: number;
  total_bid_size: number;
  orderbook_units: UpbitOrderbookUnit[];
}

export interface OrderbookLevel extends UpbitOrderbookUnit {
  side: "ask" | "bid";
  size: number;
  cumulativeSize: number;
  share: number;
}

export interface UpbitTrade {
  market: string;
  trade_date_utc: string;
  trade_time_utc: string;
  timestamp: number;
  trade_price: number;
  trade_volume: number;
  ask_bid: 'ASK' | 'BID';
  sequential_id: number;
}

export interface UpbitCandle {
  market: string;
  candle_date_time_utc: string;
  candle_date_time_kst: string;
  opening_price: number;
  high_price: number;
  low_price: number;
  trade_price: number;
  timestamp: number;
  candle_acc_trade_price: number;
  candle_acc_trade_volume: number;
}

export type CandleInterval =
  | 'minutes/1'
  | 'minutes/3'
  | 'minutes/5'
  | 'minutes/10'
  | 'minutes/15'
  | 'minutes/30'
  | 'minutes/60'
  | 'minutes/240'
  | 'days'
  | 'weeks'
  | 'months';

export interface UpbitErrorShape {
  error: {
    name: string;
    message: string;
  };
}
