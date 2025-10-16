'use client';

import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { shallow } from '@/lib/zustand/shallow';

import { CanvasStage } from '@/components/clones/excalidraw/CanvasStage';
import { StylePanel } from '@/components/clones/excalidraw/StylePanel';
import { ToolBar } from '@/components/clones/excalidraw/ToolBar';
import {
  createClipboardPayload,
  EXCALIDRAW_CLIPBOARD_MIME,
} from '@/lib/excalidraw/clipboard';
import { getElementsStore, useElementsStore } from '@/store/excalidraw/elements-store';
import { ToolMode } from '@/types/excalidraw/elements';

const commandItems: Array<{ label: string; shortcut?: string }> = [
  { label: 'Open…', shortcut: '⌘O' },
  { label: 'Save as…', shortcut: '⌘⇧S' },
  { label: 'Export image', shortcut: '⌘E' },
  { label: 'Live collaboration' },
  { label: 'Command palette', shortcut: '⌘K' },
  { label: 'Help & shortcuts', shortcut: '?' },
];

const backgroundSwatches = [
  '#FDFCF8',
  '#FFFFFF',
  '#F1F5F9',
  '#E2E8F0',
  '#EDE9FE',
  '#FDE68A',
  '#0F172A',
];

const languageOptions = ['English', '한국어'];

const topActions = ['Share', 'Library'];

