import { NextRequest, NextResponse } from 'next/server';
import { fetchTitleDetail } from '@/lib/netflix/tmdb-server';
import type { TMDBMediaType } from '@/lib/netflix/types';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ mediaType: string; id: string }>;
}

function isMediaType(value: string): value is TMDBMediaType {
  return value === 'movie' || value === 'tv';
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const mediaType = params?.mediaType;
  const idRaw = params?.id;

  if (!mediaType || !isMediaType(mediaType)) {
    return NextResponse.json(
      { error: 'Unsupported media type. Expected "movie" or "tv".' },
      { status: 400 },
    );
  }

  const id = Number(idRaw);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid media identifier.' }, { status: 400 });
  }

  try {
    const payload = await fetchTitleDetail({ id, mediaType });
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Failed to fetch TMDB title detail', error);
    return NextResponse.json(
      { error: 'Unable to retrieve title details at the moment.' },
      { status: 502 },
    );
  }
}
