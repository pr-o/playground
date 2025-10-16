import { cookies } from 'next/headers';
import { getSpotifyClientId, getSpotifyClientSecret } from '@/lib/spotify/config';

const ACCESS_TOKEN_COOKIE = 'spotify_access_token';
const REFRESH_TOKEN_COOKIE = 'spotify_refresh_token';
const EXPIRES_AT_COOKIE = 'spotify_access_token_expires_at';
const CODE_VERIFIER_COOKIE = 'spotify_code_verifier';
const STATE_COOKIE = 'spotify_auth_state';

const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

const ACCESS_TOKEN_BUFFER_MS = 60 * 1000;

function getCookieOptions(maxAgeSeconds: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: maxAgeSeconds,
  };
}

export function storeCodeVerifier(state: string, verifier: string) {
  const cookieStore = cookies();
  cookieStore.set(STATE_COOKIE, state, getCookieOptions(600));
  cookieStore.set(CODE_VERIFIER_COOKIE, verifier, getCookieOptions(600));
}

export function readCodeVerifier() {
  const cookieStore = cookies();
  const state = cookieStore.get(STATE_COOKIE)?.value ?? null;
  const verifier = cookieStore.get(CODE_VERIFIER_COOKIE)?.value ?? null;
  if (state) cookieStore.delete(STATE_COOKIE);
  if (verifier) cookieStore.delete(CODE_VERIFIER_COOKIE);
  return { state, verifier };
}

export function storeSpotifyTokens(params: {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}) {
  const cookieStore = cookies();
  const expiresAt = Date.now() + params.expiresIn * 1000;
  cookieStore.set(
    ACCESS_TOKEN_COOKIE,
    params.accessToken,
    getCookieOptions(params.expiresIn),
  );
  if (params.refreshToken) {
    cookieStore.set(
      REFRESH_TOKEN_COOKIE,
      params.refreshToken,
      getCookieOptions(30 * 24 * 60 * 60),
    );
  }
  cookieStore.set(
    EXPIRES_AT_COOKIE,
    String(expiresAt),
    getCookieOptions(params.expiresIn),
  );
}

export function clearSpotifyTokens() {
  const cookieStore = cookies();
  [ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, EXPIRES_AT_COOKIE].forEach((name) => {
    cookieStore.delete(name);
  });
}

export function getStoredAccessToken() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value ?? null;
  const expiresAtValue = cookieStore.get(EXPIRES_AT_COOKIE)?.value ?? null;
  const expiresAt = expiresAtValue ? Number.parseInt(expiresAtValue, 10) : null;
  return { accessToken, expiresAt };
}

export function getStoredRefreshToken() {
  return cookies().get(REFRESH_TOKEN_COOKIE)?.value ?? null;
}

export async function refreshSpotifyAccessToken() {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('Missing Spotify refresh token');
  }

  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: getSpotifyClientId(),
  });

  if (getSpotifyClientSecret()) {
    body.append('client_secret', getSpotifyClientSecret());
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(
      `Failed to refresh Spotify access token: ${response.status} ${
        response.statusText
      } ${(errorPayload && JSON.stringify(errorPayload)) || ''}`,
    );
  }

  const payload = (await response.json()) as {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token?: string;
  };

  storeSpotifyTokens({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token ?? refreshToken,
    expiresIn: payload.expires_in,
  });

  return payload.access_token;
}

export async function getValidSpotifyAccessToken() {
  const { accessToken, expiresAt } = getStoredAccessToken();

  if (accessToken && expiresAt && Date.now() + ACCESS_TOKEN_BUFFER_MS < expiresAt) {
    return accessToken;
  }

  try {
    return await refreshSpotifyAccessToken();
  } catch (error) {
    clearSpotifyTokens();
    throw error;
  }
}

export async function exchangeCodeForToken(params: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: params.code,
    redirect_uri: params.redirectUri,
    client_id: getSpotifyClientId(),
    code_verifier: params.codeVerifier,
  });

  if (getSpotifyClientSecret()) {
    body.append('client_secret', getSpotifyClientSecret());
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
    cache: 'no-store',
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => null);
    throw new Error(
      `Spotify token exchange failed: ${response.status} ${
        response.statusText
      } ${(errorPayload && JSON.stringify(errorPayload)) || ''}`,
    );
  }

  const payload = (await response.json()) as {
    access_token: string;
    token_type: string;
    scope: string;
    expires_in: number;
    refresh_token?: string;
  };

  storeSpotifyTokens({
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in,
  });

  return payload;
}

export function getSpotifyAuthCookies() {
  return {
    stateCookie: STATE_COOKIE,
    verifierCookie: CODE_VERIFIER_COOKIE,
    accessTokenCookie: ACCESS_TOKEN_COOKIE,
    refreshTokenCookie: REFRESH_TOKEN_COOKIE,
    expiresAtCookie: EXPIRES_AT_COOKIE,
  };
}
