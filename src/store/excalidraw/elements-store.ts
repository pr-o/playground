'use client';

import { useCallback, useRef } from 'react';
import { Draft, produce } from 'immer';
import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

import {
  CameraState,
  ExcalidrawElement,
  HistorySnapshot,
  ToolMode,
} from '@/types/excalidraw/elements';

type ElementsStoreState = {
  elements: ExcalidrawElement[];
  selectedElementIds: string[];
  tool: ToolMode;
  isToolLocked: boolean;
  isCanvasLocked: boolean;
  camera: CameraState;
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
    setElements: (elements: ExcalidrawElement[]) => void;
    addElement: (element: ExcalidrawElement) => void;
    updateElement: (
      id: string,
      updater: (element: ExcalidrawElement) => ExcalidrawElement,
    ) => void;
    removeElement: (id: string) => void;
    selectElements: (ids: string[]) => void;
    clearSelection: () => void;
    toggleSelection: (id: string) => void;
    bringToFront: (ids: string[]) => void;
    sendToBack: (ids: string[]) => void;
    undo: () => boolean;
    redo: () => boolean;
    resetHistory: () => void;
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
        const snapshot = createSnapshot(get());
        set(
          produce<ElementsStoreState>((draft) => {
            const index = draft.elements.findIndex((element) => element.id === id);
            if (index === -1) {
              return;
            }
            pushHistoryDraft(draft, snapshot);
            draft.elements.splice(index, 1);
            draft.selectedElementIds = draft.selectedElementIds.filter(
              (selectedId) => selectedId !== id,
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
