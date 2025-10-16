import { NextResponse } from 'next/server';
import {
  generateCodeChallenge,
  generateCodeVerifier,
  generateStateToken,
  SPOTIFY_AUTH_SCOPES,
} from '@/lib/spotify/auth';
import { storeCodeVerifier } from '@/lib/spotify/session';
import { getSpotifyClientId, getSpotifyRedirectUri } from '@/lib/spotify/config';

const AUTHORIZE_ENDPOINT = 'https://accounts.spotify.com/authorize';

export async function GET(request: Request) {
  const state = generateStateToken();
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const redirectUri = await getSpotifyRedirectUri(request);

  await storeCodeVerifier(state, codeVerifier);

  const authorizeUrl = new URL(AUTHORIZE_ENDPOINT);
  authorizeUrl.searchParams.set('client_id', getSpotifyClientId());
  authorizeUrl.searchParams.set('response_type', 'code');
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('code_challenge_method', 'S256');
  authorizeUrl.searchParams.set('code_challenge', codeChallenge);
  authorizeUrl.searchParams.set('state', state);
  authorizeUrl.searchParams.set('scope', SPOTIFY_AUTH_SCOPES.join(' '));

  return NextResponse.redirect(authorizeUrl.toString());
}
