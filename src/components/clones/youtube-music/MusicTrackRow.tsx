'use client';

import Image from 'next/image';
import { ListPlus, Play, Plus } from 'lucide-react';
import { formatDurationMs } from '@/lib/format';
import type { TrackRowData } from '@/types/music';
import { cn } from '@/lib/utils';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';
import { trackRowToPlayback } from '@/lib/music/playback';

type MusicTrackRowProps = {
  track: TrackRowData;
  index: number;
  className?: string;
};

export function MusicTrackRow({ track, index, className }: MusicTrackRowProps) {
  const playTrack = useMusicPlaybackStore((state) => state.playTrack);
  const addToQueue = useMusicPlaybackStore((state) => state.addToQueue);
  const toggleQueue = useMusicUIStore((state) => state.toggleQueue);
  const pushToast = useMusicUIStore((state) => state.pushToast);

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
      description: `${track.title} will play later`,
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
    toggleQueue(true);
  };

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
        onClick={handlePlay}
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
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={handlePlayNext}
          className="rounded-full border border-white/20 p-1.5 text-music-muted transition hover:border-white/40 hover:text-music-primary"
          aria-label="Play next"
        >
          <ListPlus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleAddToQueue}
          className="rounded-full border border-white/20 p-1.5 text-music-muted transition hover:border-white/40 hover:text-music-primary"
          aria-label="Add to queue"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
