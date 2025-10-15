'use client';

export default function YoutubeMusicSearchPage() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
          YouTube Music
        </p>
        <h1 className="text-3xl font-semibold text-glow-music">Search</h1>
        <p className="max-w-xl text-sm text-music-secondary">
          A unified search experience will surface tracks, albums, playlists, and artists.
          This placeholder keeps routing intact until integration lands.
        </p>
      </header>
    </section>
  );
}
