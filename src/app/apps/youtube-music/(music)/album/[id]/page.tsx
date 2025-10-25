import type { Metadata } from 'next';

import { MusicAlbumDetail } from '@/components/apps/youtube-music/MusicAlbumDetail';
import { getMusicAlbumDetail } from '@/lib/music';

type AlbumPageParams = {
  id: string;
};

type AlbumPageProps = {
  params: Promise<AlbumPageParams>;
};

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { id } = await params;
  const titleId = humanizeIdentifier(id);
  return {
    title: `${titleId} • Album • YouTube Music Clone`,
  };
}

export default async function YoutubeMusicAlbumPage({ params }: AlbumPageProps) {
  const { id } = await params;
  const result = await getMusicAlbumDetail(id);

  if (!result.ok) {
    return (
      <section className="flex flex-1 flex-col gap-6 p-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
            YouTube Music
          </p>
          <h1 className="text-3xl font-semibold text-glow-music">Album unavailable</h1>
          <p className="max-w-xl text-sm text-music-secondary">
            We couldn&apos;t load this Discogs release. Please try again shortly.
          </p>
        </header>
        <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-6 text-sm text-red-100">
          <p className="font-semibold">Discogs error</p>
          <p className="mt-2 text-red-100/80">{result.error}</p>
        </div>
      </section>
    );
  }

  const { hero, tracks, related } = result.data;

  return <MusicAlbumDetail hero={hero} tracks={tracks} related={related} />;
}

function humanizeIdentifier(identifier: string) {
  return decodeURIComponent(identifier.replace(/-/g, ' '));
}
