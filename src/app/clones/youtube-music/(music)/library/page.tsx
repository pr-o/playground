'use client';

export default function YoutubeMusicLibraryPage() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-text-muted">
          YouTube Music
        </p>
        <h1 className="text-3xl font-semibold text-glow-music">Library</h1>
        <p className="max-w-xl text-sm text-music-text-secondary">
          Library management, saved playlists, and liked songs will appear here once data
          modeling is connected to the Spotify library helpers.
        </p>
      </header>
    </section>
  );
}
