'use client';

import Image from 'next/image';
import { Play } from 'lucide-react';
import { formatDurationMs } from '@/lib/format';
import type { TrackRowData } from '@/types/music';
import { cn } from '@/lib/utils';

type MusicTrackRowProps = {
  track: TrackRowData;
  index: number;
  className?: string;
};

export function MusicTrackRow({ track, index, className }: MusicTrackRowProps) {
  return (
    <div
      className={cn(
        'group relative flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10',
        className,
      )}
    >
      <button
        type="button"
        className="absolute left-3 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-black transition group-hover:flex"
        aria-label={`Play ${track.title}`}
      >
        <Play className="h-4 w-4" />
      </button>
      <span className="w-6 text-center text-xs text-music-muted group-hover:opacity-0">
        {index}
      </span>
      <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-music-card-alt group-hover:translate-x-6 transition">
        {track.artworkUrl ? (
          <Image
            src={track.artworkUrl}
            alt={track.title}
            fill
            sizes="40px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.3em] text-music-ghost">
            Art
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1 group-hover:translate-x-6 transition">
        <p className="truncate text-sm font-semibold text-music-primary">{track.title}</p>
        <p className="truncate text-xs text-music-muted">
          {track.artists.join(', ')}
          {track.albumName ? ` • ${track.albumName}` : ''}
        </p>
      </div>
      {track.durationMs ? (
        <span className="text-xs text-music-muted">
          {formatDurationMs(track.durationMs)}
        </span>
      ) : null}
    </div>
  );
}
