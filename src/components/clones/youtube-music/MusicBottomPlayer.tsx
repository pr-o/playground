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
import { useAudioPlayer } from '@/hooks/music/use-audio-player';

export function MusicBottomPlayer() {
  const { seek } = useAudioPlayer();
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
  const setProgress = useMusicPlaybackStore((state) => state.setProgress);
  const setVolume = useMusicPlaybackStore((state) => state.setVolume);
  const durationMs = currentTrack?.durationMs ?? 0;

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(event.target.value, 10);
    seek(value);
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseFloat(event.target.value);
    setVolume(value);
    if (value > 0 && isMuted) {
      toggleMute();
    }
  };

  return (
    <footer className="fixed inset-x-0 bottom-0 z-30 border-t border-music/70 bg-music-card/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-4 py-3 text-sm">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {currentTrack?.artworkUrl ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-md bg-music-card-alt">
              <Image
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
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
              {currentTrack?.title ?? 'Nothing playing'}
            </p>
            <p className="truncate text-xs text-music-muted">
              {currentTrack?.artists?.join(', ') ?? 'Queue up a song'}
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
            <input
              type="range"
              min={0}
              max={durationMs || 1}
              value={Math.min(progressMs, durationMs || 1)}
              step={500}
              onChange={(event) => {
                handleSeek(event);
                setProgress(Number.parseInt(event.target.value, 10));
              }}
              className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 transition hover:bg-white/20 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
            />
            <span className="w-10">
              {currentTrack ? formatDurationMs(durationMs) : '0:00'}
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
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="h-1 w-28 cursor-pointer appearance-none rounded-full bg-white/10 transition hover:bg-white/20 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow"
          />
        </div>
      </div>
    </footer>
  );
}
