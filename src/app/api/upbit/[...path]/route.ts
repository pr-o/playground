import { NextRequest, NextResponse } from 'next/server';
import { UPBIT_API_BASE } from '@/lib/upbit/constants';

const ALLOWED_SEGMENTS = new Set(['market', 'ticker', 'orderbook', 'trades', 'candles']);

function isAllowedPath(segments: string[]): boolean {
  if (!segments.length) return false;
  if (!ALLOWED_SEGMENTS.has(segments[0])) return false;

  if (segments[0] === 'market') {
    return segments[1] === 'all';
  }

  if (segments[0] === 'trades') {
    return segments[1] === 'ticks';
  }

  return true;
}

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const params = await context.params;
  const segments = params?.path ?? [];
  if (!isAllowedPath(segments)) {
    return NextResponse.json({ error: 'Unsupported Upbit endpoint' }, { status: 400 });
  }

  const upstreamPath = segments.join('/');
  const url = new URL(`${UPBIT_API_BASE}/${upstreamPath}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });

  try {
    const upstreamResponse = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    const contentType = upstreamResponse.headers.get('content-type');
    if (contentType) {
      responseHeaders.set('content-type', contentType);
    }
    responseHeaders.set('cache-control', 'no-store');

    if (!upstreamResponse.ok) {
      const errorBody = await upstreamResponse.text();
      return new NextResponse(errorBody, {
        status: upstreamResponse.status,
        headers: responseHeaders,
      });
    }

    const body = await upstreamResponse.arrayBuffer();
    return new NextResponse(body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Upbit proxy failed', error);
    return NextResponse.json({ error: 'Failed to reach Upbit API' }, { status: 502 });
  }
}
