import type { Metadata } from 'next';

type AlbumPageParams = {
  id: string;
};

type AlbumPageProps = {
  params: Promise<AlbumPageParams>;
};

export async function generateMetadata({ params }: AlbumPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `${humanizeIdentifier(id)} • Album • YouTube Music Clone`,
  };
}

export default async function YoutubeMusicAlbumPage({ params }: AlbumPageProps) {
  const { id } = await params;
  const humanId = humanizeIdentifier(id);

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-muted">Album</p>
        <h1 className="text-3xl font-semibold">Album: {humanId}</h1>
        <p className="max-w-xl text-sm text-music-secondary">
          Album details, track sequencing, and related releases will populate this view in
          later phases.
        </p>
      </header>
    </section>
  );
}

function humanizeIdentifier(identifier: string) {
  return decodeURIComponent(identifier.replace(/-/g, ' '));
}
