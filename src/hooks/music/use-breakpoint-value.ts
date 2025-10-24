'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MUSIC_BREAKPOINTS, type MusicBreakpointKey } from '@/lib/music/constants';

type BreakpointValueKey = MusicBreakpointKey | 'base';

export type BreakpointValues<T> = Partial<Record<BreakpointValueKey, T>>;

function sortBreakpointsDescending(): Array<[MusicBreakpointKey, number]> {
  return Object.entries(MUSIC_BREAKPOINTS)
    .map(
      ([key, value]) =>
        [key as MusicBreakpointKey, value] as [MusicBreakpointKey, number],
    )
    .sort((a, b) => b[1] - a[1]);
}

function resolveActiveKey(
  entries: Array<[MusicBreakpointKey, number]>,
  matchers: Array<MediaQueryList>,
): MusicBreakpointKey | 'xs' {
  for (let index = 0; index < entries.length; index += 1) {
    if (matchers[index]?.matches) {
      return entries[index][0];
    }
  }
  return 'xs';
}

function pickValueForKey<T>(
  activeKey: MusicBreakpointKey | 'xs',
  values: BreakpointValues<T>,
  orderedKeys: MusicBreakpointKey[],
  fallback?: T,
): T | undefined {
  if (activeKey !== 'xs' && values[activeKey]) {
    return values[activeKey];
  }

  for (let index = 0; index < orderedKeys.length; index += 1) {
    const key = orderedKeys[index];
    if (values[key]) {
      return values[key];
    }
  }

  return values.base ?? fallback;
}

export function useBreakpointValue<T>(
  values: BreakpointValues<T>,
  fallback?: T,
): T | undefined {
  const sortedBreakpoints = useMemo(() => sortBreakpointsDescending(), []);
  const mediaQueryListsRef = useRef<Array<MediaQueryList>>([]);

  const [activeKey, setActiveKey] = useState<MusicBreakpointKey | 'xs'>(() => {
    if (typeof window === 'undefined') return 'xs';
    const matchers = sortedBreakpoints.map(([, value]) =>
      window.matchMedia(`(min-width: ${value}px)`),
    );
    mediaQueryListsRef.current = matchers;
    return resolveActiveKey(sortedBreakpoints, matchers);
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const listeners = sortedBreakpoints.map(([, value], index) => {
      const matcher = window.matchMedia(`(min-width: ${value}px)`);
      const handleChange = () => {
        setActiveKey(resolveActiveKey(sortedBreakpoints, mediaQueryListsRef.current));
      };
      matcher.addEventListener('change', handleChange);
      mediaQueryListsRef.current[index] = matcher;
      return () => matcher.removeEventListener('change', handleChange);
    });

    setActiveKey(resolveActiveKey(sortedBreakpoints, mediaQueryListsRef.current));

    return () => {
      listeners.forEach((dispose) => dispose());
    };
  }, [sortedBreakpoints]);

  const orderedKeys = useMemo(
    () => sortedBreakpoints.map(([key]) => key),
    [sortedBreakpoints],
  );

  return pickValueForKey(activeKey, values, orderedKeys, fallback);
}
