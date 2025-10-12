import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import { NETFLIX_COLLECTIONS } from './collections';
import {
  buildDetailConfig,
  buildMediaDetail,
  formatGenres,
  normalizeEpisode,
  normalizeMediaItem,
} from './normalize';
import type {
  CollectionResponsePayload,
  Episode,
  MediaDetail,
  TMDBMediaRaw,
  TMDBMediaType,
  TitleDetailResponsePayload,
} from './types';

let tmdbClient: AxiosInstance | null = null;

function getTmdbClient(): AxiosInstance {
  if (tmdbClient) return tmdbClient;

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    throw new Error('TMDB_API_KEY environment variable is not configured.');
  }

  tmdbClient = axios.create({
    baseURL: 'https://api.themoviedb.org/3',
    timeout: 10000,
  });

  tmdbClient.interceptors.request.use((config) => {
    const headers = AxiosHeaders.from(config.headers ?? {});
    if (apiKey.startsWith('eyJ')) {
      headers.set('Authorization', `Bearer ${apiKey}`);
    } else {
      config.params = { ...(config.params ?? {}), api_key: apiKey };
    }

    headers.set('Accept', 'application/json');
    config.headers = headers;
    return config;
  });

  return tmdbClient;
}

type FetchCollectionArgs = {
  slug: keyof typeof NETFLIX_COLLECTIONS;
};

export async function fetchCollection(
  args: FetchCollectionArgs,
): Promise<CollectionResponsePayload> {
  const { slug } = args;
  const config = NETFLIX_COLLECTIONS[slug];

  const client = getTmdbClient();
  const response = await client.get<{ results: TMDBMediaRaw[] }>(config.path, {
    params: config.params,
  });

  const items = (response.data.results ?? [])
    .filter((item) => item.backdrop_path || item.poster_path)
    .map((item) => normalizeMediaItem(item, config));

  return {
    slug,
    label: config.label,
    items,
    fetchedAt: new Date().toISOString(),
  };
}

type FetchTitleDetailArgs = {
  id: number;
  mediaType: TMDBMediaType;
};

type TMDBMovieDetail = TMDBMediaRaw & {
  genres?: Array<{ id: number; name: string }>;
  runtime?: number | null;
  tagline?: string | null;
  homepage?: string | null;
  status?: string | null;
};

type TMDBTvSeasonSummary = {
  id: number;
  season_number: number;
  episode_count: number;
  name?: string;
};

type TMDBTvDetail = TMDBMediaRaw & {
  genres?: Array<{ id: number; name: string }>;
  episode_run_time?: number[];
  number_of_episodes?: number | null;
  number_of_seasons?: number | null;
  homepage?: string | null;
  status?: string | null;
  tagline?: string | null;
  seasons?: TMDBTvSeasonSummary[];
};

type TMDBSeasonDetail = {
  episodes?: Array<{
    id: number;
    name: string;
    overview: string;
    episode_number: number;
    season_number: number;
    still_path: string | null;
    air_date: string | null;
    runtime?: number | null;
  }>;
};

function pickPrimarySeason(
  seasons: TMDBTvSeasonSummary[] | undefined,
): TMDBTvSeasonSummary | null {
  if (!seasons?.length) return null;
  const sorted = [...seasons].sort((a, b) => a.season_number - b.season_number);
  return (
    sorted.find((season) => season.season_number > 0 && season.episode_count > 0) ?? null
  );
}

async function buildTvDetail(id: number, data: TMDBTvDetail): Promise<MediaDetail> {
  const config = buildDetailConfig('tv');
  const base = normalizeMediaItem({ ...data, media_type: 'tv' }, config);

  const client = getTmdbClient();

  const primarySeason = pickPrimarySeason(data.seasons);
  let episodes: Episode[] = [];
  if (primarySeason) {
    try {
      const seasonResponse = await client.get<TMDBSeasonDetail>(
        `/tv/${id}/season/${primarySeason.season_number}`,
      );
      episodes = (seasonResponse.data.episodes ?? []).map((episode) =>
        normalizeEpisode({
          ...episode,
          season_number: episode.season_number ?? primarySeason.season_number,
        }),
      );
    } catch (error) {
      console.warn('Failed to fetch TMDB season details', error);
    }
  }

  return buildMediaDetail(base, {
    tagline: data.tagline ?? null,
    genres: formatGenres(data.genres),
    homepage: data.homepage ?? null,
    runtime: data.episode_run_time?.[0] ?? null,
    numberOfSeasons: data.number_of_seasons ?? null,
    numberOfEpisodes: data.number_of_episodes ?? null,
    status: data.status ?? null,
    episodes,
  });
}

function buildMovieDetail(id: number, data: TMDBMovieDetail): MediaDetail {
  const config = buildDetailConfig('movie');
  const base = normalizeMediaItem({ ...data, media_type: 'movie' }, config);

  return buildMediaDetail(base, {
    tagline: data.tagline ?? null,
    genres: formatGenres(data.genres),
    homepage: data.homepage ?? null,
    runtime: data.runtime ?? null,
    numberOfSeasons: null,
    numberOfEpisodes: null,
    status: data.status ?? null,
    episodes: [],
  });
}

export async function fetchTitleDetail(
  args: FetchTitleDetailArgs,
): Promise<TitleDetailResponsePayload> {
  const { id, mediaType } = args;
  const client = getTmdbClient();

  if (mediaType === 'movie') {
    const response = await client.get<TMDBMovieDetail>(`/movie/${id}`);
    const media = buildMovieDetail(id, response.data);
    return {
      media,
      fetchedAt: new Date().toISOString(),
    };
  }

  const response = await client.get<TMDBTvDetail>(`/tv/${id}`);
  const media = await buildTvDetail(id, response.data);
  return {
    media,
    fetchedAt: new Date().toISOString(),
  };
}
