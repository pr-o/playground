import { NextResponse } from 'next/server';
import { getMusicLibraryData } from '@/lib/music';

export async function GET() {
  const result = await getMusicLibraryData();
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json(result.data);
}
