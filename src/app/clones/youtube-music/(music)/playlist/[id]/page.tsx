import type { Metadata } from 'next';

import { MusicPlaylistDetail } from '@/components/clones/youtube-music/MusicPlaylistDetail';
import { getMusicPlaylistDetail } from '@/lib/music';

type PlaylistPageParams = {
  id: string;
};

type PlaylistPageProps = {
  params: Promise<PlaylistPageParams>;
};

export async function generateMetadata({ params }: PlaylistPageProps): Promise<Metadata> {
  const { id } = await params;
  const titleId = humanizeIdentifier(id);
  return {
    title: `${titleId} • Playlist • YouTube Music Clone`,
  };
}

export default async function YoutubeMusicPlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  const result = await getMusicPlaylistDetail(id);

  if (!result.ok) {
    return (
      <section className="flex flex-1 flex-col gap-6 p-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
            YouTube Music
          </p>
          <h1 className="text-3xl font-semibold text-glow-music">Playlist unavailable</h1>
          <p className="max-w-xl text-sm text-music-secondary">
            We couldn&apos;t load this Discogs playlist. Please try again shortly.
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

  return <MusicPlaylistDetail hero={hero} tracks={tracks} related={related} />;
}

function humanizeIdentifier(identifier: string) {
  return decodeURIComponent(identifier.replace(/-/g, ' '));
}
