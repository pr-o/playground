import Link from 'next/link';
import { searchMusicCatalog } from '@/lib/music';
import { ContentSection } from '@/components/clones/youtube-music/ContentSection';
import { MusicSearchResults } from '@/components/clones/youtube-music/MusicSearchResults';

type YoutubeMusicSearchPageProps = {
  searchParams?: {
    q?: string;
    filter?: string;
  };
};

export default async function YoutubeMusicSearchPage({
  searchParams,
}: YoutubeMusicSearchPageProps) {
  const query = typeof searchParams?.q === 'string' ? searchParams.q : '';
  const activeFilter =
    typeof searchParams?.filter === 'string'
      ? (searchParams?.filter as 'songs' | 'albums' | 'playlists' | 'artists')
      : undefined;

  const result = await searchMusicCatalog(query);

  return (
    <section className="flex flex-1 flex-col gap-8 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
          YouTube Music
        </p>
        <h1 className="text-3xl font-semibold text-glow-music">Search</h1>
        <p className="max-w-xl text-sm text-music-secondary">
          Find songs, albums, playlists, and artists across the Discogs-powered catalogue.
        </p>
        {!query && (
          <p className="text-xs text-music-muted">
            Start typing in the search bar above to see instant suggestions.
          </p>
        )}
      </header>

      {!query ? (
        <ContentSection
          title="Popular searches"
          description="Try these prompts to explore the demo library."
        >
          <div className="flex flex-wrap gap-3">
            {[
              'Ambient electronic',
              'Blue Note classics',
              'Tokyo city pop',
              'Rare disco mixes',
            ].map((pill) => (
              <Link
                key={pill}
                href={`/clones/youtube-music/search?q=${encodeURIComponent(pill)}`}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-music-primary transition hover:border-white/40 hover:bg-white/10"
              >
                {pill}
              </Link>
            ))}
          </div>
        </ContentSection>
      ) : result.ok ? (
        result.data.groups.length ? (
          <MusicSearchResults result={result.data} activeFilter={activeFilter} />
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-lg font-semibold text-music-primary">No matches yet</p>
            <p className="max-w-sm text-sm text-music-muted">
              Try refining your Discogs search terms or adjust the filter chips to broaden
              results.
            </p>
          </div>
        )
      ) : (
        <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-6 text-sm text-red-100">
          <p className="font-semibold">Discogs search unavailable</p>
          <p className="mt-2 text-red-100/80">{result.error}</p>
        </div>
      )}
    </section>
  );
}
