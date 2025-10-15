import { NextResponse } from 'next/server';
import { fetchDiscogs, isDiscogsApiError } from '@/lib/discogs/client';
import type { DiscogsSearchResponse } from '@/types/discogs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get('q') ?? '';
  const type = url.searchParams.get('type') ?? undefined;
  const genre = url.searchParams.get('genre') ?? undefined;
  const style = url.searchParams.get('style') ?? undefined;
  const perPage = url.searchParams.get('per_page') ?? '20';
  const page = url.searchParams.get('page') ?? '1';

  try {
    const data = await fetchDiscogs<DiscogsSearchResponse>('/database/search', {
      searchParams: {
        q: query,
        type,
        genre,
        style,
        per_page: perPage,
        page,
      },
    });
    return NextResponse.json(data);
  } catch (error) {
    if (isDiscogsApiError(error)) {
      return NextResponse.json(
        { error: error.message, details: error.details, status: error.status },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch Discogs search results' },
      { status: 500 },
    );
  }
}
