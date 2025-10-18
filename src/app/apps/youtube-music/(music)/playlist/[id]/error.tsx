'use client';

type PlaylistErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PlaylistError({ error, reset }: PlaylistErrorProps) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold text-music-primary">Something went wrong</h1>
        <p className="text-sm text-music-muted">
          We couldn&apos;t load this playlist. {error.message || 'Please try again.'}
        </p>
      </div>
      <button
        type="button"
        onClick={reset}
        className="rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-music-primary transition hover:bg-white/25"
      >
        Retry
      </button>
    </section>
  );
}
