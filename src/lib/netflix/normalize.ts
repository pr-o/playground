import { TMDB_BACKDROP_SIZE, TMDB_IMAGE_BASE, TMDB_POSTER_SIZE } from './constants';
import type { CollectionConfig } from './collections';
import type { MediaItem, TMDBMediaRaw, TMDBMediaType } from './types';

function coerceMediaType(raw: TMDBMediaRaw, fallback?: TMDBMediaType): TMDBMediaType {
  if (raw.media_type === 'tv' || raw.media_type === 'movie') {
    return raw.media_type;
  }
  if (fallback) return fallback;
  return raw.first_air_date ? 'tv' : 'movie';
}

function resolveTitle(raw: TMDBMediaRaw): string {
  return raw.title ?? raw.name ?? raw.original_title ?? raw.original_name ?? 'Untitled';
}

function resolveReleaseDate(raw: TMDBMediaRaw): string | null {
  return raw.release_date ?? raw.first_air_date ?? null;
}

function makeImageUrl(path: string | null | undefined, size: string): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function normalizeMediaItem(
  raw: TMDBMediaRaw,
  config?: CollectionConfig,
): MediaItem {
  const mediaType = coerceMediaType(raw, config?.mediaType);
  return {
    id: raw.id,
    mediaType,
    title: resolveTitle(raw),
    overview: raw.overview ?? '',
    backdropPath: makeImageUrl(raw.backdrop_path ?? null, TMDB_BACKDROP_SIZE),
    posterPath: makeImageUrl(raw.poster_path ?? null, TMDB_POSTER_SIZE),
    releaseDate: resolveReleaseDate(raw),
    voteAverage: raw.vote_average ?? null,
    popularity: raw.popularity ?? null,
    originalLanguage: raw.original_language ?? null,
    genreIds: raw.genre_ids ?? [],
  };
}

export function sortByPopularity(items: MediaItem[]): MediaItem[] {
  return [...items].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0));
}

export function pickHeroCandidate(items: MediaItem[]): MediaItem | null {
  if (!items.length) return null;
  const sorted = sortByPopularity(items);
  return sorted[0] ?? null;
}
