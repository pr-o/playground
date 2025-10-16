import type { Metadata } from 'next';

type MixPageParams = {
  id: string;
};

type MixPageProps = {
  params: Promise<MixPageParams>;
};

export async function generateMetadata({ params }: MixPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${humanizeIdentifier(id)} • Mix • YouTube Music Clone`,
  };
}

export default async function YoutubeMusicMixPage({ params }: MixPageProps) {
  const { id } = await params;
  const humanId = humanizeIdentifier(id);

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-muted">Mix</p>
        <h1 className="text-3xl font-semibold">Mix: {humanId}</h1>
        <p className="max-w-xl text-sm text-music-secondary">
          Dynamic mixes will be powered by Spotify recommendations once recommendation
          helpers are complete.
        </p>
      </header>
    </section>
  );
}

function humanizeIdentifier(identifier: string) {
  return decodeURIComponent(identifier.replace(/-/g, ' '));
}
