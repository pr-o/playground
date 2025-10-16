import { getMusicPlaylistDetail } from '@/lib/music';
import { ContentSection } from '@/components/clones/youtube-music/ContentSection';
import { HorizontalScroller } from '@/components/clones/youtube-music/HorizontalScroller';
import { MusicDetailHero } from '@/components/clones/youtube-music/MusicDetailHero';
import { MusicPlaylistCard } from '@/components/clones/youtube-music/MusicCards';
import { MusicTrackTable } from '@/components/clones/youtube-music/MusicTrackTable';

type YoutubeMusicPlaylistPageProps = {
  params: {
    id: string;
  };
};

export default async function YoutubeMusicPlaylistPage({
  params,
}: YoutubeMusicPlaylistPageProps) {
  const result = await getMusicPlaylistDetail(params.id);

  if (!result.ok) {
    return (
      <section className="flex flex-1 flex-col gap-6 p-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
            YouTube Music
          </p>
          <h1 className="text-3xl font-semibold text-glow-music">Playlist unavailable</h1>
          <p className="max-w-xl text-sm text-music-secondary">
            We couldn&apos;t load this Discogs playlist. Please try again shortly.
          </p>
        </header>
        <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-6 text-sm text-red-100">
          <p className="font-semibold">Discogs error</p>
          <p className="mt-2 text-red-100/80">{result.error}</p>
        </div>
      </section>
    );
  }

  const { hero, tracks, related } = result.data;

  return (
    <section className="flex flex-1 flex-col gap-10 p-6">
      <MusicDetailHero hero={hero} variant="playlist" />
      <MusicTrackTable tracks={tracks} />

      {related.length > 0 && (
        <ContentSection
          title="Featured compilations"
          description="More Discogs mixes curated for deep listening."
        >
          <HorizontalScroller>
            {related.map((item) => (
              <MusicPlaylistCard key={item.id} playlist={item} />
            ))}
          </HorizontalScroller>
        </ContentSection>
      )}
    </section>
  );
}
