'use client';

import { useEffect, useState } from 'react';
import type { MusicSearchSuggestion } from '@/types/music';

type UseMusicSearchSuggestionsResult = {
  suggestions: MusicSearchSuggestion[];
  isLoading: boolean;
};

export function useMusicSearchSuggestions(
  query: string,
  options: { debounceMs?: number } = {},
): UseMusicSearchSuggestionsResult {
  const [suggestions, setSuggestions] = useState<MusicSearchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    const debounceMs = options.debounceMs ?? 200;

    if (!trimmed) {
      setSuggestions([]);
      return undefined;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      setIsLoading(true);
      fetch(`/api/music/search/suggestions?q=${encodeURIComponent(trimmed)}`, {
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            throw new Error(`Search suggestions failed with status ${response.status}`);
          }
          return (await response.json()) as { suggestions: MusicSearchSuggestion[] };
        })
        .then((payload) => {
          setSuggestions(payload.suggestions);
        })
        .catch((error) => {
          if (error.name !== 'AbortError') {
            console.error('Failed to load search suggestions', error);
            setSuggestions([]);
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }, debounceMs);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [query, options.debounceMs]);

  return { suggestions, isLoading };
}
