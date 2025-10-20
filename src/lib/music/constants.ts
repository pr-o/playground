import type { PrimaryMusicRoute } from '@/store/music';

export const MUSIC_BASE_PATH = '/apps/youtube-music';

export function musicPath(...segments: Array<string | number | undefined | null>) {
  const parts = segments
    .filter(
      (segment): segment is string | number => segment !== undefined && segment !== null,
    )
    .map((segment) => String(segment).replace(/^\/+|\/+$/g, ''))
    .filter((segment) => segment.length > 0);
  if (parts.length === 0) {
    return MUSIC_BASE_PATH;
  }
  return `${MUSIC_BASE_PATH}/${parts.join('/')}`;
}

export const MUSIC_BREAKPOINTS = {
  xs: 0,
  sm: 480,
  md: 768,
  lg: 1024,
  xl: 1440,
} as const;

export type MusicBreakpointKey = keyof typeof MUSIC_BREAKPOINTS;

export type MusicPrimaryNavItem = {
  key: PrimaryMusicRoute;
  label: string;
  href: string;
  icon: 'home' | 'compass' | 'library' | 'search';
};

export type MusicSidebarLibraryLink = {
  label: string;
  href: string;
  badge?: string;
};

export type MusicSidebarLibrarySection = {
  heading: string;
  links: MusicSidebarLibraryLink[];
};

export const MUSIC_PRIMARY_NAV: MusicPrimaryNavItem[] = [
  {
    key: 'home',
    label: 'Home',
    href: MUSIC_BASE_PATH,
    icon: 'home',
  },
  {
    key: 'explore',
    label: 'Explore',
    href: `${MUSIC_BASE_PATH}/explore`,
    icon: 'compass',
  },
  {
    key: 'library',
    label: 'Library',
    href: `${MUSIC_BASE_PATH}/library`,
    icon: 'library',
  },
  {
    key: 'search',
    label: 'Search',
    href: `${MUSIC_BASE_PATH}/search`,
    icon: 'search',
  },
] satisfies MusicPrimaryNavItem[];

export const MUSIC_SIDEBAR_LIBRARY_SECTIONS: MusicSidebarLibrarySection[] = [
  {
    heading: 'Library',
    links: [
      { label: 'Liked Music', href: '#liked', badge: 'Auto playlist' },
      { label: 'Study', href: '#study' },
      { label: 'Pop', href: '#pop' },
      { label: 'Workout', href: '#workout' },
      { label: 'Classic for sleeping', href: '#classic-sleep' },
    ],
  },
] satisfies MusicSidebarLibrarySection[];

export const MUSIC_FILTER_PRESETS = [
  'Podcasts',
  'Commute',
  'Feel good',
  'Energize',
  'Workout',
  'Relax',
  'Focus',
  'Sad',
  'Romance',
  'Sleep',
  'Party',
] as const;
