'use client';

import { useCallback, useRef } from 'react';
import { Draft, produce } from 'immer';
import { v4 as uuid } from 'uuid';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import {
  ArrowheadStyle,
  CameraState,
  ElementStyle,
  ExcalidrawElement,
  HistorySnapshot,
  Point,
  StrokeStyle,
  ToolMode,
} from '@/types/excalidraw/elements';

type ClipboardState = {
  elements: ExcalidrawElement[];
  createdAt: number;
};

type ViewportSize = {
  width: number;
  height: number;
};

type ElementsStoreState = {
  elements: ExcalidrawElement[];
  selectedElementIds: string[];
  tool: ToolMode;
  isToolLocked: boolean;
  isCanvasLocked: boolean;
  camera: CameraState;
  viewport: ViewportSize;
  style: ElementStyle;
  clipboard: ClipboardState | null;
  theme: 'light' | 'dark';
  showGrid: boolean;
  canvasBackground: string;
  pointer: Point | null;
  history: {
    past: HistorySnapshot[];
    future: HistorySnapshot[];
    limit: number;
  };
  actions: {
    setTool: (tool: ToolMode) => void;
    setToolLock: (value: boolean) => void;
    setCanvasLocked: (value: boolean) => void;
    setCamera: (partial: Partial<CameraState>) => void;
    setViewport: (size: ViewportSize) => void;
    setElements: (elements: ExcalidrawElement[]) => void;
    addElement: (element: ExcalidrawElement) => void;
    updateElement: (
      id: string,
      updater: (element: ExcalidrawElement) => ExcalidrawElement,
    ) => void;
    removeElement: (id: string) => void;
    removeElements: (ids: string[]) => void;
    selectElements: (ids: string[]) => void;
    clearSelection: () => void;
    toggleSelection: (id: string) => void;
    bringToFront: (ids: string[]) => void;
    sendToBack: (ids: string[]) => void;
    translateElements: (ids: string[], delta: Point) => void;
    insertElements: (
      elements: ExcalidrawElement[],
      options?: { offset?: Point; select?: boolean },
    ) => ExcalidrawElement[];
    setClipboard: (elements: ExcalidrawElement[] | null) => void;
    setPointer: (point: Point | null) => void;
    setStrokeStyle: (
      style: StrokeStyle,
      options?: { applyToSelection?: boolean },
    ) => void;
    setArrowheads: (
      arrowheads: { start: ArrowheadStyle; end: ArrowheadStyle },
      options?: { applyToSelection?: boolean },
    ) => void;
    setOpacity: (opacity: number, options?: { applyToSelection?: boolean }) => void;
    setTheme: (theme: 'light' | 'dark') => void;
    toggleGrid: () => void;
    setCanvasBackground: (color: string) => void;
    undo: () => boolean;
    redo: () => boolean;
    resetHistory: () => void;
    setStrokeColor: (color: string, options?: { applyToSelection?: boolean }) => void;
    setFillColor: (
      color: string | null,
      options?: { applyToSelection?: boolean },
    ) => void;
    setStrokeWidth: (width: number, options?: { applyToSelection?: boolean }) => void;
  };
};

const initialCamera: CameraState = {
  zoom: 1,
  offset: { x: 0, y: 0 },
};

const structuredCloneFn: typeof structuredClone | undefined =
  typeof globalThis !== 'undefined'
    ? (globalThis as typeof globalThis & { structuredClone?: typeof structuredClone })
        .structuredClone
    : undefined;

