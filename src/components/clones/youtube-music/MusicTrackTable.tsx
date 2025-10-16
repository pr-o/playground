'use client';

import { useState } from 'react';
import { Clock, MoreHorizontal, Play, Plus } from 'lucide-react';
import type { TrackRowData } from '@/types/music';
import { formatDurationMs } from '@/lib/format';
import { cn } from '@/lib/utils';

type MusicTrackTableProps = {
  tracks: TrackRowData[];
  className?: string;
};

export function MusicTrackTable({ tracks, className }: MusicTrackTableProps) {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);

  return (
    <div className={cn('rounded-3xl border border-white/10 bg-white/5', className)}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-white/5 px-6 py-3 text-xs uppercase tracking-[0.3em] text-music-ghost">
        <span className="w-6 text-center">#</span>
        <span>Title</span>
        <span className="hidden md:block">Album</span>
        <span className="flex items-center gap-2 justify-self-end text-[10px] text-music-muted">
          <Clock className="h-3 w-3" />
          Duration
        </span>
      </div>
      <div>
        {tracks.map((track, index) => {
          const isActive = activeTrackId === track.id;
          return (
            <button
              key={track.id}
              type="button"
              onMouseEnter={() => setActiveTrackId(track.id)}
              onFocus={() => setActiveTrackId(track.id)}
              onBlur={() => setActiveTrackId(null)}
              onMouseLeave={() => setActiveTrackId(null)}
              className={cn(
                'group grid w-full grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 px-6 py-3 text-left transition',
                'border-b border-white/5 last:border-none',
                isActive ? 'bg-white/10' : 'hover:bg-white/10',
              )}
            >
              <span className="relative flex h-6 w-6 items-center justify-center text-xs text-music-muted">
                <span className={cn(isActive ? 'opacity-0' : 'opacity-100')}>
                  {index + 1}
                </span>
                <Play
                  className={cn(
                    'absolute h-3 w-3 text-music-primary transition',
                    isActive ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </span>
              <div className="min-w-0 space-y-1">
                <p className="truncate text-sm font-semibold text-music-primary">
                  {track.title}
                  {track.explicit ? (
                    <span className="ml-2 rounded-full border border-white/30 px-2 py-0.5 text-[10px] uppercase tracking-[0.3em] text-music-ghost">
                      E
                    </span>
                  ) : null}
                </p>
                <p className="truncate text-xs text-music-muted">
                  {track.artists.join(', ')}
                </p>
              </div>
              <p className="hidden truncate text-xs text-music-muted md:block">
                {track.albumName}
              </p>
              <div className="flex items-center gap-3 justify-self-end text-music-muted">
                <span className="text-xs">{formatDurationMs(track.durationMs)}</span>
                <Plus className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
                <MoreHorizontal className="h-4 w-4 opacity-0 transition group-hover:opacity-100" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