const toolLabels: Record<ToolMode, string> = {
  selection: 'Selection',
  hand: 'Hand / Pan',
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  diamond: 'Diamond',
  arrow: 'Arrow',
  line: 'Line',
  draw: 'Free Draw',
  text: 'Text',
  image: 'Image',
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const isEditableTarget = (target: EventTarget | null) => {
  if (typeof window === 'undefined') {
    return false;
  }
  if (!target || !(target instanceof HTMLElement)) {
    return false;
  }
  if (target.isContentEditable) {
    return true;
  }
  const tagName = target.tagName;
  if (tagName === 'INPUT' || tagName === 'TEXTAREA') {
    const element = target as HTMLInputElement | HTMLTextAreaElement;
    return !element.readOnly && !element.disabled;
  }
  return Boolean(target.closest('input, textarea, [contenteditable="true"]'));
};

export function ExcalidrawApp() {
  const {
    tool,
    camera,
    isLocked,
    selectedIds,
    theme,
    showGrid,
    canvasBackground,
    pointer,
    setCamera,
    setCanvasLocked,
    setTheme,
    toggleGrid,
    setCanvasBackground,
    bringToFront,
    sendToBack,
  } = useElementsStore(
    (state) => ({
      tool: state.tool,
      camera: state.camera,
      isLocked: state.isCanvasLocked,
      selectedIds: state.selectedElementIds,
      theme: state.theme,
      showGrid: state.showGrid,
      canvasBackground: state.canvasBackground,
      pointer: state.pointer,
      setCamera: state.actions.setCamera,
      setCanvasLocked: state.actions.setCanvasLocked,
      setTheme: state.actions.setTheme,
      toggleGrid: state.actions.toggleGrid,
      setCanvasBackground: state.actions.setCanvasBackground,
      bringToFront: state.actions.bringToFront,
      sendToBack: state.actions.sendToBack,
    }),
    shallow,
  );

  const [language, setLanguage] = useState('English');

  const selectedCount = selectedIds.length;
  const isDark = theme === 'dark';

  const zoomPercentage = Math.round(camera.zoom * 100);
  const sliderValue = clamp(zoomPercentage, 25, 300);
  const pointerLabel = pointer
    ? `${Math.round(pointer.x)}, ${Math.round(pointer.y)}`
    : '—, —';

  const rootClass = clsx(
    'relative flex h-[calc(100vh-6rem)] min-h-[680px] w-full overflow-hidden rounded-3xl border shadow-2xl transition-colors',
    isDark
      ? 'border-slate-800 bg-slate-950 text-slate-100'
      : 'border-border bg-[#FDFCF8] text-foreground',
  );

  const sidebarClass = clsx(
    'flex w-72 flex-col border-r p-6 backdrop-blur transition-colors',
    isDark ? 'border-slate-800 bg-slate-900/70' : 'border-border/60 bg-white/70',
  );

  const commandButtonClass = clsx(
    'flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm font-medium transition',
    isDark
      ? 'border-slate-700/70 bg-slate-900/70 text-slate-200 hover:border-primary/50 hover:bg-slate-800/80'
      : 'border-border/50 bg-white/80 text-foreground hover:border-primary/40 hover:bg-muted/60',
  );

  const surfaceClass = isDark
    ? 'border-slate-700 bg-slate-900/80 text-slate-100'
    : 'border-border/70 bg-white/95 text-foreground';

  const subtleTextClass = isDark ? 'text-slate-300' : 'text-muted-foreground';

  const pillClass = (active = false) =>
    clsx(
      'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition',
      active
        ? 'border-primary bg-primary/10 text-primary shadow-lg shadow-primary/20'
        : isDark
          ? 'border-slate-600 bg-slate-800 text-slate-200 hover:border-primary/60 hover:bg-slate-700/60'
          : 'border-border bg-white text-muted-foreground hover:border-primary/60 hover:bg-muted',
    );

  const iconButtonClass = clsx(
    'rounded-full border px-2 py-1 text-xs transition',
    isDark
      ? 'border-slate-600 bg-slate-800 text-slate-200 hover:border-primary/60 hover:bg-slate-700/60'
      : 'border-border bg-white text-muted-foreground hover:border-primary/60 hover:bg-muted',
  );

  const statusHeadline =
    selectedCount > 0
      ? `${selectedCount} element${selectedCount > 1 ? 's' : ''} selected`
      : `Active tool: ${toolLabels[tool]}`;

  const toggleLock = () => setCanvasLocked(!isLocked);

  const handleZoom = (direction: 'in' | 'out') => {
    const multiplier = direction === 'in' ? 1.1 : 1 / 1.1;
    const next = clamp(Number((camera.zoom * multiplier).toFixed(3)), 0.25, 3);
    setCamera({ zoom: next });
  };

  const handleResetView = () => {
    setCamera({ zoom: 1, offset: { x: 0, y: 0 } });
  };

  const handleZoomSlider = (value: number) => {
    const next = clamp(Number((value / 100).toFixed(3)), 0.25, 3);
    setCamera({ zoom: next });
  };

  useEffect(() => {
    const store = getElementsStore();

    const copySelection = (
      event: ClipboardEvent,
      options?: { deleteAfter?: boolean },
    ) => {
      if (isEditableTarget(event.target)) {
        return;
      }
      const selection = typeof window !== 'undefined' ? window.getSelection?.() : null;
      if (selection && selection.toString()) {
        return;
      }
      const state = store.getState();
      const { selectedElementIds, elements, actions, isCanvasLocked } = state;
      if (!selectedElementIds.length) {
        return;
      }
      if (options?.deleteAfter && isCanvasLocked) {
        return;
      }
      const selectedSet = new Set(selectedElementIds);
      const selectedElements = elements.filter((element) => selectedSet.has(element.id));
      if (!selectedElements.length) {
        return;
      }
      actions.setClipboard(selectedElements);
      const payload = createClipboardPayload(selectedElements);
      const serialized = JSON.stringify(payload);
      const clipboardData = event.clipboardData;
      let handled = false;
      if (clipboardData) {
        try {
          clipboardData.setData(EXCALIDRAW_CLIPBOARD_MIME, serialized);
          clipboardData.setData('text/plain', serialized);
          handled = true;
        } catch {
          // Ignore clipboard write errors.
        }
      } else if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(serialized).catch(() => {});
        handled = true;
      }
      if (handled) {
        event.preventDefault();
      }
      if (options?.deleteAfter) {
        actions.removeElements(selectedElementIds);
      }
    };

    const handleCopy = (event: ClipboardEvent) => {
      copySelection(event);
    };

    const handleCut = (event: ClipboardEvent) => {
      copySelection(event, { deleteAfter: true });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return;
      }
      const state = store.getState();
      const { actions, selectedElementIds, isCanvasLocked } = state;
      const key = event.key;
      const lowerKey = key.toLowerCase();
      const metaKey = event.metaKey || event.ctrlKey;

      if (metaKey && lowerKey === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          actions.redo();
        } else {
          actions.undo();
        }
        return;
      }

      if (metaKey && lowerKey === 'y') {
        event.preventDefault();
        actions.redo();
        return;
      }

      if (
        (key === 'Delete' || key === 'Backspace') &&
        !event.metaKey &&
        !event.ctrlKey &&
        !event.altKey
      ) {
        if (!selectedElementIds.length || isCanvasLocked) {
          return;
        }
        event.preventDefault();
        actions.removeElements(selectedElementIds);
        return;
      }

      const arrowKeys = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']);

      if (arrowKeys.has(key)) {
        if (metaKey) {
          return;
        }
        if (!selectedElementIds.length || isCanvasLocked) {
          return;
        }
        event.preventDefault();
        const step = event.shiftKey ? 10 : 1;
        let deltaX = 0;
        let deltaY = 0;
        switch (key) {
          case 'ArrowUp':
            deltaY = -step;
            break;
          case 'ArrowDown':
            deltaY = step;
            break;
          case 'ArrowLeft':
            deltaX = -step;
            break;
          case 'ArrowRight':
            deltaX = step;
            break;
          default:
            break;
        }
        if (deltaX || deltaY) {
          actions.translateElements(selectedElementIds, { x: deltaX, y: deltaY });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('copy', handleCopy);
    window.addEventListener('cut', handleCut);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('cut', handleCut);
    };
  }, []);

  return (
    <div className={rootClass} style={{ backgroundColor: canvasBackground }}>
      <aside className={sidebarClass}>
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            className={clsx(
              'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition',
              isDark
                ? 'border-slate-700 bg-slate-900/80 text-slate-200 hover:border-primary/50 hover:bg-slate-800'
                : 'border-border bg-white text-muted-foreground hover:border-primary/40 hover:bg-muted',
            )}
            aria-label="Open command menu"
          >
            ☰
          </button>
          <h2
            className={clsx(
              'text-sm font-semibold uppercase tracking-wide',
              subtleTextClass,
            )}
          >
            Command Menu
          </h2>
        </div>
        <nav className="space-y-2">
          {commandItems.map(({ label, shortcut }) => (
            <button key={label} type="button" className={commandButtonClass}>
              <span>{label}</span>
              {shortcut ? (
                <span className={clsx('text-xs font-semibold', subtleTextClass)}>
                  {shortcut}
                </span>
              ) : null}
            </button>
          ))}
        </nav>
        <div className="mt-6 space-y-6 text-sm">
          <section>
            <h3
              className={clsx(
                'text-xs font-semibold uppercase tracking-wide',
                subtleTextClass,
              )}
            >
              Theme &amp; Display
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={pillClass(theme === 'light')}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={pillClass(theme === 'dark')}
              >
                Dark
              </button>
              <button type="button" onClick={toggleGrid} className={pillClass(showGrid)}>
                Grid {showGrid ? 'On' : 'Off'}
              </button>
            </div>
          </section>
          <section>
            <h3
              className={clsx(
                'text-xs font-semibold uppercase tracking-wide',
                subtleTextClass,
              )}
            >
              Language
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {languageOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setLanguage(option)}
                  className={pillClass(language === option)}
                >
                  {option}
                </button>
              ))}
            </div>
          </section>
          <section>
            <h3
              className={clsx(
                'text-xs font-semibold uppercase tracking-wide',
                subtleTextClass,
              )}
            >
              Canvas Background
            </h3>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {backgroundSwatches.map((color) => {
                const isActive = canvasBackground === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setCanvasBackground(color)}
                    aria-label={`Canvas background ${color}`}
                    className={clsx(
                      'flex h-10 w-10 items-center justify-center rounded-full border transition',
                      isActive
                        ? 'border-primary shadow-lg shadow-primary/20'
                        : isDark
                          ? 'border-slate-600 bg-slate-800 hover:border-primary/60'
                          : 'border-border/60 bg-white hover:border-primary/60',
                    )}
                  >
                    <span
                      className="h-8 w-8 rounded-full border border-white/40"
                      style={{ backgroundColor: color }}
                    />
                  </button>
                );
              })}
            </div>
          </section>
        </div>
        <div
          className={clsx(
            'mt-auto rounded-xl border border-dashed p-4 text-xs transition-colors',
            isDark
              ? 'border-slate-700 bg-slate-900/70 text-slate-300'
              : 'border-border/70 bg-muted/50 text-muted-foreground',
          )}
        >
          Future live collaboration controls appear here.
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col bg-transparent transition-colors">
        <CanvasStage />

        <div className="pointer-events-none absolute left-1/2 top-6 z-20 flex -translate-x-1/2">
          <div className="pointer-events-auto">
            <ToolBar />
          </div>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-28 z-20 flex -translate-x-1/2">
          <StylePanel />
        </div>

        <div className="pointer-events-none absolute right-6 top-6 z-20 flex gap-3">
          {topActions.map((action) => (
            <button
              key={action}
              type="button"
              className={clsx(
                'pointer-events-auto rounded-full border px-4 py-2 text-sm font-medium shadow-lg transition',
                isDark
                  ? 'border-slate-700 bg-slate-900/85 text-slate-200 hover:bg-slate-800'
                  : 'border-border/70 bg-white/90 text-foreground hover:bg-white',
              )}
            >
              {action}
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-6 left-6 z-20">
          <div
            className={clsx(
              'pointer-events-auto flex items-center gap-4 rounded-full border px-4 py-2 shadow-lg transition',
              surfaceClass,
            )}
          >
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleZoom('out')}
                className={iconButtonClass}
              >
                −
              </button>
              <input
                type="range"
                min={25}
                max={300}
                step={5}
                value={sliderValue}
                onChange={(event) => handleZoomSlider(Number(event.target.value))}
                className="h-1 w-36 accent-primary"
                aria-label="Zoom"
              />
              <button
                type="button"
                onClick={() => handleZoom('in')}
                className={iconButtonClass}
              >
                ＋
              </button>
              <span className={clsx('text-xs font-semibold', subtleTextClass)}>
                {zoomPercentage}%
              </span>
            </div>
            <div className="flex items-center gap-2 pl-2">
              <button type="button" onClick={handleResetView} className={pillClass()}>
                Reset
              </button>
              <button
                type="button"
                onClick={() => setCamera({ offset: { x: 0, y: 0 } })}
                className={pillClass()}
              >
                Center
              </button>
              <button type="button" onClick={toggleGrid} className={pillClass(showGrid)}>
                Grid {showGrid ? 'On' : 'Off'}
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6 z-20 flex flex-col items-end gap-3">
          <button
            type="button"
            onClick={toggleLock}
            className={clsx(
              'pointer-events-auto rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide shadow-lg transition',
              isLocked
                ? 'border-transparent bg-primary/90 text-white'
                : isDark
                  ? 'border-slate-600 bg-slate-800 text-slate-200 hover:border-primary/60 hover:bg-slate-700/60'
                  : 'border-border/70 bg-white/90 text-muted-foreground hover:bg-white',
            )}
          >
            {isLocked ? 'Canvas locked' : 'Canvas unlocked'}
          </button>
          <div
            className={clsx(
              'pointer-events-auto flex items-center gap-2 rounded-full border px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide shadow-md transition',
              surfaceClass,
            )}
          >
            <button
              type="button"
              onClick={() => (selectedIds.length ? bringToFront(selectedIds) : null)}
              disabled={!selectedIds.length}
              className={clsx(
                'rounded-full border border-transparent px-2 py-1 transition',
                selectedIds.length
                  ? isDark
                    ? 'hover:border-primary/60 hover:bg-slate-700/60'
                    : 'hover:border-border'
                  : 'opacity-40',
              )}
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => (selectedIds.length ? sendToBack(selectedIds) : null)}
              disabled={!selectedIds.length}
              className={clsx(
                'rounded-full border border-transparent px-2 py-1 transition',
                selectedIds.length
                  ? isDark
                    ? 'hover:border-primary/60 hover:bg-slate-700/60'
                    : 'hover:border-border'
                  : 'opacity-40',
              )}
            >
              Back
            </button>
          </div>
          <div
            className={clsx(
              'pointer-events-none rounded-full border px-4 py-2 text-xs shadow-md transition',
              surfaceClass,
            )}
          >
            <div className="font-semibold">{statusHeadline}</div>
            <div
              className={clsx(
                'mt-1 text-[0.65rem] uppercase tracking-wide',
                subtleTextClass,
              )}
            >
              Pointer {pointerLabel}
            </div>
          </div>
          <div
            className={clsx(
              'pointer-events-none flex h-28 w-36 items-center justify-center rounded-xl border text-xs font-semibold uppercase tracking-wide transition',
              isDark
                ? 'border-slate-700 bg-slate-900/85 text-slate-400'
                : 'border-border/70 bg-white/85 text-muted-foreground',
            )}
          >
            Minimap (preview)
          </div>
        </div>
      </div>
    </div>
  );
}
