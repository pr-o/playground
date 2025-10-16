'use client';

import useSWR from 'swr';
import { MusicLibraryData } from '@/types/music';

async function fetchLibraryData(): Promise<MusicLibraryData> {
  const response = await fetch('/api/discogs/library', {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load library data from Discogs');
  }

  return response.json();
}

export function useMusicLibraryData() {
  const { data, error, isLoading } = useSWR('discogs-library', fetchLibraryData, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
  });

  return {
    data,
    error: error instanceof Error ? error.message : undefined,
    isLoading,
  };
}
