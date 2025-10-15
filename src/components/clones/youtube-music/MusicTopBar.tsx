'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, Info, MoreHorizontal, Search as SearchIcon, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  MUSIC_BASE_PATH,
  MUSIC_FILTER_PRESETS,
  MUSIC_PRIMARY_NAV,
} from '@/lib/music/constants';
import { useMusicUIStore } from '@/store/music';

const MAX_PRESETS_DESKTOP = 10;
const MAX_PRESETS_MOBILE = 5;

export function MusicTopBar() {
  const isSearchFocused = useMusicUIStore((state) => state.isSearchFocused);
  const setSearchFocused = useMusicUIStore((state) => state.setSearchFocused);
  const activeRoute = useMusicUIStore((state) => state.activeRoute);
  const sidebarDensity = useMusicUIStore((state) => state.sidebarDensity);
  const router = useRouter();
  const searchParams = useSearchParams();

  const authError = searchParams?.get('auth_error') ?? null;
  const showAuthError = Boolean(authError);

  const pills = useMemo(() => {
    const limit = sidebarDensity === 'hidden' ? MAX_PRESETS_MOBILE : MAX_PRESETS_DESKTOP;
    return MUSIC_FILTER_PRESETS.slice(0, limit);
  }, [sidebarDensity]);

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

        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-music-muted" />
            <Input
              type="search"
              placeholder="Search songs, albums, artists, podcasts"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              className={cn(
                'h-11 w-full rounded-full border-music/60 bg-white/10 pl-10 text-sm text-music-primary placeholder:text-music-muted focus:border-white/30 focus:bg-white/15 focus-visible:ring-0',
                isSearchFocused && 'ring-music',
              )}
            />
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-music-secondary transition hover:bg-white/20"
            >
              <Bell className="h-5 w-5" />
            </button>
            <form action="/api/spotify/auth/login" method="get">
              <Button
                type="submit"
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 px-5 text-xs font-semibold uppercase tracking-[0.25em] text-music-primary hover:bg-white/20"
              >
                Connect Spotify
              </Button>
            </form>
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-music-secondary transition hover:bg-white/20"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {pills.map((pill) => (
            <button
              key={pill}
              type="button"
              className="rounded-full border border-music/60 bg-white/5 px-4 py-1.5 text-sm text-music-secondary transition hover:bg-white/15 hover:text-music-primary"
            >
              {pill}
            </button>
          ))}
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
          <form action="/api/spotify/auth/login" method="get">
            <Button
              type="submit"
              size="sm"
              variant="outline"
              className="rounded-full border-white/30 bg-white/10 text-[0.65rem] uppercase tracking-[0.25em] text-music-primary hover:bg-white/20"
            >
              Connect
            </Button>
          </form>
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
