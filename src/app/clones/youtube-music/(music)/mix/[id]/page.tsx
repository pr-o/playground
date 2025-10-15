type MixPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function YoutubeMusicMixPage({ params }: MixPageProps) {
  const { id } = await params;

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-text-muted">Mix</p>
        <h1 className="text-3xl font-semibold">Mix: {id}</h1>
        <p className="max-w-xl text-sm text-music-text-secondary">
          Dynamic mixes will be powered by Spotify recommendations once recommendation
          helpers are complete.
        </p>
      </header>
    </section>
  );
}
