import { getMusicHomeData } from '@/lib/music';
import { ContentSection } from '@/components/apps/youtube-music/ContentSection';
import { HorizontalScroller } from '@/components/apps/youtube-music/HorizontalScroller';
import {
  MusicArtistCard,
  MusicMixCard,
  MusicPlaylistCard,
  MusicQuickPickCard,
  MusicReleaseCard,
} from '@/components/apps/youtube-music/MusicCards';

export default async function YoutubeMusicHomePage() {
  const result = await getMusicHomeData();

  if (!result.ok) {
    return (
      <section className="flex flex-1 flex-col gap-6 p-6">
        <header className="space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
            YouTube Music
          </p>
          <h1 className="text-3xl font-semibold text-glow-music">Home</h1>
          <p className="max-w-xl text-sm text-music-secondary">
            We’re having trouble loading Discogs data right now. Please refresh in a
            moment.
          </p>
        </header>
        <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-6 text-sm text-red-100">
          <p className="font-semibold">Discogs error</p>
          <p className="mt-2 text-red-100/80">{result.error}</p>
        </div>
      </section>
    );
  }

  const { message, sections } = result.data;

  return (
    <section className="flex flex-1 flex-col gap-12 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
          YouTube Music
        </p>
        <h1 className="text-3xl font-semibold text-glow-music">Home</h1>
        <p className="max-w-xl text-sm text-music-secondary">
          {message ??
            'Discover new releases, curated compilations, and trending diggs from Discogs.'}
        </p>
      </header>

      {sections.map((section) => {
        switch (section.kind) {
          case 'new-releases':
            return (
              <ContentSection key={section.title} title={section.title}>
                <HorizontalScroller>
                  {section.items.map((item) => (
                    <MusicReleaseCard key={item.id} release={item} />
                  ))}
                </HorizontalScroller>
              </ContentSection>
            );
          case 'featured-playlists':
            return (
              <ContentSection key={section.title} title={section.title}>
                <HorizontalScroller>
                  {section.items.map((item) => (
                    <MusicPlaylistCard key={item.id} playlist={item} />
                  ))}
                </HorizontalScroller>
              </ContentSection>
            );
          case 'featured-artists':
            return (
              <ContentSection key={section.title} title={section.title}>
                <HorizontalScroller>
                  {section.items.map((artist) => (
                    <MusicArtistCard key={artist.id} artist={artist} />
                  ))}
                </HorizontalScroller>
              </ContentSection>
            );
          case 'mixes':
            return (
              <ContentSection key={section.title} title={section.title}>
                <HorizontalScroller>
                  {section.items.map((item) => (
                    <MusicMixCard key={item.id} playlist={item} />
                  ))}
                </HorizontalScroller>
              </ContentSection>
            );
          case 'quick-picks':
            return (
              <ContentSection key={section.title} title={section.title}>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((item) => (
                    <MusicQuickPickCard key={item.id} release={item} />
                  ))}
                </div>
              </ContentSection>
            );
          default:
            return null;
        }
      })}
    </section>
  );
}
