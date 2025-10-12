import axios, { AxiosInstance } from 'axios';
import { NETFLIX_COLLECTIONS } from './collections';
import { normalizeMediaItem } from './normalize';
import type { CollectionResponsePayload, TMDBMediaRaw } from './types';

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
    if (!config.headers) config.headers = {};
    if (apiKey.startsWith('eyJ')) {
      config.headers.Authorization = `Bearer ${apiKey}`;
    } else {
      config.params = { ...(config.params ?? {}), api_key: apiKey };
    }

    config.headers.Accept = 'application/json';
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
