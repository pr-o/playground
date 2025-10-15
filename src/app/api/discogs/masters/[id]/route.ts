import { NextResponse } from 'next/server';
import { fetchDiscogs, isDiscogsApiError } from '@/lib/discogs/client';
import type { DiscogsMasterRelease } from '@/types/discogs';

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  const { id } = await params;

  try {
    const data = await fetchDiscogs<DiscogsMasterRelease>(`/masters/${id}`);
    return NextResponse.json(data);
  } catch (error) {
    if (isDiscogsApiError(error)) {
      return NextResponse.json(
        { error: error.message, details: error.details, status: error.status },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch Discogs master release' },
      { status: 500 },
    );
  }
}
