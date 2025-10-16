'use client';

import Link from 'next/link';
import { Compass, Home, Library, Search, ListMusic } from 'lucide-react';
import { MUSIC_PRIMARY_NAV } from '@/lib/music/constants';
import { useMusicUIStore } from '@/store/music';
import { cn } from '@/lib/utils';

const iconMap = {
  home: Home,
  compass: Compass,
  library: Library,
  search: Search,
} as const;

export function MusicMobileNav() {
  const sidebarDensity = useMusicUIStore((state) => state.sidebarDensity);
  const activeRoute = useMusicUIStore((state) => state.activeRoute);
  const toggleQueue = useMusicUIStore((state) => state.toggleQueue);

  if (sidebarDensity !== 'hidden') {
    return null;
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-between border-t border-music/70 bg-music-card-alt/95 px-8 text-xs text-music-muted shadow-2xl backdrop-blur md:hidden">
      {MUSIC_PRIMARY_NAV.map((item) => {
        const IconComponent = iconMap[item.icon];
        return (
          <Link
            key={item.key}
            href={item.href}
            className={cn(
              'flex flex-col items-center gap-1',
              activeRoute === item.key && 'text-music-primary',
            )}
          >
            <IconComponent className="h-5 w-5" />
            <span className="text-[0.65rem] uppercase tracking-wide">{item.label}</span>
          </Link>
        );
      })}
      <button
        type="button"
        onClick={() => toggleQueue()}
        className="flex flex-col items-center gap-1 text-music-muted transition hover:text-music-primary"
      >
        <ListMusic className="h-5 w-5" />
        <span className="text-[0.65rem] uppercase tracking-wide">Queue</span>
      </button>
    </nav>
  );
}
