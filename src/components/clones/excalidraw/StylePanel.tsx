'use client';

import clsx from 'clsx';
import { type ChangeEvent, useMemo } from 'react';
import { shallow } from 'zustand/shallow';

import { useElementsStore } from '@/store/excalidraw/elements-store';
import type { ArrowheadStyle, StrokeStyle } from '@/types/excalidraw/elements';

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

const STROKE_STYLES: Array<{ label: string; value: StrokeStyle }> = [
  { label: 'Solid', value: 'solid' },
  { label: 'Dashed', value: 'dashed' },
  { label: 'Dotted', value: 'dotted' },
];

const ARROWHEAD_OPTIONS: Array<{ label: string; value: ArrowheadStyle }> = [
  { label: 'None', value: 'none' },
  { label: 'Arrow', value: 'arrow' },
  { label: 'Dot', value: 'dot' },
  { label: 'Bar', value: 'bar' },
];

export function StylePanel() {
  const {
    style,
    selectedIds,
    theme,
    setStrokeColor,
    setFillColor,
    setStrokeWidth,
    setStrokeStyle,
    setArrowheads,
    setOpacity,
  } = useElementsStore(
    (state) => ({
      style: state.style,
      selectedIds: state.selectedElementIds,
      theme: state.theme,
      setStrokeColor: state.actions.setStrokeColor,
      setFillColor: state.actions.setFillColor,
      setStrokeWidth: state.actions.setStrokeWidth,
      setStrokeStyle: state.actions.setStrokeStyle,
      setArrowheads: state.actions.setArrowheads,
      setOpacity: state.actions.setOpacity,
    }),
    shallow,
  );

  const applyToSelection = selectedIds.length > 0;
  const isDark = theme === 'dark';

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
                : clsx(
                    isDark
                      ? 'border-slate-600 bg-slate-800 hover:border-primary/50'
                      : 'border-border/60 hover:border-primary/60',
                    'hover:shadow-sm',
                  ),
            )}
          >
            <span className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
          </button>
        );
      }),
    [applyToSelection, isDark, setStrokeColor, style.strokeColor],
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
                : clsx(
                    isDark
                      ? 'border-slate-600 bg-slate-800 hover:border-primary/50'
                      : 'border-border/60 hover:border-primary/60',
                    'hover:shadow-sm',
                  ),
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
    [applyToSelection, isDark, setFillColor, style.fillColor],
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
                : clsx(
                    isDark
                      ? 'border-slate-600 bg-slate-800 hover:border-primary/50 hover:bg-slate-700/60'
                      : 'border-border/60 hover:border-primary/60 hover:bg-muted',
                  ),
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
    [applyToSelection, isDark, setStrokeWidth, style.strokeWidth],
  );

  const strokeStyleControls = useMemo(
    () =>
      STROKE_STYLES.map((entry) => {
        const isActive = style.strokeStyle === entry.value;
        return (
          <button
            key={entry.value}
            type="button"
            onClick={() => setStrokeStyle(entry.value, { applyToSelection })}
            className={clsx(
              'flex h-9 items-center justify-center rounded-full border px-3 text-xs font-semibold uppercase tracking-wide transition',
              isActive
                ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                : isDark
                  ? 'border-slate-600 bg-slate-800 text-slate-200 hover:border-primary/50 hover:bg-slate-700/60'
                  : 'border-border/60 text-muted-foreground hover:border-primary/60 hover:bg-muted/40',
            )}
          >
            {entry.label}
          </button>
        );
      }),
    [applyToSelection, isDark, setStrokeStyle, style.strokeStyle],
  );

  const arrowheadControls = useMemo(
    () => ({
      start: ARROWHEAD_OPTIONS.map((option) => {
        const isActive = style.startArrowhead === option.value;
        return (
          <button
            key={`start-${option.value}`}
            type="button"
            onClick={() =>
              setArrowheads(
                { start: option.value, end: style.endArrowhead },
                { applyToSelection },
              )
            }
            className={clsx(
              'flex h-8 items-center justify-center rounded-full border px-3 text-[0.65rem] font-semibold uppercase tracking-wide transition',
              isActive
                ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                : isDark
                  ? 'border-slate-600 bg-slate-800 text-slate-200 hover:border-primary/50 hover:bg-slate-700/60'
                  : 'border-border/60 text-muted-foreground hover:border-primary/60 hover:bg-muted/40',
            )}
          >
            {option.label}
          </button>
        );
      }),
      end: ARROWHEAD_OPTIONS.map((option) => {
        const isActive = style.endArrowhead === option.value;
        return (
          <button
            key={`end-${option.value}`}
            type="button"
            onClick={() =>
              setArrowheads(
                { start: style.startArrowhead, end: option.value },
                { applyToSelection },
              )
            }
            className={clsx(
              'flex h-8 items-center justify-center rounded-full border px-3 text-[0.65rem] font-semibold uppercase tracking-wide transition',
              isActive
                ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
                : isDark
                  ? 'border-slate-600 bg-slate-800 text-slate-200 hover:border-primary/50 hover:bg-slate-700/60'
                  : 'border-border/60 text-muted-foreground hover:border-primary/60 hover:bg-muted/40',
            )}
          >
            {option.label}
          </button>
        );
      }),
    }),
    [applyToSelection, isDark, setArrowheads, style.endArrowhead, style.startArrowhead],
  );

  const opacityPercent = Math.round(style.opacity * 100);

  const handleOpacityChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextValue = Number(event.target.value) / 100;
    setOpacity(nextValue, { applyToSelection });
  };

  const panelClass = clsx(
    'pointer-events-auto flex items-center gap-6 rounded-full border px-6 py-3 shadow-xl backdrop-blur transition-colors',
    isDark
      ? 'border-slate-700 bg-slate-900/85 text-slate-100'
      : 'border-border/70 bg-white/95',
  );

  const labelClass = clsx(
    'text-xs font-semibold uppercase tracking-wide',
    isDark ? 'text-slate-300' : 'text-muted-foreground',
  );

  const dividerClass = clsx('h-10 w-px', isDark ? 'bg-slate-700/80' : 'bg-border/60');

  const subLabelClass = clsx(
    'text-[0.65rem] uppercase tracking-wide',
    isDark ? 'text-slate-400' : 'text-muted-foreground',
  );

  return (
    <div className={panelClass}>
      <div className="flex items-center gap-3">
        <span className={labelClass}>Stroke</span>
        <div className="flex items-center gap-2">{strokeSwatches}</div>
      </div>
      <div className={dividerClass} />
      <div className="flex items-center gap-3">
        <span className={labelClass}>Fill</span>
        <div className="flex items-center gap-2">{fillSwatches}</div>
      </div>
      <div className={dividerClass} />
      <div className="flex items-center gap-3">
        <span className={labelClass}>Width</span>
        <div className="flex items-center gap-2">{strokeWidthControls}</div>
      </div>
      <div className={dividerClass} />
      <div className="flex items-center gap-3">
        <span className={labelClass}>Style</span>
        <div className="flex items-center gap-2">{strokeStyleControls}</div>
      </div>
      <div className={dividerClass} />
      <div className="flex items-center gap-3">
        <span className={labelClass}>Arrowheads</span>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className={clsx(subLabelClass, 'opacity-80')}>Start</span>
            <div className="flex items-center gap-1">{arrowheadControls.start}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={clsx(subLabelClass, 'opacity-80')}>End</span>
            <div className="flex items-center gap-1">{arrowheadControls.end}</div>
          </div>
        </div>
      </div>
      <div className={dividerClass} />
      <div className="flex items-center gap-3">
        <span className={labelClass}>Opacity</span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={opacityPercent}
            onChange={handleOpacityChange}
            className="h-1 w-32 accent-primary"
          />
          <span
            className={clsx(
              'text-xs font-semibold',
              isDark ? 'text-slate-200' : 'text-muted-foreground',
            )}
          >
            {opacityPercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
