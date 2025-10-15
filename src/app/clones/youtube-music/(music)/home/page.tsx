'use client';

export default function YoutubeMusicHomePage() {
  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-text-muted">
          YouTube Music
        </p>
        <h1 className="text-3xl font-semibold text-glow-music">Home</h1>
        <p className="max-w-xl text-sm text-music-text-secondary">
          This is a placeholder for the YouTube Music home experience. Upcoming iterations
          will introduce the library carousel, quick picks, and personalized mixes.
        </p>
      </header>
    </section>
  );
}
