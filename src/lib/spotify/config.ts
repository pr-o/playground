import { headers } from 'next/headers';

export function getSpotifyClientId() {
  const clientId = process.env.SPOTIFY_API_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing SPOTIFY_API_CLIENT_ID environment variable');
  }
  return clientId;
}

export function getSpotifyClientSecret() {
  return process.env.SPOTIFY_API_CLIENT_SECRET ?? '';
}

export async function getSpotifyRedirectUri(request?: Request): Promise<string> {
  const envValue = process.env.SPOTIFY_API_REDIRECT_URI;
  const headerStore = request ? null : await headers();
  const getHeaderValue = (key: string) => {
    if (request) {
      return request.headers.get(key);
    }
    return headerStore?.get(key) ?? null;
  };

  if (envValue) {
    const candidates = envValue
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
    const requestedHost = request
      ? new URL(request.url).host
      : (getHeaderValue('x-forwarded-host') ?? getHeaderValue('host'));

    if (requestedHost) {
      const matchingCandidate = candidates.find((candidate) => {
        try {
          return new URL(candidate).host === requestedHost;
        } catch {
          return false;
        }
      });
      if (matchingCandidate) {
        return matchingCandidate;
      }
    }

    if (candidates.length) {
      return candidates[0];
    }
  }

  const host = getHeaderValue('x-forwarded-host') ?? getHeaderValue('host');
  if (!host) {
    throw new Error('Unable to determine host for Spotify redirect URI');
  }
  const protocol =
    getHeaderValue('x-forwarded-proto') ??
    (host.includes('localhost') ? 'http' : 'https');
  return `${protocol}://${host}/api/spotify/auth/callback`;
}
