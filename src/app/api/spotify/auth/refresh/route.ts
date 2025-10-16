import { NextResponse } from 'next/server';
import { refreshSpotifyAccessToken } from '@/lib/spotify/session';

export async function POST() {
  try {
    const accessToken = await refreshSpotifyAccessToken();
    return NextResponse.json({ access_token: accessToken });
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message ?? 'Failed to refresh access token',
      },
      { status: 400 },
    );
  }
}
