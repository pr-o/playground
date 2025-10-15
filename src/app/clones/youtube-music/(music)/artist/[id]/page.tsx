type ArtistPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function YoutubeMusicArtistPage({ params }: ArtistPageProps) {
  const { id } = await params;

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-text-muted">Artist</p>
        <h1 className="text-3xl font-semibold">Artist: {id}</h1>
        <p className="max-w-xl text-sm text-music-text-secondary">
          Artist highlights, top tracks, and related artists will render here using
          Spotify artist endpoints.
        </p>
      </header>
    </section>
  );
}
