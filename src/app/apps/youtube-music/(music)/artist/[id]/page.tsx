import type { Metadata } from 'next';

type ArtistPageParams = {
  id: string;
};

type ArtistPageProps = {
  params: Promise<ArtistPageParams>;
};

export async function generateMetadata({ params }: ArtistPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${humanizeIdentifier(id)} • Artist • YouTube Music Clone`,
  };
}

export default async function YoutubeMusicArtistPage({ params }: ArtistPageProps) {
  const { id } = await params;
  const humanId = humanizeIdentifier(id);

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-muted">Artist</p>
        <h1 className="text-3xl font-semibold">Artist: {humanId}</h1>
        <p className="max-w-xl text-sm text-music-secondary">
          Artist highlights, top tracks, and related artists will render here using
          Spotify artist endpoints.
        </p>
      </header>
    </section>
  );
}

function humanizeIdentifier(identifier: string) {
  return decodeURIComponent(identifier.replace(/-/g, ' '));
}
