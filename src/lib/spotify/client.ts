import { cookies } from 'next/headers';
import { getValidSpotifyAccessToken } from '@/lib/spotify/session';

const SPOTIFY_BASE_URL = 'https://api.spotify.com/v1';
const DEFAULT_REVALIDATE_SECONDS = 60 * 15;

const ACCESS_TOKEN_COOKIE = 'spotify_access_token';
const EXPIRES_AT_COOKIE = 'spotify_access_token_expires_at';

type Primitive = string | number | boolean | null | undefined;

export type SpotifyRequestOptions<T> = {
  searchParams?: Record<string, Primitive>;
  init?: RequestInit & { next?: { revalidate?: number } };
  revalidate?: number;
  cache?: RequestCache;
  mock?: () => T;
  forceMock?: boolean;
};

export class SpotifyApiError extends Error {
  status: number;
  statusText: string;
  details?: unknown;

  constructor(message: string, status: number, statusText: string, details?: unknown) {
    super(message);
    this.status = status;
    this.statusText = statusText;
    this.details = details;
  }
}

export function isSpotifyApiError(error: unknown): error is SpotifyApiError {
  return error instanceof SpotifyApiError;
}

function buildSpotifyUrl(path: string, searchParams?: Record<string, Primitive>) {
  const url = new URL(path.startsWith('http') ? path : `${SPOTIFY_BASE_URL}${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      url.searchParams.set(key, String(value));
    });
  }
  return url.toString();
}

async function resolveSpotifyAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const expiresAtValue = cookieStore.get(EXPIRES_AT_COOKIE)?.value ?? null;
  const expiresAt = expiresAtValue ? Number.parseInt(expiresAtValue, 10) : null;

  if (cookieToken && expiresAt && Date.now() < expiresAt - 60_000) {
    return cookieToken;
  }

  try {
    return await getValidSpotifyAccessToken();
  } catch (error) {
    const fallbackToken =
      process.env.SPOTIFY_DEMO_TOKEN ??
      process.env.NEXT_PUBLIC_SPOTIFY_DEMO_TOKEN ??
      process.env.SPOTIFY_ACCESS_TOKEN ??
      null;
    if (fallbackToken) {
      return fallbackToken;
    }
    throw error;
  }
}

export async function fetchSpotify<T>(
  path: string,
  options: SpotifyRequestOptions<T> = {},
): Promise<T> {
  const { searchParams, mock, forceMock, cache, revalidate, init } = options;

  if (forceMock && mock) {
    return mock();
  }

  const token = await resolveSpotifyAccessToken().catch(() => null);
  if (!token) {
    if (mock) {
      return mock();
    }
    throw new SpotifyApiError(
      'Missing Spotify access token. Provide SPOTIFY_DEMO_TOKEN or enable mock mode.',
      401,
      'Unauthorized',
    );
  }

  const url = buildSpotifyUrl(path, searchParams);
  const requestInit: RequestInit & { next?: { revalidate?: number } } = {
    method: 'GET',
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(init?.headers as Record<string, string> | undefined),
    },
  };

  if (cache) {
    requestInit.cache = cache;
  }

  if (revalidate !== undefined) {
    requestInit.next = { ...(init?.next ?? {}), revalidate };
  } else if (!requestInit.next) {
    requestInit.next = { revalidate: DEFAULT_REVALIDATE_SECONDS };
  }

  const response = await fetch(url, requestInit);

  if (!response.ok) {
    const errorPayload = await safeParseJson(response);
    if (mock) {
      return mock();
    }
    throw new SpotifyApiError(
      `Spotify request to ${url} failed`,
      response.status,
      response.statusText,
      errorPayload,
    );
  }

  return (await response.json()) as T;
}

async function safeParseJson(response: Response) {
  try {
    return await response.json();
  } catch (error) {
    return { error: 'Failed to parse Spotify error response', cause: error };
  }
}
