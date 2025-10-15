import {
  getDiscogsBaseUrl,
  getDiscogsConsumerKey,
  getDiscogsConsumerSecret,
  getDiscogsUserAgent,
  getDiscogsUserToken,
  hasDiscogsAuth,
} from '@/lib/discogs/config';

type Primitive = string | number | boolean | null | undefined;

export type DiscogsRequestOptions<T> = {
  searchParams?: Record<string, Primitive | Primitive[]>;
  init?: RequestInit;
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  mock?: () => T;
  forceMock?: boolean;
};

export class DiscogsApiError extends Error {
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

export class DiscogsRateLimitError extends DiscogsApiError {
  retryAfter?: number;

  constructor(
    message: string,
    status: number,
    statusText: string,
    retryAfter?: number,
    details?: unknown,
  ) {
    super(message, status, statusText, details);
    this.retryAfter = retryAfter;
  }
}

export function isDiscogsApiError(error: unknown): error is DiscogsApiError {
  return error instanceof DiscogsApiError;
}

function buildDiscogsUrl(
  path: string,
  searchParams?: Record<string, Primitive | Primitive[]>,
) {
  const url = new URL(path.startsWith('http') ? path : `${getDiscogsBaseUrl()}${path}`);
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== undefined && item !== null) {
            url.searchParams.append(key, String(item));
          }
        });
      } else {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url;
}

function attachConsumerCredentials(url: URL) {
  const key = getDiscogsConsumerKey();
  const secret = getDiscogsConsumerSecret();
  if (!key || !secret) return;
  if (!url.searchParams.has('key')) {
    url.searchParams.set('key', key);
  }
  if (!url.searchParams.has('secret')) {
    url.searchParams.set('secret', secret);
  }
}

export async function fetchDiscogs<T>(
  path: string,
  options: DiscogsRequestOptions<T> = {},
): Promise<T> {
  const { searchParams, init, cache, next, mock, forceMock } = options;

  if (forceMock && mock) {
    return mock();
  }

  if (!hasDiscogsAuth() && mock) {
    return mock();
  }

  const url = buildDiscogsUrl(path, searchParams);
  attachConsumerCredentials(url);

  const token = getDiscogsUserToken();

  const requestInit: RequestInit & {
    next?: { revalidate?: number | false; tags?: string[] };
  } = {
    ...init,
    method: init?.method ?? 'GET',
    headers: {
      'User-Agent': getDiscogsUserAgent(),
      Accept: 'application/json',
      ...(token ? { Authorization: `Discogs token=${token}` } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  };

  if (cache) {
    requestInit.cache = cache;
  }
  if (next) {
    requestInit.next = next;
  }

  const response = await fetch(url.toString(), requestInit);

  if (!response.ok) {
    const errorPayload = await safeParseJson(response);
    if (response.status === 429) {
      const retryAfter = Number.parseInt(response.headers.get('Retry-After') ?? '', 10);
      throw new DiscogsRateLimitError(
        `Discogs rate limit exceeded for ${url.pathname}`,
        response.status,
        response.statusText,
        Number.isFinite(retryAfter) ? retryAfter : undefined,
        errorPayload,
      );
    }

    if (mock) {
      return mock();
    }

    throw new DiscogsApiError(
      `Discogs request to ${url.pathname} failed`,
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
    return { error: 'Failed to parse Discogs error response', cause: error };
  }
}
