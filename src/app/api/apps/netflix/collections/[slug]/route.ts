import { NextRequest, NextResponse } from 'next/server';
import { NETFLIX_COLLECTIONS, isCollectionSlug } from '@/lib/netflix/collections';
import { fetchCollection } from '@/lib/netflix/tmdb-server';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const slug = params?.slug;

  if (!slug || !isCollectionSlug(slug)) {
    return NextResponse.json(
      {
        error: 'Unknown collection',
        allowed: Object.entries(NETFLIX_COLLECTIONS).map(([key, value]) => ({
          slug: key,
          label: value.label,
        })),
      },
      { status: 400 },
    );
  }

  try {
    const payload = await fetchCollection({ slug });
    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'cache-control': 'no-store',
      },
    });
  } catch (error) {
    console.error('TMDB collection fetch failed', error);
    return NextResponse.json(
      {
        error: 'Failed to communicate with TMDB.',
      },
      { status: 502 },
    );
  }
}
