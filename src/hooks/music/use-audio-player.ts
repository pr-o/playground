'use client';

import { useEffect, useRef } from 'react';
import { useMusicPlaybackStore } from '@/store/music';

const DEFAULT_SILENT_SRC =
  'data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAACcQCA' +
  'AwACABAAZGF0YQAAAAA=';

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = useMusicPlaybackStore((state) =>
    state.currentIndex >= 0 ? state.queue[state.currentIndex] : undefined,
  );
  const isPlaying = useMusicPlaybackStore((state) => state.isPlaying);
  const volume = useMusicPlaybackStore((state) => state.volume);
  const isMuted = useMusicPlaybackStore((state) => state.isMuted);
  const setProgress = useMusicPlaybackStore((state) => state.setProgress);
  const next = useMusicPlaybackStore((state) => state.next);
  const progressMs = useMusicPlaybackStore((state) => state.progressMs);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'auto';
    }
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setProgress(Math.floor(audio.currentTime * 1000));
    };
    const handleEnded = () => {
      next();
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [next, setProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const src = currentTrack?.previewUrl ?? DEFAULT_SILENT_SRC;

    if (audio.src !== src) {
      audio.src = src;
      audio.currentTime = 0;
      setProgress(0);
    }

    if (isPlaying && currentTrack) {
      audio.play().catch((error) => {
        console.warn('Music audio playback failed', error);
      });
    } else {
      audio.pause();
    }
  }, [currentTrack, isPlaying, setProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [isMuted, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const desiredSeconds = progressMs / 1000;
    if (Math.abs(audio.currentTime - desiredSeconds) > 0.25) {
      audio.currentTime = desiredSeconds;
    }
  }, [progressMs]);

  const seek = (positionMs: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(positionMs)) return;
    audio.currentTime = Math.max(positionMs, 0) / 1000;
    setProgress(Math.max(positionMs, 0));
  };

  return {
    audio: audioRef.current,
    seek,
  };
}
