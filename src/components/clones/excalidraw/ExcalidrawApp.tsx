'use client';

import { useEffect } from 'react';
import { shallow } from 'zustand/shallow';

import { CanvasStage } from '@/components/clones/excalidraw/CanvasStage';
import { StylePanel } from '@/components/clones/excalidraw/StylePanel';
import { ToolBar } from '@/components/clones/excalidraw/ToolBar';
import {
  createClipboardPayload,
  EXCALIDRAW_CLIPBOARD_MIME,
} from '@/lib/excalidraw/clipboard';
import { getElementsStore, useElementsStore } from '@/store/excalidraw/elements-store';
import { ToolMode } from '@/types/excalidraw/elements';

const sidebarItems = [
  'Open...',
  'Save to...',
  'Export image',
  'Live collaboration',
  'Command palette',
  'Canvas background',
  'Help & shortcuts',
];

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
    setCamera,
    setCanvasLocked,
    bringToFront,
    sendToBack,
  } = useElementsStore(
    (state) => ({
      tool: state.tool,
      camera: state.camera,
      isLocked: state.isCanvasLocked,
      selectedIds: state.selectedElementIds,
      setCamera: state.actions.setCamera,
      setCanvasLocked: state.actions.setCanvasLocked,
      bringToFront: state.actions.bringToFront,
      sendToBack: state.actions.sendToBack,
    }),
    shallow,
  );

  const selectedCount = selectedIds.length;

  const zoomPercentage = Math.round(camera.zoom * 100);

  const toggleLock = () => setCanvasLocked(!isLocked);

  const handleZoom = (direction: 'in' | 'out') => {
    const multiplier = direction === 'in' ? 1.1 : 1 / 1.1;
    const next = clamp(Number((camera.zoom * multiplier).toFixed(3)), 0.25, 3);
    setCamera({ zoom: next });
  };

  const handleResetView = () => {
    setCamera({ zoom: 1, offset: { x: 0, y: 0 } });
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
    <div className="relative flex h-[calc(100vh-6rem)] min-h-[680px] w-full overflow-hidden rounded-3xl border border-border bg-[#FDFCF8] shadow-2xl">
      <aside className="flex w-64 flex-col border-r border-border/60 bg-white/70 p-6 backdrop-blur">
        <div className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Command Menu
          </h2>
        </div>
        <nav className="space-y-2 text-sm text-muted-foreground">
          {sidebarItems.map((item) => (
            <button
              key={item}
              type="button"
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-medium text-foreground transition hover:bg-muted"
            >
              <span>{item}</span>
              <span className="text-xs text-muted-foreground/70">⌘K</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-dashed border-border/70 bg-muted/50 p-4 text-xs text-muted-foreground">
          Future live collaboration controls appear here.
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col bg-transparent">
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
              className="pointer-events-auto rounded-full border border-border/70 bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg transition hover:bg-white"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-6 left-6 z-20">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/70 bg-white/95 px-4 py-2 text-sm shadow-lg">
            <button
              type="button"
              onClick={() => handleZoom('out')}
              className="rounded-full border border-border bg-white px-2 py-1 text-xs transition hover:bg-muted"
            >
              −
            </button>
            <span className="font-semibold text-foreground">{zoomPercentage}%</span>
            <button
              type="button"
              onClick={() => handleZoom('in')}
              className="rounded-full border border-border bg-white px-2 py-1 text-xs transition hover:bg-muted"
            >
              ＋
            </button>
            <div className="flex items-center gap-2 pl-3 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={handleResetView}
                className="rounded-full border border-transparent px-2 py-1 transition hover:border-border"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setCamera({ offset: { x: 0, y: 0 } })}
                className="rounded-full border border-transparent px-2 py-1 transition hover:border-border"
              >
                Center
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6 z-20 flex flex-col items-end gap-3">
          <button
            type="button"
            onClick={toggleLock}
            className={`pointer-events-auto rounded-full border border-border/70 px-4 py-2 text-xs font-medium uppercase tracking-wide shadow-lg transition ${
              isLocked
                ? 'bg-primary/90 text-white'
                : 'bg-white/90 text-muted-foreground hover:bg-white'
            }`}
          >
            {isLocked ? 'Canvas locked' : 'Canvas unlocked'}
          </button>
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/70 bg-white/90 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-wide shadow-md">
            <button
              type="button"
              onClick={() => (selectedIds.length ? bringToFront(selectedIds) : null)}
              disabled={!selectedIds.length}
              className="rounded-full border border-transparent px-2 py-1 transition enabled:hover:border-border disabled:opacity-40"
            >
              Front
            </button>
            <button
              type="button"
              onClick={() => (selectedIds.length ? sendToBack(selectedIds) : null)}
              disabled={!selectedIds.length}
              className="rounded-full border border-transparent px-2 py-1 transition enabled:hover:border-border disabled:opacity-40"
            >
              Back
            </button>
          </div>
          <div className="pointer-events-none rounded-full border border-border/60 bg-white/90 px-4 py-1 text-xs text-muted-foreground shadow-md">
            {selectedCount > 0
              ? `${selectedCount} element${selectedCount > 1 ? 's' : ''} selected`
              : `Active tool: ${toolLabels[tool]}`}
          </div>
        </div>
      </div>
    </div>
  );
}
