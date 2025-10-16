'use client';

import { useEffect } from 'react';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';
import type { RepeatMode } from '@/store/music';

const REPEAT_CYCLE: RepeatMode[] = ['off', 'context', 'track'];

export function usePlaybackShortcuts() {
  const togglePlay = useMusicPlaybackStore((state) => state.togglePlay);
  const next = useMusicPlaybackStore((state) => state.next);
  const previous = useMusicPlaybackStore((state) => state.previous);
  const setRepeatMode = useMusicPlaybackStore((state) => state.setRepeatMode);
  const setShuffle = useMusicPlaybackStore((state) => state.setShuffle);
  const shuffle = useMusicPlaybackStore((state) => state.shuffle);
  const repeatMode = useMusicPlaybackStore((state) => state.repeatMode);
  const pushToast = useMusicUIStore((state) => state.pushToast);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;
      if (target && target.isContentEditable) return;

      if (event.key === ' ' && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        togglePlay();
        return;
      }

      if (event.ctrlKey && !event.shiftKey && !event.altKey) {
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          next();
          pushToast({
            title: 'Skipped forward',
            description: 'Playing next track',
            variant: 'info',
            durationMs: 2000,
          });
          return;
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          previous();
          pushToast({
            title: 'Skipped back',
            description: 'Replaying previous track',
            variant: 'info',
            durationMs: 2000,
          });
          return;
        }
      }

      if (event.shiftKey && !event.ctrlKey && !event.metaKey) {
        if (event.key.toLowerCase() === 's') {
          event.preventDefault();
          setShuffle(!shuffle);
          pushToast({
            title: shuffle ? 'Shuffle off' : 'Shuffle on',
            description: 'Playback order updated',
            variant: 'info',
            durationMs: 2000,
          });
          return;
        }
        if (event.key.toLowerCase() === 'r') {
          event.preventDefault();
          const currentIndex = REPEAT_CYCLE.indexOf(repeatMode);
          const nextMode = REPEAT_CYCLE[(currentIndex + 1) % REPEAT_CYCLE.length];
          setRepeatMode(nextMode);
          pushToast({
            title: `Repeat ${nextMode === 'off' ? 'off' : nextMode === 'track' ? 'track' : 'context'}`,
            description:
              nextMode === 'track'
                ? 'Repeating current track'
                : nextMode === 'context'
                  ? 'Repeating queue'
                  : 'Repeat disabled',
            variant: 'info',
            durationMs: 2000,
          });
          return;
        }
      }

      if (event.key === '?' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        pushToast({
          title: 'Keyboard shortcuts',
          description:
            'Space toggle play, Ctrl+←/→ skip, Shift+S shuffle, Shift+R repeat.',
          variant: 'info',
          durationMs: 5000,
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    next,
    previous,
    pushToast,
    repeatMode,
    setRepeatMode,
    setShuffle,
    shuffle,
    togglePlay,
  ]);
}
