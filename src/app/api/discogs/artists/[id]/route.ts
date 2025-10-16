import { NextResponse } from 'next/server';
import { fetchDiscogs, isDiscogsApiError } from '@/lib/discogs/client';
import type { DiscogsArtist, DiscogsSearchResponse } from '@/types/discogs';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const url = new URL(request.url);
  const includeReleases = url.searchParams
    .get('include')
    ?.split(',')
    .includes('releases');

  try {
    const artist = await fetchDiscogs<DiscogsArtist>(`/artists/${id}`);
    let releases: DiscogsSearchResponse | null = null;

    if (includeReleases) {
      releases = await fetchDiscogs<DiscogsSearchResponse>(`/artists/${id}/releases`, {
        searchParams: {
          sort: 'year',
          sort_order: 'desc',
        },
      });
    }

    return NextResponse.json({ artist, releases });
  } catch (error) {
    if (isDiscogsApiError(error)) {
      return NextResponse.json(
        { error: error.message, details: error.details, status: error.status },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch Discogs artist' },
      { status: 500 },
    );
  }
}
