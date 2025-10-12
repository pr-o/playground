'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type {
  CandlestickData,
  HistogramData,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts';
import { useCandles } from '@/hooks/upbit';
import { DEFAULT_CANDLE_INTERVAL } from '@/lib/upbit/constants';
import type { CandleInterval } from '@/lib/upbit/types';
import { formatNumber, formatPrice } from '@/lib/format';

interface ChartPanelProps {
  market: string;
}

const INTERVAL_OPTIONS: { label: string; value: CandleInterval }[] = [
  { label: '1m', value: 'minutes/1' },
  { label: '5m', value: 'minutes/5' },
  { label: '15m', value: 'minutes/15' },
  { label: '1h', value: 'minutes/60' },
  { label: '1d', value: 'days' },
];

type CandleSeries = ISeriesApi<'Candlestick'>;
type VolumeSeries = ISeriesApi<'Histogram'>;

export function ChartPanel({ market }: ChartPanelProps) {
  const [interval, setInterval] = useState<CandleInterval>(DEFAULT_CANDLE_INTERVAL);
  const { candles, loading, error } = useCandles(market, { interval });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<CandleSeries | null>(null);
  const volumeSeriesRef = useRef<VolumeSeries | null>(null);

  const summary = useMemo(() => {
    if (!candles.length) return null;
    const high = Math.max(...candles.map((candle) => candle.high_price));
    const low = Math.min(...candles.map((candle) => candle.low_price));
    const latest = candles[candles.length - 1];
    const volume = candles[candles.length - 1]?.candle_acc_trade_volume ?? null;
    return {
      high,
      low,
      latestClose: latest.trade_price,
      latestOpen: latest.opening_price,
      volume,
    };
  }, [candles]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!containerRef.current) return;

    let resizeObserver: ResizeObserver | null = null;
    let chartInstance: IChartApi | null = null;
    let disposed = false;

    async function setupChart() {
      const { createChart, CrosshairMode } = await import('lightweight-charts');
      if (disposed || !containerRef.current) {
        return;
      }

      const resolveCssVar = (name: string, fallback: string) => {
        const root = getComputedStyle(document.documentElement);
        const value = root.getPropertyValue(name).trim();
        return value || fallback;
      };

      const textColor = resolveCssVar('--__undefined__', '#94a3b8');
      const borderColor = resolveCssVar('--__undefined__', 'rgba(148, 163, 184, 0.4)');

      const chart = createChart(containerRef.current, {
        layout: {
          background: { color: 'transparent' },
          textColor,
        },
        grid: {
          horzLines: { color: 'rgba(145, 158, 171, 0.2)' },
          vertLines: { color: 'rgba(145, 158, 171, 0.2)' },
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        rightPriceScale: {
          borderColor,
        },
        timeScale: {
          borderColor,
          timeVisible: true,
          secondsVisible: false,
          barSpacing: 18,
          minBarSpacing: 12,
        },
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: 'rgba(16, 185, 129, 1)',
        borderUpColor: 'rgba(16, 185, 129, 1)',
        wickUpColor: 'rgba(16, 185, 129, 1)',
        downColor: 'rgba(239, 68, 68, 1)',
        borderDownColor: 'rgba(239, 68, 68, 1)',
        wickDownColor: 'rgba(239, 68, 68, 1)',
      });

      const volumeSeries = chart.addHistogramSeries({
        priceScaleId: '',
        base: 0,
        priceFormat: {
          type: 'volume',
        },
        color: 'rgba(100, 116, 139, 0.3)',
      });

      chart.priceScale('').applyOptions({
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      chartRef.current = chart;
      chartInstance = chart;
      candleSeriesRef.current = candleSeries;
      volumeSeriesRef.current = volumeSeries;

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver((entries) => {
          const entry = entries[0];
          if (!entry || !chartRef.current) return;
          const { width, height } = entry.contentRect;
          chartRef.current.applyOptions({ width, height });
          chartRef.current.timeScale().applyOptions({
            barSpacing: Math.max(16, width / 90),
            minBarSpacing: 12,
          });
        });
        resizeObserver.observe(containerRef.current);
      }
    }

    setupChart();

    return () => {
      disposed = true;
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      chartInstance?.remove();
      chartInstance = null;
      chartRef.current = null;
      candleSeriesRef.current = null;
      volumeSeriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return;

    if (!candles.length) {
      candleSeriesRef.current.setData([]);
      volumeSeriesRef.current.setData([]);
      return;
    }

    const candleData: CandlestickData<UTCTimestamp>[] = candles.map((candle) => ({
      time: Math.floor(candle.timestamp / 1000) as UTCTimestamp,
      open: candle.opening_price,
      high: candle.high_price,
      low: candle.low_price,
      close: candle.trade_price,
    }));

    const volumeData: HistogramData<UTCTimestamp>[] = candles.map((candle) => ({
      time: Math.floor(candle.timestamp / 1000) as UTCTimestamp,
      value: candle.candle_acc_trade_volume,
      color:
        candle.trade_price >= candle.opening_price
          ? 'rgba(16, 185, 129, 0.5)'
          : 'rgba(239, 68, 68, 0.5)',
    }));

    candleSeriesRef.current.setData(candleData);
    volumeSeriesRef.current.setData(volumeData);

    if (chartRef.current) {
      const total = candleData.length;
      const visible = Math.min(60, total);
      const fromIndex = Math.max(0, total - visible);
      const from = candleData[fromIndex]?.time;
      const to = candleData[total - 1]?.time;
      if (from && to) {
        chartRef.current.timeScale().setVisibleRange({ from, to });
      } else {
        chartRef.current.timeScale().fitContent();
      }

      const width = containerRef.current?.clientWidth ?? 960;
      chartRef.current.timeScale().applyOptions({
        barSpacing: Math.max(18, width / (visible * 1.2)),
        minBarSpacing: 12,
      });
    }
  }, [candles]);

  return (
    <section className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Price Chart</h2>
          <p className="text-xs text-muted-foreground">
            Candles powered by lightweight-charts with live polling
          </p>
        </div>
        <div className="flex items-center gap-2">
          {INTERVAL_OPTIONS.map((option) => (
            <button
              suppressHydrationWarning
              key={option.value}
              type="button"
              className={`rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                option.value === interval
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-accent'
              }`}
              onClick={() => setInterval(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Failed to load candles: {error.message}
        </div>
      ) : null}

      <div className="relative flex h-[560px] w-full flex-col overflow-hidden rounded-md border border-border bg-background">
        <div ref={containerRef} className="h-full w-full" />

        {loading && !candles.length ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60 text-sm text-muted-foreground">
            Loading chart…
          </div>
        ) : null}

        {!loading && !candles.length ? (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/60 text-sm text-muted-foreground">
            No candle data yet
          </div>
        ) : null}
      </div>

      {summary ? (
        <footer className="grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
          <div>
            <p className="uppercase tracking-wide">Open</p>
            <p className="text-sm font-semibold text-foreground">
              {formatPrice(summary.latestOpen)}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wide">Close</p>
            <p className="text-sm font-semibold text-foreground">
              {formatPrice(summary.latestClose)}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wide">High</p>
            <p className="text-sm font-semibold text-foreground">
              {formatPrice(summary.high)}
            </p>
          </div>
          <div>
            <p className="uppercase tracking-wide">Low</p>
            <p className="text-sm font-semibold text-foreground">
              {formatPrice(summary.low)}
            </p>
          </div>
          <div className="sm:col-span-2">
            <p className="uppercase tracking-wide">Interval Volume</p>
            <p className="text-sm font-semibold text-foreground">
              {summary.volume ? formatNumber(summary.volume) : '—'}
            </p>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
