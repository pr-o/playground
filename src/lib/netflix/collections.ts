import type { TMDBMediaType, CollectionSlug } from './types';

type CollectionConfig = {
  label: string;
  path: string;
  mediaType?: TMDBMediaType;
  params?: Record<string, string | number>;
};

export const NETFLIX_COLLECTIONS: Record<CollectionSlug, CollectionConfig> = {
  trending: {
    label: 'Trending Now',
    path: '/trending/all/week',
  },
  'trending-tv': {
    label: 'Trending TV',
    path: '/trending/tv/week',
    mediaType: 'tv',
  },
  'trending-movies': {
    label: 'Trending Movies',
    path: '/trending/movie/week',
    mediaType: 'movie',
  },
  'top-rated-tv': {
    label: 'Top Rated Series',
    path: '/tv/top_rated',
    mediaType: 'tv',
  },
  'top-rated-movies': {
    label: 'Top Rated Movies',
    path: '/movie/top_rated',
    mediaType: 'movie',
  },
  'popular-tv': {
    label: 'Popular on TV',
    path: '/tv/popular',
    mediaType: 'tv',
  },
  'popular-movies': {
    label: 'Popular on Netflix',
    path: '/movie/popular',
    mediaType: 'movie',
  },
  'upcoming-movies': {
    label: 'Coming Soon',
    path: '/movie/upcoming',
    mediaType: 'movie',
  },
  'now-playing-movies': {
    label: 'Now Playing Movies',
    path: '/movie/now_playing',
    mediaType: 'movie',
  },
  'airing-today': {
    label: 'Airing Today',
    path: '/tv/airing_today',
    mediaType: 'tv',
  },
  'new-popular-tv': {
    label: 'New & Popular TV',
    path: '/tv/on_the_air',
    mediaType: 'tv',
  },
  'discover-movies': {
    label: 'Discover Movies',
    path: '/discover/movie',
    mediaType: 'movie',
    params: {
      sort_by: 'popularity.desc',
      'vote_count.gte': 50,
    },
  },
  'discover-tv': {
    label: 'Discover Series',
    path: '/discover/tv',
    mediaType: 'tv',
    params: {
      sort_by: 'popularity.desc',
      'vote_count.gte': 50,
    },
  },
};

export function isCollectionSlug(input: string): input is CollectionSlug {
  return input in NETFLIX_COLLECTIONS;
}

export type { CollectionConfig };
