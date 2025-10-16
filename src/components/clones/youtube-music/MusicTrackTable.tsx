'use client';

import { useState } from 'react';
import { Clock, ListPlus, Play, Plus } from 'lucide-react';
import type { TrackRowData } from '@/types/music';
import { formatDurationMs } from '@/lib/format';
import { cn } from '@/lib/utils';
import { trackRowToPlayback } from '@/lib/music/playback';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';

type MusicTrackTableProps = {
  tracks: TrackRowData[];
  className?: string;
};

export function MusicTrackTable({ tracks, className }: MusicTrackTableProps) {
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const playTrack = useMusicPlaybackStore((state) => state.playTrack);
  const addToQueue = useMusicPlaybackStore((state) => state.addToQueue);
  const pushToast = useMusicUIStore((state) => state.pushToast);

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
          const playbackTrack = trackRowToPlayback(track);

          const handlePlay = () => {
            playTrack(playbackTrack, { startPlaying: true });
            pushToast({
              title: 'Now playing',
              description: `${track.title} • ${track.artists.join(', ')}`,
              variant: 'info',
            });
          };

          const handleAddToQueue = () => {
            addToQueue(playbackTrack);
            pushToast({
              title: 'Added to queue',
              description: track.title,
              variant: 'success',
            });
          };

          const handlePlayNext = () => {
            addToQueue(playbackTrack, { next: true });
            pushToast({
              title: 'Queued to play next',
              description: track.title,
              variant: 'success',
            });
          };

          return (
            <div
              key={track.id}
              role="button"
              tabIndex={0}
              onMouseEnter={() => setActiveTrackId(track.id)}
              onFocus={() => setActiveTrackId(track.id)}
              onBlur={() => setActiveTrackId(null)}
              onMouseLeave={() => setActiveTrackId(null)}
              onClick={handlePlay}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handlePlay();
                }
              }}
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
              <div className="flex items-center gap-2 justify-self-end text-music-muted">
                <span className="text-xs">{formatDurationMs(track.durationMs)}</span>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handlePlayNext();
                  }}
                  className="rounded-full border border-white/20 p-1.5 opacity-0 transition group-hover:opacity-100 hover:border-white/40 hover:text-music-primary"
                  aria-label="Play next"
                >
                  <ListPlus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    handleAddToQueue();
                  }}
                  className="rounded-full border border-white/20 p-1.5 opacity-0 transition group-hover:opacity-100 hover:border-white/40 hover:text-music-primary"
                  aria-label="Add to queue"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
