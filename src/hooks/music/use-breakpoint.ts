'use client';

import { useEffect, useMemo, useState } from 'react';
import { MUSIC_BREAKPOINTS, type MusicBreakpointKey } from '@/lib/music/constants';

const breakpointEntries = Object.entries(MUSIC_BREAKPOINTS).sort(
  (a, b) => a[1] - b[1],
) as Array<[MusicBreakpointKey, number]>;

export function useBreakpoint() {
  const [width, setWidth] = useState<number>(() =>
    typeof window === 'undefined' ? MUSIC_BREAKPOINTS.md : window.innerWidth,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const key = useMemo<MusicBreakpointKey>(() => {
    for (let index = breakpointEntries.length - 1; index >= 0; index -= 1) {
      const [breakpointKey, breakpointValue] = breakpointEntries[index];
      if (width >= breakpointValue) {
        return breakpointKey;
      }
    }
    return 'xs';
  }, [width]);

  return {
    key,
    width,
    isMobile: width < MUSIC_BREAKPOINTS.md,
    isTablet: width >= MUSIC_BREAKPOINTS.md && width < MUSIC_BREAKPOINTS.lg,
    isDesktop: width >= MUSIC_BREAKPOINTS.lg,
  };
}
