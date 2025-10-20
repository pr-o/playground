'use client';

import type { FormEvent, KeyboardEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bell,
  Info,
  Loader2,
  MoreHorizontal,
  Search as SearchIcon,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { MUSIC_BASE_PATH, MUSIC_PRIMARY_NAV } from '@/lib/music/constants';
import { useMusicUIStore } from '@/store/music';
import { useMusicSearchSuggestions } from '@/hooks/music/use-music-search-suggestions';
import type { MusicSearchSuggestion } from '@/types/music';

export function MusicTopBar() {
  const isSearchFocused = useMusicUIStore((state) => state.isSearchFocused);
  const setSearchFocused = useMusicUIStore((state) => state.setSearchFocused);
  const activeRoute = useMusicUIStore((state) => state.activeRoute);
  const router = useRouter();
  const searchParams = useSearchParams();

  const authError = searchParams?.get('auth_error') ?? null;
  const showAuthError = Boolean(authError);
  const initialQuery = searchParams?.get('q') ?? '';

  const [searchValue, setSearchValue] = useState(initialQuery);
  const [highlightIndex, setHighlightIndex] = useState<number>(-1);

  const { suggestions, isLoading } = useMusicSearchSuggestions(searchValue);

  useEffect(() => {
    setSearchValue(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    setHighlightIndex(-1);
  }, [suggestions]);

  const hasSuggestions = isSearchFocused && suggestions.length > 0;

  const navigateToSearch = useCallback(
    (query: string) => {
      const trimmed = query.trim();
      if (!trimmed) return;
      router.push(`/clones/youtube-music/search?q=${encodeURIComponent(trimmed)}`);
      setSearchFocused(false);
    },
    [router, setSearchFocused],
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      navigateToSearch(searchValue);
    },
    [navigateToSearch, searchValue],
  );

  const handleSelectSuggestion = useCallback(
    (suggestion: MusicSearchSuggestion) => {
      setSearchValue(suggestion.label);
      router.push(suggestion.href);
      setSearchFocused(false);
      setHighlightIndex(-1);
    },
    [router, setSearchFocused],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (!hasSuggestions) {
        if (event.key === 'Enter') {
          navigateToSearch(searchValue);
        }
        return;
      }

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setHighlightIndex((prev) => {
          const next = prev + 1;
          return next >= suggestions.length ? 0 : next;
        });
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setHighlightIndex((prev) => {
          const next = prev - 1;
          return next < 0 ? suggestions.length - 1 : next;
        });
      } else if (event.key === 'Enter') {
        event.preventDefault();
        if (highlightIndex >= 0 && suggestions[highlightIndex]) {
          handleSelectSuggestion(suggestions[highlightIndex]);
        } else {
          navigateToSearch(searchValue);
        }
      } else if (event.key === 'Escape') {
        setSearchFocused(false);
        setHighlightIndex(-1);
      }
    },
    [
      hasSuggestions,
      highlightIndex,
      suggestions,
      navigateToSearch,
      searchValue,
      handleSelectSuggestion,
      setSearchFocused,
    ],
  );

  return (
    <div className="sticky top-0 z-40 border-b border-music/60 bg-music-hero/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-4">
        {showAuthError && (
          <div className="flex items-center justify-between gap-4 rounded-2xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            <div className="flex items-center gap-3">
              <Info className="h-4 w-4" />
              <div>
                <p className="font-semibold">Spotify sign-in failed</p>
                <p className="text-xs text-red-200/80">
                  {renderAuthErrorMessage(authError)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => router.replace(MUSIC_BASE_PATH)}
              className="rounded-full p-2 text-red-200/80 transition hover:bg-red-900/50 hover:text-red-100"
              aria-label="Dismiss authentication error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex items-start gap-4">
          <div className="relative flex-1">
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-music-muted" />
                <Input
                  type="search"
                  value={searchValue}
                  placeholder="Search songs, albums, artists, podcasts"
                  onChange={(event) => setSearchValue(event.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    'h-11 w-full rounded-full border-music/60 bg-white/10 pl-10 text-sm text-music-primary placeholder:text-music-muted focus:border-white/30 focus:bg-white/15 focus-visible:ring-0',
                    isSearchFocused && 'ring-music',
                  )}
                />
              </div>
            </form>
            {(hasSuggestions || (isSearchFocused && isLoading)) && (
              <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-white/10 bg-music-hero/95 p-2 shadow-xl backdrop-blur">
                {isLoading && !suggestions.length ? (
                  <div className="flex items-center gap-2 px-3 py-2 text-sm text-music-muted">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Searching Discogs…
                  </div>
                ) : (
                  <ul className="space-y-1">
                    {suggestions.map((suggestion, index) => (
                      <li key={`${suggestion.kind}-${suggestion.id}`}>
                        <button
                          type="button"
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => handleSelectSuggestion(suggestion)}
                          className={cn(
                            'flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-sm transition',
                            highlightIndex === index
                              ? 'bg-white/15 text-music-primary'
                              : 'text-music-muted hover:bg-white/10 hover:text-music-primary',
                          )}
                        >
                          <span className="truncate">{suggestion.label}</span>
                          <span className="text-[10px] uppercase tracking-[0.3em] text-music-ghost">
                            {suggestion.kind}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-music-secondary transition hover:bg-white/20"
            >
              <Bell className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-music-secondary transition hover:bg-white/20"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-medium text-music-muted md:hidden">
          {MUSIC_PRIMARY_NAV.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'rounded-full px-4 py-1.5',
                activeRoute === item.key
                  ? 'bg-white/20 text-music-primary'
                  : 'hover:bg-white/10 hover:text-music-primary',
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={MUSIC_BASE_PATH}
            className="ml-auto rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-[0.3em] text-music-ghost hover:border-white/40"
          >
            Clone
          </Link>
        </div>
      </div>
    </div>
  );
}

function renderAuthErrorMessage(code: string | null) {
  switch (code) {
    case 'missing_code_state':
      return 'Authorization response was missing required parameters. Please try again.';
    case 'invalid_state':
      return 'State verification failed. Please start the sign-in again.';
    case 'token_exchange_failed':
      return 'Could not exchange the authorization code. Check your credentials and try once more.';
    default:
      return 'Unexpected error while connecting to Spotify. Please retry.';
  }
}
