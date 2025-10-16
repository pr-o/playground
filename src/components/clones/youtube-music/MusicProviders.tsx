'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useBreakpoint } from '@/hooks/music/use-breakpoint';
import { MUSIC_BASE_PATH } from '@/lib/music/constants';
import { useMusicUIStore, type PrimaryMusicRoute } from '@/store/music';

const routeMatchers: Array<{
  route: PrimaryMusicRoute;
  match: (pathname: string) => boolean;
}> = [
  {
    route: 'home',
    match: (pathname) =>
      pathname === MUSIC_BASE_PATH ||
      pathname === `${MUSIC_BASE_PATH}/` ||
      pathname === `${MUSIC_BASE_PATH}/home`,
  },
  {
    route: 'explore',
    match: (pathname) => pathname.startsWith(`${MUSIC_BASE_PATH}/explore`),
  },
  {
    route: 'library',
    match: (pathname) => pathname.startsWith(`${MUSIC_BASE_PATH}/library`),
  },
  {
    route: 'search',
    match: (pathname) =>
      pathname.startsWith(`${MUSIC_BASE_PATH}/search`) ||
      pathname.startsWith(`${MUSIC_BASE_PATH}/playlist`) ||
      pathname.startsWith(`${MUSIC_BASE_PATH}/album`) ||
      pathname.startsWith(`${MUSIC_BASE_PATH}/artist`) ||
      pathname.startsWith(`${MUSIC_BASE_PATH}/mix`),
  },
];

type MusicProvidersProps = {
  children: ReactNode;
};

export function MusicProviders({ children }: MusicProvidersProps) {
  const pathname = usePathname() ?? MUSIC_BASE_PATH;
  const { key, isMobile, isDesktop } = useBreakpoint();
  const setSidebarDensity = useMusicUIStore((state) => state.setSidebarDensity);
  const setActiveRoute = useMusicUIStore((state) => state.setActiveRoute);
  const setMobileNavOpen = useMusicUIStore((state) => state.setMobileNavOpen);
  const toggleQueue = useMusicUIStore((state) => state.toggleQueue);

  useEffect(() => {
    if (isMobile) {
      setSidebarDensity('hidden');
      toggleQueue(false);
    } else if (isDesktop) {
      setSidebarDensity('expanded');
    } else {
      setSidebarDensity('compact');
    }
  }, [isMobile, isDesktop, setSidebarDensity, toggleQueue, key]);

  useEffect(() => {
    setMobileNavOpen(false);
    const matchedRoute =
      routeMatchers.find((matcher) => matcher.match(pathname))?.route ?? 'home';
    setActiveRoute(matchedRoute);
  }, [pathname, setActiveRoute, setMobileNavOpen]);

  return <>{children}</>;
}
