import type { Metadata } from 'next';

import { MusicMixDetail } from '@/components/clones/youtube-music/MusicMixDetail';
import { getMusicMixDetail } from '@/lib/music';

type MixPageParams = {
  id: string;
};

type MixPageProps = {
  params: Promise<MixPageParams>;
};

export async function generateMetadata({ params }: MixPageProps): Promise<Metadata> {
  const { id } = await params;
  const humanId = humanizeIdentifier(id);
  return {
    title: `${humanId} • Mix • YouTube Music Clone`,
  };
}

export default async function YoutubeMusicMixPage({ params }: MixPageProps) {
  const { id } = await params;
  const result = await getMusicMixDetail(id);

  if (!result.ok) {
    return (
      <section className="flex flex-1 flex-col gap-6 p-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-music-muted">Mix</p>
          <h1 className="text-3xl font-semibold text-glow-music">Mix unavailable</h1>
          <p className="max-w-xl text-sm text-music-secondary">
            We couldn&apos;t assemble this Discogs-powered mix. Please try again shortly.
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

  return <MusicMixDetail hero={hero} tracks={tracks} related={related} />;
}

function humanizeIdentifier(identifier: string) {
  return decodeURIComponent(identifier.replace(/-/g, ' '));
}
