import type { Metadata } from 'next';

import { MusicArtistDetail } from '@/components/apps/youtube-music/MusicArtistDetail';
import { getMusicArtistDetail } from '@/lib/music';

type ArtistPageParams = {
  id: string;
};

type ArtistPageProps = {
  params: Promise<ArtistPageParams>;
};

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { id } = await params;
  const result = await getMusicArtistDetail(id);
  const name = result.ok ? result.data.hero.name : humanizeIdentifier(id);
  return {
    title: `${name} • Artist • YouTube Music Clone`,
  };
}

export default async function YoutubeMusicArtistPage({ params }: ArtistPageProps) {
  const { id } = await params;
  const result = await getMusicArtistDetail(id);

  if (!result.ok) {
    return (
      <section className="flex flex-1 flex-col gap-6 p-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
            YouTube Music
          </p>
          <h1 className="text-3xl font-semibold text-glow-music">Artist unavailable</h1>
          <p className="max-w-xl text-sm text-music-secondary">
            We couldn&apos;t load this Discogs artist. Please try again shortly.
          </p>
        </header>
        <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-6 text-sm text-red-100">
          <p className="font-semibold">Discogs error</p>
          <p className="mt-2 text-red-100/80">{result.error}</p>
        </div>
      </section>
    );
  }

  const { hero, topTracks, popularReleases, relatedArtists } = result.data;

  return (
    <MusicArtistDetail
      hero={hero}
      topTracks={topTracks}
      popularReleases={popularReleases}
      relatedArtists={relatedArtists}
    />
  );
}

function humanizeIdentifier(identifier: string) {
  return decodeURIComponent(identifier.replace(/-/g, ' '));
}
