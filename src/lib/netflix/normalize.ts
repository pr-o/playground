import { TMDB_BACKDROP_SIZE, TMDB_IMAGE_BASE, TMDB_POSTER_SIZE } from './constants';
import type { CollectionConfig } from './collections';
import type {
  Episode,
  MediaDetail,
  MediaItem,
  TMDBMediaRaw,
  TMDBMediaType,
  TMDBGenre,
} from './types';

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

type TMDBEpisodeRaw = {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  season_number: number;
  still_path: string | null;
  air_date: string | null;
  runtime?: number | null;
};

export function normalizeEpisode(raw: TMDBEpisodeRaw): Episode {
  return {
    id: raw.id,
    name: raw.name,
    overview: raw.overview ?? '',
    episodeNumber: raw.episode_number,
    seasonNumber: raw.season_number,
    stillPath: makeImageUrl(raw.still_path, TMDB_POSTER_SIZE),
    airDate: raw.air_date ?? null,
    runtime: raw.runtime ?? null,
  };
}

type DetailExtras = Partial<Omit<MediaDetail, keyof MediaItem>>;

export function buildMediaDetail(base: MediaItem, extras: DetailExtras): MediaDetail {
  return {
    ...base,
    tagline: extras.tagline ?? null,
    genres: extras.genres ?? [],
    homepage: extras.homepage ?? null,
    runtime: extras.runtime ?? null,
    numberOfSeasons: extras.numberOfSeasons ?? null,
    numberOfEpisodes: extras.numberOfEpisodes ?? null,
    status: extras.status ?? null,
    episodes: extras.episodes ?? [],
  };
}

export function buildDetailConfig(mediaType: TMDBMediaType): CollectionConfig {
  return {
    label: 'detail',
    path: 'detail',
    mediaType,
  };
}

export function formatGenres(genres: TMDBGenre[] | undefined): TMDBGenre[] {
  if (!genres) return [];
  return genres.filter((genre): genre is TMDBGenre => Boolean(genre?.id && genre?.name));
}
