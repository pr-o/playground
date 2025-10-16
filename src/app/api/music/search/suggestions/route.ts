import { NextResponse } from 'next/server';
import { getMusicSearchSuggestions } from '@/lib/music';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') ?? '';

  if (!query.trim()) {
    return NextResponse.json({ suggestions: [] });
  }

  try {
    const suggestions = await getMusicSearchSuggestions(query);
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Failed to load search suggestions', error);
    return NextResponse.json({ suggestions: [] }, { status: 500 });
  }
}
