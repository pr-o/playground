import { getMusicExploreData } from '@/lib/music';
import { MusicExploreTabs } from '@/components/apps/youtube-music/MusicExploreTabs';

export default async function YoutubeMusicExplorePage() {
  const result = await getMusicExploreData();

  if (!result.ok) {
    return (
      <section className="flex flex-1 flex-col gap-6 p-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
            YouTube Music
          </p>
          <h1 className="text-3xl font-semibold text-glow-music">Explore</h1>
          <p className="max-w-xl text-sm text-music-secondary">
            Discogs explore data is temporarily unavailable. Please refresh shortly.
          </p>
        </header>
        <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-6 text-sm text-red-100">
          <p className="font-semibold">Discogs error</p>
          <p className="mt-2 text-red-100/80">{result.error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-10 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
          YouTube Music
        </p>
        <h1 className="text-3xl font-semibold text-glow-music">Explore</h1>
        <p className="max-w-xl text-sm text-music-secondary">
          Dig into Discogs genres and recent releases curated just for this clone.
        </p>
      </header>

      <MusicExploreTabs sections={result.data.sections} />
    </section>
  );
}
