import type { CollectionSlug } from './types';

export const NETFLIX_ROUTE_BASE = '/clones/netflix';

export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
export const TMDB_BACKDROP_SIZE = 'w1280';
export const TMDB_POSTER_SIZE = 'w500';

export const HOME_COLLECTION_ORDER: CollectionSlug[] = [
  'trending',
  'popular-movies',
  'top-rated-tv',
  'trending-movies',
  'popular-tv',
  'upcoming-movies',
];

export const SHOWS_COLLECTION_ORDER: CollectionSlug[] = [
  'trending-tv',
  'popular-tv',
  'top-rated-tv',
  'airing-today',
  'new-popular-tv',
];

export const MOVIES_COLLECTION_ORDER: CollectionSlug[] = [
  'trending-movies',
  'popular-movies',
  'top-rated-movies',
  'now-playing-movies',
  'upcoming-movies',
  'discover-movies',
];

export const NEW_AND_POPULAR_ORDER: CollectionSlug[] = [
  'now-playing-movies',
  'airing-today',
  'new-popular-tv',
  'upcoming-movies',
  'popular-movies',
];

export const HERO_FALLBACK_SLUG: CollectionSlug = 'trending';
