'use client';

import clsx from 'clsx';
import { useMemo } from 'react';
import { shallow } from 'zustand/shallow';

import { useElementsStore } from '@/store/excalidraw/elements-store';

const STROKE_COLORS = [
  '#1F2937',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#6366F1',
  '#8B5CF6',
  '#EC4899',
];

const FILL_COLORS: Array<{ label: string; value: string | null }> = [
  { label: 'None', value: null },
  { label: 'Soft white', value: '#FFFFFF' },
  { label: 'Blush', value: '#FEE2E2' },
  { label: 'Lemon', value: '#FEF3C7' },
  { label: 'Mint', value: '#DCFCE7' },
  { label: 'Sky', value: '#DBEAFE' },
  { label: 'Lilac', value: '#EDE9FE' },
];

const STROKE_WIDTHS = [1, 2, 3, 5, 7];

export function StylePanel() {
  const { style, selectedIds, setStrokeColor, setFillColor, setStrokeWidth } =
    useElementsStore(
      (state) => ({
        style: state.style,
        selectedIds: state.selectedElementIds,
        setStrokeColor: state.actions.setStrokeColor,
        setFillColor: state.actions.setFillColor,
        setStrokeWidth: state.actions.setStrokeWidth,
      }),
      shallow,
    );

  const applyToSelection = selectedIds.length > 0;

  const strokeSwatches = useMemo(
    () =>
      STROKE_COLORS.map((color) => {
        const isActive = style.strokeColor === color;
        return (
          <button
            key={color}
            type="button"
            onClick={() => setStrokeColor(color, { applyToSelection })}
            aria-label={`Stroke ${color}`}
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-full border transition',
              isActive
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border/60 hover:border-primary/60 hover:shadow-sm',
            )}
          >
            <span className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
          </button>
        );
      }),
    [applyToSelection, setStrokeColor, style.strokeColor],
  );

  const fillSwatches = useMemo(
    () =>
      FILL_COLORS.map((entry) => {
        const isActive = style.fillColor === entry.value;
        return (
          <button
            key={entry.label}
            type="button"
            onClick={() => setFillColor(entry.value, { applyToSelection })}
            aria-label={`Fill ${entry.label}`}
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-full border transition',
              isActive
                ? 'border-primary shadow-lg shadow-primary/20'
                : 'border-border/60 hover:border-primary/60 hover:shadow-sm',
            )}
          >
            {entry.value ? (
              <span
                className="h-6 w-6 rounded-full border border-border/40"
                style={{ backgroundColor: entry.value }}
              />
            ) : (
              <span className="relative flex h-6 w-6 items-center justify-center rounded-full border border-border/40 bg-white">
                <span className="absolute h-[2px] w-7 rotate-45 rounded-full bg-border/80" />
              </span>
            )}
          </button>
        );
      }),
    [applyToSelection, setFillColor, style.fillColor],
  );

  const strokeWidthControls = useMemo(
    () =>
      STROKE_WIDTHS.map((width) => {
        const isActive = Math.abs(style.strokeWidth - width) < 0.01;
        return (
          <button
            key={width}
            type="button"
            onClick={() => setStrokeWidth(width, { applyToSelection })}
            aria-label={`Stroke width ${width}`}
            className={clsx(
              'flex h-9 w-12 items-center justify-center rounded-full border transition',
              isActive
                ? 'border-primary shadow-lg shadow-primary/20 bg-primary/5'
                : 'border-border/60 hover:border-primary/60 hover:bg-muted',
            )}
          >
            <span
              className="rounded-full bg-foreground"
              style={{
                width: '60%',
                height: `${Math.max(2, width)}px`,
              }}
            />
          </button>
        );
      }),
    [applyToSelection, setStrokeWidth, style.strokeWidth],
  );

  return (
    <div className="pointer-events-auto flex items-center gap-6 rounded-full border border-border/70 bg-white/95 px-6 py-3 shadow-xl backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Stroke
        </span>
        <div className="flex items-center gap-2">{strokeSwatches}</div>
      </div>
      <div className="h-10 w-px bg-border/60" />
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Fill
        </span>
        <div className="flex items-center gap-2">{fillSwatches}</div>
      </div>
      <div className="h-10 w-px bg-border/60" />
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Width
        </span>
        <div className="flex items-center gap-2">{strokeWidthControls}</div>
      </div>
    </div>
  );
}
