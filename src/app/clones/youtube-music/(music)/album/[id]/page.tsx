type AlbumPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function YoutubeMusicAlbumPage({ params }: AlbumPageProps) {
  const { id } = await params;

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-text-muted">Album</p>
        <h1 className="text-3xl font-semibold">Album: {id}</h1>
        <p className="max-w-xl text-sm text-music-text-secondary">
          Album details, track sequencing, and related releases will populate this view in
          later phases.
        </p>
      </header>
    </section>
  );
}
