'use client';

import { useMemo, useState } from 'react';
import { useCandles } from '@/hooks/upbit';
import { DEFAULT_CANDLE_INTERVAL } from '@/lib/upbit/constants';
import type { CandleInterval } from '@/lib/upbit/types';
import { formatDateLabel, formatNumber, formatPrice } from '@/lib/format';

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

interface ChartPoint {
  x: number;
  y: number;
  candleIndex: number;
}

interface VolumeBar {
  x: number;
  height: number;
  width: number;
  candleIndex: number;
}

export function ChartPanel({ market }: ChartPanelProps) {
  const [interval, setInterval] = useState<CandleInterval>(DEFAULT_CANDLE_INTERVAL);
  const { candles, loading, error } = useCandles(market, { interval });

  const chartData = useMemo(() => {
    if (!candles.length) {
      return {
        linePath: '',
        areaPath: '',
        ticks: [] as { x: number; label: string }[],
        volumes: [] as VolumeBar[],
        latestClose: null as number | null,
        latestVolume: null as number | null,
        priceRange: null as { high: number; low: number } | null,
      };
    }

    const high = Math.max(...candles.map((candle) => candle.high_price));
    const low = Math.min(...candles.map((candle) => candle.low_price));
    const priceRange = high - low || 1;
    const total = candles.length;
    const barWidth = 100 / Math.max(total, 1);
    const topPadding = 8;
    const bottomPadding = 30;
    const chartHeight = 100 - bottomPadding - topPadding;

    const points: ChartPoint[] = candles.map((candle, index) => {
      const x = total === 1 ? 0 : (index / (total - 1)) * 100;
      const normalized = (candle.trade_price - low) / priceRange;
      const y = 100 - bottomPadding - normalized * chartHeight;
      return { x, y, candleIndex: index };
    });

    const linePath = points
      .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(3)} ${point.y.toFixed(3)}`)
      .join(' ');

    const firstX = points[0]?.x ?? 0;
    const lastX = points[points.length - 1]?.x ?? 100;
    const areaPath = points.length
      ? `${linePath} L ${lastX.toFixed(3)} ${100 - bottomPadding} L ${firstX.toFixed(3)} ${
          100 - bottomPadding
        } Z`
      : '';

    const maxVolume = Math.max(...candles.map((candle) => candle.candle_acc_trade_volume));
    const volumes: VolumeBar[] = candles.map((candle, index) => {
      const ratio = maxVolume ? candle.candle_acc_trade_volume / maxVolume : 0;
      const height = ratio * (bottomPadding - 6);
      return {
        x: index * barWidth + barWidth * 0.1,
        width: barWidth * 0.8,
        height,
        candleIndex: index,
      };
    });

    const tickIndices = Array.from(new Set([0, Math.floor(total / 2), total - 1])).filter((index) =>
      Number.isFinite(index),
    );
    const ticks = tickIndices.map((index) => ({
      x: total === 1 ? 0 : (index / (total - 1)) * 100,
      label: formatDateLabel(candles[index].candle_date_time_utc),
    }));

    const latest = candles[candles.length - 1];

    return {
      linePath,
      areaPath,
      ticks,
      volumes,
      latestClose: latest.trade_price,
      latestVolume: latest.candle_acc_trade_volume,
      priceRange: { high, low },
    };
  }, [candles]);

  return (
    <section className="flex h-full flex-col gap-3 rounded-md border border-border bg-card p-4 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Price Chart</h2>
          <p className="text-xs text-muted-foreground">Closing price with aggregated volume</p>
        </div>
        <div className="flex items-center gap-2">
          {INTERVAL_OPTIONS.map((option) => (
            <button
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

      <div className="relative h-80 w-full overflow-hidden rounded-md border border-border bg-background">
        {loading && !candles.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading chart…
          </div>
        ) : null}

        {!loading && !candles.length ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No candle data yet
          </div>
        ) : null}

        {candles.length ? (
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <defs>
              <linearGradient id="price-fill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {chartData.areaPath ? (
              <path d={chartData.areaPath} fill="url(#price-fill)" stroke="none" />
            ) : null}
            {chartData.linePath ? (
              <path
                d={chartData.linePath}
                fill="none"
                stroke="var(--primary)"
                strokeWidth={1.4}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}
            {chartData.volumes.map((bar) => (
              <rect
                key={`volume-${bar.candleIndex}`}
                x={bar.x}
                y={100 - 10 - bar.height}
                width={Math.max(bar.width, 0.5)}
                height={bar.height}
                fill="var(--accent-foreground)"
                opacity={0.4}
              />
            ))}
            {chartData.ticks.map((tick) => (
              <g key={tick.label} transform={`translate(${tick.x}, 96)`}>
                <line y2="4" stroke="var(--border)" strokeWidth={0.5} />
                <text
                  y="8"
                  textAnchor={tick.x === 0 ? 'start' : tick.x >= 99 ? 'end' : 'middle'}
                  fontSize="2.6"
                  fill="var(--muted-foreground)"
                >
                  {tick.label}
                </text>
              </g>
            ))}
          </svg>
        ) : null}
      </div>

      {chartData.latestClose ? (
        <footer className="grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
          <div>
            <p className="uppercase tracking-wide">Last Close</p>
            <p className="text-sm font-semibold text-foreground">{formatPrice(chartData.latestClose)}</p>
          </div>
          {chartData.priceRange ? (
            <>
              <div>
                <p className="uppercase tracking-wide">24h High</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatPrice(chartData.priceRange.high)}
                </p>
              </div>
              <div>
                <p className="uppercase tracking-wide">24h Low</p>
                <p className="text-sm font-semibold text-foreground">
                  {formatPrice(chartData.priceRange.low)}
                </p>
              </div>
            </>
          ) : null}
          <div>
            <p className="uppercase tracking-wide">Interval Volume</p>
            <p className="text-sm font-semibold text-foreground">
              {chartData.latestVolume ? formatNumber(chartData.latestVolume) : '—'}
            </p>
          </div>
        </footer>
      ) : null}
    </section>
  );
}
