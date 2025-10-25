'use client';

import Link from 'next/link';
import {
  Compass,
  Home,
  Library,
  ListMusic,
  Plus,
  Search,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  MUSIC_PRIMARY_NAV,
  MUSIC_SIDEBAR_LIBRARY_SECTIONS,
  MUSIC_BASE_PATH,
} from '@/lib/music/constants';
import { useMusicUIStore } from '@/store/music';

const navIconMap: Record<(typeof MUSIC_PRIMARY_NAV)[number]['icon'], LucideIcon> = {
  home: Home,
  compass: Compass,
  library: Library,
  search: Search,
};

export function MusicSidebar() {
  const sidebarDensity = useMusicUIStore((state) => state.sidebarDensity);
  const activeRoute = useMusicUIStore((state) => state.activeRoute);

  const isCompact = sidebarDensity === 'compact';
  const isHidden = sidebarDensity === 'hidden';

  if (isHidden) {
    return <aside className="hidden md:flex" aria-hidden />;
  }

  return (
    <aside
      className={cn(
        'hidden h-full flex-col bg-music-card/40 text-music-secondary backdrop-blur md:flex',
        isCompact ? 'w-[4.75rem]' : 'w-64',
      )}
    >
      <div className="flex h-20 items-center px-5">
        <Link href={MUSIC_BASE_PATH} className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-music-card-alt text-music-primary">
            <ListMusic className="h-5 w-5" />
          </div>
          {!isCompact && (
            <div className="leading-tight">
              <p className="text-xs uppercase tracking-[0.35em] text-music-ghost">
                Clone
              </p>
              <p className="text-sm font-semibold text-music-primary">YouTube Music</p>
            </div>
          )}
        </Link>
      </div>

      <nav className="flex flex-col gap-1 px-2 py-3">
        {MUSIC_PRIMARY_NAV.map((item) => {
          const Icon = navIconMap[item.icon];
          const isActive = item.key === activeRoute;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                isActive
                  ? 'bg-white/10 text-music-primary shadow-sm backdrop-blur'
                  : 'text-music-muted hover:bg-white/5 hover:text-music-primary',
                isCompact && 'justify-center',
              )}
            >
              <Icon className="h-5 w-5" />
              {!isCompact && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 border-t border-music/70 px-4 pt-4">
        <button
          type="button"
          className={cn(
            'flex w-full items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-music-primary transition hover:bg-white/20',
            isCompact && 'justify-center rounded-full p-0 py-2',
          )}
        >
          <Plus className="h-5 w-5" />
          {!isCompact && <span>New playlist</span>}
        </button>
      </div>

      <div className="mt-3 flex-1 overflow-y-auto px-4 pb-6">
        {MUSIC_SIDEBAR_LIBRARY_SECTIONS.map((section) => (
          <div key={section.heading} className="mb-6 text-sm">
            {!isCompact && (
              <p className="mb-3 text-[0.7rem] uppercase tracking-[0.3em] text-music-ghost">
                {section.heading}
              </p>
            )}
            <ul className={cn('space-y-2', isCompact && 'space-y-3')}>
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      'flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-music-muted transition hover:bg-white/5 hover:text-music-primary',
                      isCompact && 'justify-center',
                    )}
                  >
                    <span className="truncate text-sm">{link.label}</span>
                    {!isCompact && link.badge && (
                      <span className="rounded-full border border-music/60 px-2 py-[2px] text-[0.65rem] uppercase tracking-wide text-music-ghost">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
