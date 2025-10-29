'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type UseSoundOptions = {
  volume?: number;
  playbackRate?: number;
  loop?: boolean;
  muted?: boolean;
  preload?: 'auto' | 'metadata' | 'none';
};

type UseSoundReturn = {
  play: () => void;
  stop: () => void;
  setMuted: (value: boolean) => void;
  isReady: boolean;
  muted: boolean;
};

const isBrowser = () => typeof window !== 'undefined';

export function useSound(
  src: string | null,
  options: UseSoundOptions = {},
): UseSoundReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [muted, setMutedState] = useState(options.muted ?? true);
  const { volume, playbackRate, loop, preload, muted: mutedOption } = options;
  const mutedRef = useRef(muted);

  useEffect(() => {
    mutedRef.current = muted;
  }, [muted]);

  useEffect(() => {
    if (typeof mutedOption === 'boolean') {
      setMutedState(mutedOption);
    }
  }, [mutedOption]);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    if (!src) {
      audioRef.current = null;
      setIsReady(false);
      return;
    }

    const audio = new Audio(src);
    audio.loop = loop ?? false;
    audio.volume = volume ?? 1;
    audio.playbackRate = playbackRate ?? 1;
    audio.muted = mutedRef.current;
    audio.preload = preload ?? 'auto';

    const handleCanPlay = () => setIsReady(true);
    const handleError = () => setIsReady(false);

    audio.addEventListener('canplaythrough', handleCanPlay);
    audio.addEventListener('error', handleError);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeEventListener('canplaythrough', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, [src, loop, volume, playbackRate, preload]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = muted;
  }, [muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (typeof volume === 'number') {
      audio.volume = volume;
    }
    if (typeof playbackRate === 'number') {
      audio.playbackRate = playbackRate;
    }
    if (typeof loop === 'boolean') {
      audio.loop = loop;
    }
  }, [loop, volume, playbackRate]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !isBrowser()) return;
    try {
      audio.currentTime = 0;
      const maybePromise = audio.play();
      if (maybePromise) {
        void maybePromise.catch(() => {
          // Intentionally swallow play errors (e.g., user gesture requirements)
        });
      }
    } catch {
      // Ignore playback exceptions for muted/gesture-locked environments
    }
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
  }, []);

  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
  }, []);

  return {
    play,
    stop,
    setMuted,
    isReady,
    muted,
  };
}
