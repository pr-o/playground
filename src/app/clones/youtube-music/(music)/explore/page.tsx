'use client';

export default function YoutubeMusicExplorePage() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-text-muted">
          YouTube Music
        </p>
        <h1 className="text-3xl font-semibold text-glow-music">Explore</h1>
        <p className="max-w-xl text-sm text-music-text-secondary">
          The explore tab will showcase categories, charts, and new releases sourced from
          Spotify browse endpoints.
        </p>
      </header>
    </section>
  );
}
