type PlaylistPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function YoutubeMusicPlaylistPage({ params }: PlaylistPageProps) {
  const { id } = await params;

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-text-muted">
          Playlist
        </p>
        <h1 className="text-3xl font-semibold">Playlist: {id}</h1>
        <p className="max-w-xl text-sm text-music-text-secondary">
          Detailed playlist view with hero artwork, action buttons, and track list will be
          rendered here once data hooks are wired up.
        </p>
      </header>
    </section>
  );
}
