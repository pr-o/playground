import { NextResponse } from 'next/server';
import { getCategories, isSpotifyApiError } from '@/lib/spotify';

const hasSpotifyToken = Boolean(
  process.env.SPOTIFY_DEMO_TOKEN ??
    process.env.NEXT_PUBLIC_SPOTIFY_DEMO_TOKEN ??
    process.env.SPOTIFY_ACCESS_TOKEN,
);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const country = url.searchParams.get('country') ?? undefined;
  const locale = url.searchParams.get('locale') ?? undefined;
  const limit = url.searchParams.get('limit');
  const offset = url.searchParams.get('offset');

  try {
    const data = await getCategories({
      country,
      locale,
      limit: limit ? Number.parseInt(limit, 10) : undefined,
      offset: offset ? Number.parseInt(offset, 10) : undefined,
      forceMock: !hasSpotifyToken,
    });
    return NextResponse.json(data);
  } catch (error) {
    if (isSpotifyApiError(error)) {
      return NextResponse.json(
        { error: error.message, details: error.details },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: 'Unexpected error fetching categories' },
      { status: 500 },
    );
  }
}
