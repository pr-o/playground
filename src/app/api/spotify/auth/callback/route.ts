import { NextResponse } from 'next/server';
import { MUSIC_BASE_PATH } from '@/lib/music/constants';
import {
  exchangeCodeForToken,
  readCodeVerifier,
  clearSpotifyTokens,
} from '@/lib/spotify/session';
import { getSpotifyRedirectUri } from '@/lib/spotify/config';

export async function GET(request: Request) {
  const redirectUrl = new URL(request.url);
  const code = redirectUrl.searchParams.get('code');
  const state = redirectUrl.searchParams.get('state');
  const error = redirectUrl.searchParams.get('error');

  if (error) {
    await clearSpotifyTokens();
    return NextResponse.redirect(
      `${MUSIC_BASE_PATH}?auth_error=${encodeURIComponent(error)}`,
    );
  }

  if (!code || !state) {
    await clearSpotifyTokens();
    return NextResponse.redirect(`${MUSIC_BASE_PATH}?auth_error=missing_code_state`);
  }

  const stored = await readCodeVerifier();
  if (!stored.state || !stored.verifier || stored.state !== state) {
    await clearSpotifyTokens();
    return NextResponse.redirect(`${MUSIC_BASE_PATH}?auth_error=invalid_state`);
  }

  try {
    await exchangeCodeForToken({
      code,
      codeVerifier: stored.verifier,
      redirectUri: await getSpotifyRedirectUri(request),
    });
  } catch {
    await clearSpotifyTokens();
    return NextResponse.redirect(
      `${MUSIC_BASE_PATH}?auth_error=${encodeURIComponent('token_exchange_failed')}`,
    );
  }

  return NextResponse.redirect(MUSIC_BASE_PATH);
}
