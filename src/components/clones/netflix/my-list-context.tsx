'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { MediaItem, TMDBMediaType } from '@/lib/netflix/types';

const STORAGE_KEY = 'netflix-clone:my-list';

type MyListContextValue = {
  items: MediaItem[];
  isHydrated: boolean;
  addItem: (item: MediaItem) => void;
  removeItem: (id: number, mediaType: TMDBMediaType) => void;
  toggleItem: (item: MediaItem) => void;
  contains: (id: number, mediaType: TMDBMediaType) => boolean;
};

const MyListContext = createContext<MyListContextValue | undefined>(undefined);

function isValidMediaItem(value: unknown): value is MediaItem {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as MediaItem;
  return typeof candidate.id === 'number' && typeof candidate.mediaType === 'string';
}

function sanitizeStoredItems(value: unknown): MediaItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter(isValidMediaItem);
}

export function MyListProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setItems(sanitizeStoredItems(parsed));
      }
    } catch (error) {
      console.warn('Failed to parse stored Netflix list', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('Failed to persist Netflix list', error);
    }
  }, [items, isHydrated]);

  const contains = useCallback(
    (id: number, mediaType: TMDBMediaType) =>
      items.some((item) => item.id === id && item.mediaType === mediaType),
    [items],
  );

  const addItem = useCallback((item: MediaItem) => {
    setItems((prev) => {
      if (
        prev.some(
          (existing) => existing.id === item.id && existing.mediaType === item.mediaType,
        )
      ) {
        return prev;
      }
      return [item, ...prev];
    });
  }, []);

  const removeItem = useCallback((id: number, mediaType: TMDBMediaType) => {
    setItems((prev) =>
      prev.filter((item) => !(item.id === id && item.mediaType === mediaType)),
    );
  }, []);

  const toggleItem = useCallback(
    (item: MediaItem) => {
      if (contains(item.id, item.mediaType)) {
        removeItem(item.id, item.mediaType);
      } else {
        addItem(item);
      }
    },
    [addItem, contains, removeItem],
  );

  const value = useMemo<MyListContextValue>(
    () => ({
      items,
      isHydrated,
      addItem,
      removeItem,
      toggleItem,
      contains,
    }),
    [addItem, contains, isHydrated, items, removeItem, toggleItem],
  );

  return <MyListContext.Provider value={value}>{children}</MyListContext.Provider>;
}

export function useMyList(): MyListContextValue {
  const context = useContext(MyListContext);
  if (!context) {
    throw new Error('useMyList must be used within a MyListProvider');
  }
  return context;
}
