import type { Metadata } from 'next';

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
  const humanId = humanizeIdentifier(id);

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-muted">Playlist</p>
        <h1 className="text-3xl font-semibold">Playlist: {humanId}</h1>
        <p className="max-w-xl text-sm text-music-secondary">
          Detailed playlist view with hero artwork, action buttons, and track list will be
          rendered here once data hooks are wired up.
        </p>
      </header>
    </section>
  );
}

function humanizeIdentifier(identifier: string) {
  return decodeURIComponent(identifier.replace(/-/g, ' '));
}
