'use client';

import Image from 'next/image';
import {
  Pause,
  Play,
  Repeat,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useMusicPlaybackStore } from '@/store/music';
import { formatDurationMs } from '@/lib/format';
import { cn } from '@/lib/utils';

export function MusicBottomPlayer() {
  const currentTrack = useMusicPlaybackStore((state) =>
    state.currentIndex >= 0 ? state.queue[state.currentIndex] : undefined,
  );
  const isPlaying = useMusicPlaybackStore((state) => state.isPlaying);
  const repeatMode = useMusicPlaybackStore((state) => state.repeatMode);
  const shuffle = useMusicPlaybackStore((state) => state.shuffle);
  const progressMs = useMusicPlaybackStore((state) => state.progressMs);
  const volume = useMusicPlaybackStore((state) => state.volume);
  const isMuted = useMusicPlaybackStore((state) => state.isMuted);
  const togglePlay = useMusicPlaybackStore((state) => state.togglePlay);
  const next = useMusicPlaybackStore((state) => state.next);
  const previous = useMusicPlaybackStore((state) => state.previous);
  const setShuffle = useMusicPlaybackStore((state) => state.setShuffle);
  const setRepeatMode = useMusicPlaybackStore((state) => state.setRepeatMode);
  const toggleMute = useMusicPlaybackStore((state) => state.toggleMute);

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-music/70 bg-music-card/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-3 text-sm">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {currentTrack?.album.images?.[0]?.url ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-md bg-music-card-alt">
              <Image
                src={currentTrack.album.images[0].url}
                alt={currentTrack.name}
                fill
                sizes="56px"
              />
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-md bg-music-card-alt text-music-ghost">
              ♪
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-music-primary">
              {currentTrack?.name ?? 'Nothing playing'}
            </p>
            <p className="truncate text-xs text-music-muted">
              {currentTrack?.artists?.map((artist) => artist.name).join(', ') ??
                'Queue up a song'}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setShuffle(!shuffle)}
              className={cn(
                'rounded-full p-2 text-music-muted transition hover:text-music-primary',
                shuffle && 'text-music-primary',
              )}
            >
              <Shuffle className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={previous}
              className="rounded-full p-2 text-music-muted transition hover:text-music-primary"
            >
              <SkipBack className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-music-primary transition hover:bg-white/30"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              type="button"
              onClick={next}
              className="rounded-full p-2 text-music-muted transition hover:text-music-primary"
            >
              <SkipForward className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() =>
                setRepeatMode(
                  repeatMode === 'off'
                    ? 'context'
                    : repeatMode === 'context'
                      ? 'track'
                      : 'off',
                )
              }
              className={cn(
                'rounded-full p-2 text-music-muted transition hover:text-music-primary',
                repeatMode !== 'off' && 'text-music-primary',
              )}
            >
              <Repeat className="h-4 w-4" />
            </button>
          </div>
          <div className="flex w-full items-center gap-2 text-xs text-music-muted">
            <span className="w-10 text-right">
              {currentTrack ? formatDurationMs(progressMs) : '0:00'}
            </span>
            <div className="relative h-1 flex-1 rounded-full bg-white/10">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-white"
                style={{
                  width: currentTrack
                    ? `${Math.min(progressMs / currentTrack.duration_ms, 1) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <span className="w-10">
              {currentTrack ? formatDurationMs(currentTrack.duration_ms) : '0:00'}
            </span>
          </div>
        </div>

        <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
          <button
            type="button"
            onClick={toggleMute}
            className="rounded-full p-2 text-music-muted transition hover:text-music-primary"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </button>
          <div className="relative h-1 w-28 rounded-full bg-white/10">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-white"
              style={{ width: `${isMuted ? 0 : volume * 100}%` }}
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