const deepClone = <T>(value: T): T => {
  if (structuredCloneFn) {
    return structuredCloneFn(value);
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const randomSeed = () => Math.floor(Math.random() * 10_000);

const cloneElements = (elements: ExcalidrawElement[], offset: Point = { x: 0, y: 0 }) => {
  const timestamp = Date.now();
  return elements.map((element) => {
    const clone = deepClone(element);
    clone.id = uuid();
    clone.seed = randomSeed();
    clone.createdAt = timestamp;
    clone.updatedAt = timestamp;
    clone.position = {
      x: clone.position.x + offset.x,
      y: clone.position.y + offset.y,
    };
    return clone;
  });
};

const createSnapshot = (state: ElementsStoreState): HistorySnapshot => ({
  elements: deepClone(state.elements),
  selectedElementIds: [...state.selectedElementIds],
  camera: { ...state.camera },
});

const applySnapshot = (draft: Draft<ElementsStoreState>, snapshot: HistorySnapshot) => {
  draft.elements = deepClone(snapshot.elements);
  draft.selectedElementIds = [...snapshot.selectedElementIds];
  draft.camera = { ...snapshot.camera };
};

const pushHistoryDraft = (
  draft: Draft<ElementsStoreState>,
  snapshot: HistorySnapshot,
) => {
  const { past, limit } = draft.history;
  if (snapshot.elements === draft.elements) {
    return;
  }
  if (past.length >= limit) {
    past.shift();
  }
  past.push(snapshot);
  draft.history.future = [];
};

const createElementsStore = () =>
  createStore<ElementsStoreState>((set, get) => ({
    elements: [],
    selectedElementIds: [],
    tool: 'selection',
    isToolLocked: false,
    isCanvasLocked: false,
    camera: {
      ...initialCamera,
      offset: { ...initialCamera.offset },
    },
    viewport: {
      width: 0,
      height: 0,
    },
    style: {
      strokeColor: '#1F2937',
      fillColor: null,
      strokeWidth: 2,
      strokeStyle: 'solid',
      opacity: 1,
      startArrowhead: 'none',
      endArrowhead: 'arrow',
    },
    clipboard: null,
    theme: 'light',
    showGrid: true,
    canvasBackground: '#FDFCF8',
    pointer: null,
    history: {
      past: [],
      future: [],
      limit: 50,
    },
    actions: {
      setTool: (tool) => set({ tool }),
      setToolLock: (value) => set({ isToolLocked: value }),
      setCanvasLocked: (value) => set({ isCanvasLocked: value }),
      setCamera: (partial) =>
        set(
          produce<ElementsStoreState>((draft) => {
            draft.camera = { ...draft.camera, ...partial };
          }),
        ),
      setViewport: (size) =>
        set(
          produce<ElementsStoreState>((draft) => {
            if (
              draft.viewport.width === size.width &&
              draft.viewport.height === size.height
            ) {
              return;
            }
            draft.viewport = { ...size };
          }),
        ),
      setElements: (elements) => {
        const snapshot = createSnapshot(get());
        set(
          produce<ElementsStoreState>((draft) => {
            pushHistoryDraft(draft, snapshot);
            draft.elements = deepClone(elements);
            draft.selectedElementIds = [];
          }),
        );
      },
      addElement: (element) => {
        const now = Date.now();
        const prepared: ExcalidrawElement = { ...element, updatedAt: now };
        const snapshot = createSnapshot(get());
        set(
          produce<ElementsStoreState>((draft) => {
            pushHistoryDraft(draft, snapshot);
            draft.elements.push(prepared);
            draft.selectedElementIds = [prepared.id];
          }),
        );
      },
      updateElement: (id, updater) => {
        const snapshot = createSnapshot(get());
        set(
          produce<ElementsStoreState>((draft) => {
            const index = draft.elements.findIndex((element) => element.id === id);
            if (index === -1) {
              return;
            }
            pushHistoryDraft(draft, snapshot);
            const current = draft.elements[index];
            draft.elements[index] = { ...updater(current), updatedAt: Date.now() };
          }),
        );
      },
      removeElement: (id) => {
        if (!id) {
          return;
        }
        get().actions.removeElements([id]);
      },
      removeElements: (ids) => {
        const uniqueIds = Array.from(new Set(ids));
        if (!uniqueIds.length) {
          return;
        }
        const snapshot = createSnapshot(get());
        set(
          produce<ElementsStoreState>((draft) => {
            const idSet = new Set(uniqueIds);
            let removed = false;
            draft.elements = draft.elements.filter((element) => {
              if (idSet.has(element.id)) {
                removed = true;
                return false;
              }
              return true;
            });
            if (!removed) {
              return;
            }
            pushHistoryDraft(draft, snapshot);
            draft.selectedElementIds = draft.selectedElementIds.filter(
              (selectedId) => !idSet.has(selectedId),
            );
          }),
        );
      },
      selectElements: (ids) =>
        set(
          produce<ElementsStoreState>((draft) => {
            draft.selectedElementIds = Array.from(new Set(ids));
          }),
        ),
      clearSelection: () =>
        set(
          produce<ElementsStoreState>((draft) => {
            draft.selectedElementIds = [];
          }),
        ),
      toggleSelection: (id) =>
        set(
          produce<ElementsStoreState>((draft) => {
            if (draft.selectedElementIds.includes(id)) {
              draft.selectedElementIds = draft.selectedElementIds.filter(
                (selectedId) => selectedId !== id,
              );
            } else {
              draft.selectedElementIds.push(id);
            }
          }),
        ),
      translateElements: (ids, delta) => {
        const uniqueIds = Array.from(new Set(ids));
        if (!uniqueIds.length || (!delta.x && !delta.y)) {
          return;
        }
        const snapshot = createSnapshot(get());
        set(
          produce<ElementsStoreState>((draft) => {
            const idSet = new Set(uniqueIds);
            const timestamp = Date.now();
            let changed = false;
            draft.elements.forEach((element, index) => {
              if (!idSet.has(element.id)) {
                return;
              }
              changed = true;
              draft.elements[index] = {
                ...element,
                position: {
                  x: element.position.x + delta.x,
                  y: element.position.y + delta.y,
                },
                updatedAt: timestamp,
              };
            });
            if (!changed) {
              return;
            }
            pushHistoryDraft(draft, snapshot);
          }),
        );
      },
      insertElements: (elements, options) => {
        if (!elements.length) {
          return [];
        }
        const clones = cloneElements(elements, options?.offset ?? { x: 0, y: 0 });
        if (!clones.length) {
          return [];
        }
        const snapshot = createSnapshot(get());
        set(
          produce<ElementsStoreState>((draft) => {
            pushHistoryDraft(draft, snapshot);
            draft.elements.push(...clones);
            if (options?.select ?? true) {
              draft.selectedElementIds = clones.map((element) => element.id);
            }
          }),
        );
        return clones;
      },
      setClipboard: (elements) =>
        set(
          produce<ElementsStoreState>((draft) => {
            if (!elements || !elements.length) {
              draft.clipboard = null;
              return;
            }
            draft.clipboard = {
              elements: deepClone(elements),
              createdAt: Date.now(),
            };
          }),
        ),
      setStrokeColor: (color, options) => {
        const applyToSelection = options?.applyToSelection ?? false;
        const state = get();
        const shouldApply = applyToSelection && state.selectedElementIds.length > 0;
        const snapshot = shouldApply ? createSnapshot(state) : null;
        const timestamp = Date.now();
        set(
          produce<ElementsStoreState>((draft) => {
            draft.style.strokeColor = color;
            if (!shouldApply || !snapshot) {
              return;
            }
            const selected = new Set(draft.selectedElementIds);
            let changed = false;
            draft.elements.forEach((element, index) => {
              if (!selected.has(element.id) || element.strokeColor === color) {
                return;
              }
              if (!changed) {
                pushHistoryDraft(draft, snapshot);
                changed = true;
              }
              draft.elements[index] = {
                ...element,
                strokeColor: color,
                updatedAt: timestamp,
              };
            });
          }),
        );
      },
      setFillColor: (color, options) => {
        const applyToSelection = options?.applyToSelection ?? false;
        const state = get();
        const shouldApply = applyToSelection && state.selectedElementIds.length > 0;
        const snapshot = shouldApply ? createSnapshot(state) : null;
        const timestamp = Date.now();
        set(
          produce<ElementsStoreState>((draft) => {
            draft.style.fillColor = color;
            if (!shouldApply || !snapshot) {
              return;
            }
            const selected = new Set(draft.selectedElementIds);
            let changed = false;
            draft.elements.forEach((element, index) => {
              if (!selected.has(element.id)) {
                return;
              }
              if (
                element.type !== 'rectangle' &&
                element.type !== 'ellipse' &&
                element.type !== 'image'
              ) {
                return;
              }
              if (element.fillColor === color) {
                return;
              }
              if (!changed) {
                pushHistoryDraft(draft, snapshot);
                changed = true;
              }
              draft.elements[index] = {
                ...element,
                fillColor: color,
                updatedAt: timestamp,
              };
            });
          }),
        );
      },
      setStrokeWidth: (width, options) => {
        const applyToSelection = options?.applyToSelection ?? false;
        const state = get();
        const shouldApply = applyToSelection && state.selectedElementIds.length > 0;
        const snapshot = shouldApply ? createSnapshot(state) : null;
        const timestamp = Date.now();
        set(
          produce<ElementsStoreState>((draft) => {
            draft.style.strokeWidth = width;
            if (!shouldApply || !snapshot) {
              return;
            }
            const selected = new Set(draft.selectedElementIds);
            let changed = false;
            draft.elements.forEach((element, index) => {
              if (!selected.has(element.id) || element.strokeWidth === width) {
                return;
              }
              if (!changed) {
                pushHistoryDraft(draft, snapshot);
                changed = true;
              }
              draft.elements[index] = {
                ...element,
                strokeWidth: width,
                updatedAt: timestamp,
              };
            });
          }),
        );
      },
      setStrokeStyle: (strokeStyle, options) => {
        const applyToSelection = options?.applyToSelection ?? false;
        const state = get();
        const shouldApply = applyToSelection && state.selectedElementIds.length > 0;
        const snapshot = shouldApply ? createSnapshot(state) : null;
        const timestamp = Date.now();
        set(
          produce<ElementsStoreState>((draft) => {
            draft.style.strokeStyle = strokeStyle;
            if (!shouldApply || !snapshot) {
              return;
            }
            const selected = new Set(draft.selectedElementIds);
            let changed = false;
            draft.elements.forEach((element, index) => {
              if (!selected.has(element.id) || element.strokeStyle === strokeStyle) {
                return;
              }
              if (!changed) {
                pushHistoryDraft(draft, snapshot);
                changed = true;
              }
              draft.elements[index] = {
                ...element,
                strokeStyle,
                updatedAt: timestamp,
              };
            });
          }),
        );
      },
      setArrowheads: (arrowheads, options) => {
        const applyToSelection = options?.applyToSelection ?? false;
        const state = get();
        const shouldApply = applyToSelection && state.selectedElementIds.length > 0;
        const snapshot = shouldApply ? createSnapshot(state) : null;
        const timestamp = Date.now();
        set(
          produce<ElementsStoreState>((draft) => {
            draft.style.startArrowhead = arrowheads.start;
            draft.style.endArrowhead = arrowheads.end;
            if (!shouldApply || !snapshot) {
              return;
            }
            const selected = new Set(draft.selectedElementIds);
            let changed = false;
            draft.elements.forEach((element, index) => {
              if (!selected.has(element.id)) {
                return;
              }
              if (element.type !== 'arrow' && element.type !== 'line') {
                return;
              }
              if (
                element.startArrowhead === arrowheads.start &&
                element.endArrowhead === arrowheads.end
              ) {
                return;
              }
              if (!changed) {
                pushHistoryDraft(draft, snapshot);
                changed = true;
              }
              draft.elements[index] = {
                ...element,
                startArrowhead: arrowheads.start,
                endArrowhead: arrowheads.end,
                updatedAt: timestamp,
              };
            });
          }),
        );
      },
      setOpacity: (opacity, options) => {
        const clamped = Math.min(1, Math.max(0.1, Number(opacity.toFixed(2))));
        const applyToSelection = options?.applyToSelection ?? false;
        const state = get();
        const shouldApply = applyToSelection && state.selectedElementIds.length > 0;
        const snapshot = shouldApply ? createSnapshot(state) : null;
        const timestamp = Date.now();
        set(
          produce<ElementsStoreState>((draft) => {
            draft.style.opacity = clamped;
            if (!shouldApply || !snapshot) {
              return;
            }
            const selected = new Set(draft.selectedElementIds);
            let changed = false;
            draft.elements.forEach((element, index) => {
              if (
                !selected.has(element.id) ||
                Math.abs(element.opacity - clamped) < 0.005
              ) {
                return;
              }
              if (!changed) {
                pushHistoryDraft(draft, snapshot);
                changed = true;
              }
              draft.elements[index] = {
                ...element,
                opacity: clamped,
                updatedAt: timestamp,
              };
            });
          }),
        );
      },
      setPointer: (point) =>
        set(
          produce<ElementsStoreState>((draft) => {
            draft.pointer = point ? { ...point } : null;
          }),
        ),
      setTheme: (theme) =>
        set(
          produce<ElementsStoreState>((draft) => {
            draft.theme = theme;
          }),
        ),
      toggleGrid: () =>
        set(
          produce<ElementsStoreState>((draft) => {
            draft.showGrid = !draft.showGrid;
          }),
        ),
      setCanvasBackground: (color) =>
        set(
          produce<ElementsStoreState>((draft) => {
            draft.canvasBackground = color;
          }),
        ),
      bringToFront: (ids) =>
        set(() => {
          if (!ids.length) {
            return null;
          }
          const snapshot = createSnapshot(get());
          return produce<ElementsStoreState>((draft) => {
            pushHistoryDraft(draft, snapshot);
            const selectedSet = new Set(ids);
            const front: ExcalidrawElement[] = [];
            draft.elements = draft.elements.filter((element) => {
              if (selectedSet.has(element.id)) {
                front.push(element);
                return false;
              }
              return true;
            });
            draft.elements.push(...front);
          });
        }),
      sendToBack: (ids) =>
        set(() => {
          if (!ids.length) {
            return null;
          }
          const snapshot = createSnapshot(get());
          return produce<ElementsStoreState>((draft) => {
            pushHistoryDraft(draft, snapshot);
            const selectedSet = new Set(ids);
            const back: ExcalidrawElement[] = [];
            draft.elements = draft.elements.filter((element) => {
              if (selectedSet.has(element.id)) {
                back.push(element);
                return false;
              }
              return true;
            });
            draft.elements.unshift(...back);
          });
        }),
      undo: () => {
        const { past } = get().history;
        if (!past.length) {
          return false;
        }
        const currentSnapshot = createSnapshot(get());
        const previous = past[past.length - 1];
        set(
          produce<ElementsStoreState>((draft) => {
            const popped = draft.history.past.pop();
            if (!popped) {
              return;
            }
            draft.history.future.unshift(currentSnapshot);
            applySnapshot(draft, previous);
          }),
        );
        return true;
      },
      redo: () => {
        const { future } = get().history;
        if (!future.length) {
          return false;
        }
        const currentSnapshot = createSnapshot(get());
        const next = future[0];
        set(
          produce<ElementsStoreState>((draft) => {
            const shifted = draft.history.future.shift();
            if (!shifted) {
              return;
            }
            draft.history.past.push(currentSnapshot);
            applySnapshot(draft, next);
          }),
        );
        return true;
      },
      resetHistory: () =>
        set(
          produce<ElementsStoreState>((draft) => {
            draft.history.past = [];
            draft.history.future = [];
          }),
        ),
    },
  }));

const elementsStore = createElementsStore();

const compare = <T>(previous: T, next: T, equality?: (a: T, b: T) => boolean) =>
  equality ? equality(previous, next) : Object.is(previous, next);

export const useElementsStore = <T>(
  selector: (state: ElementsStoreState) => T,
  equality?: (a: T, b: T) => boolean,
) => {
  const selectorRef = useRef(selector);
  const equalityRef = useRef(equality);
  const snapshotRef = useRef<{ hasValue: boolean; value: T }>({
    hasValue: false,
    value: undefined as T,
  });

  selectorRef.current = selector;
  equalityRef.current = equality;

  const memoizedSelector = useCallback((state: ElementsStoreState) => {
    const next = selectorRef.current(state);
    if (snapshotRef.current.hasValue) {
      const previous = snapshotRef.current.value;
      if (compare(previous, next, equalityRef.current)) {
        return previous;
      }
    }

    snapshotRef.current = { hasValue: true, value: next };
    return next;
  }, []);

  return useStore(elementsStore, memoizedSelector, equality);
};

export const useElementsStoreState = () => useElementsStore((state) => state);

export const getElementsStore = () => elementsStore;

export type { ElementsStoreState as ElementsStore };
