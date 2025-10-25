'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ContentSection } from '@/components/apps/youtube-music/ContentSection';
import { HorizontalScroller } from '@/components/apps/youtube-music/HorizontalScroller';
import { MusicTrackTable } from '@/components/apps/youtube-music/MusicTrackTable';
import {
  MusicArtistCard,
  MusicReleaseCard,
} from '@/components/apps/youtube-music/MusicCards';
import { MusicTrackRow } from '@/components/apps/youtube-music/MusicTrackRow';
import type {
  AlbumCardData,
  ArtistHeroData,
  ArtistSummaryData,
  TrackRowData,
} from '@/types/music';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';
import { trackRowsToPlayback } from '@/lib/music/playback';

type MusicArtistDetailProps = {
  hero: ArtistHeroData;
  topTracks: TrackRowData[];
  popularReleases: AlbumCardData[];
  relatedArtists: ArtistSummaryData[];
};

export function MusicArtistDetail({
  hero,
  topTracks,
  popularReleases,
  relatedArtists,
}: MusicArtistDetailProps) {
  const loadQueue = useMusicPlaybackStore((state) => state.loadQueue);
  const pushToast = useMusicUIStore((state) => state.pushToast);

  const playbackTracks = useMemo(() => trackRowsToPlayback(topTracks), [topTracks]);

  const handlePlayAll = () => {
    if (!playbackTracks.length) {
      pushToast({
        title: 'No tracks available',
        description: 'Track data is unavailable for this artist right now.',
        variant: 'warning',
      });
      return;
    }
    loadQueue(playbackTracks, 0);
    pushToast({
      title: 'Playing artist mix',
      description: hero.name,
      variant: 'info',
    });
  };

  const heroImage = hero.imageUrl;
  const biography = hero.profile?.split(/\n{2,}/).filter((paragraph) => paragraph.trim());
  const links = hero.urls ?? [];

  return (
    <section className="flex flex-1 flex-col gap-10 p-6">
      <article className="flex flex-col gap-8 rounded-4xl border border-white/10 bg-white/5 p-6 md:flex-row md:items-end md:p-10">
        <div className="mx-auto w-full max-w-xs md:mx-0 md:max-w-[14rem]">
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-white/20 bg-music-card-alt shadow-2xl">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={hero.name}
                fill
                sizes="224px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-music-ghost">
                Artist
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-6 text-music-primary">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-music-ghost">Artist</p>
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{hero.name}</h1>
            {hero.realName && (
              <p className="text-sm text-music-muted">
                Also known as <span className="text-music-primary">{hero.realName}</span>
              </p>
            )}
            {hero.genres?.length ? (
              <p className="text-sm text-music-muted">
                Genres:{' '}
                <span className="text-music-primary">{hero.genres.join(' • ')}</span>
              </p>
            ) : null}
            {hero.memberNames?.length ? (
              <p className="text-xs uppercase tracking-[0.25em] text-music-ghost">
                Members: {hero.memberNames.join(', ')}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handlePlayAll}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-black shadow hover:bg-white/90"
            >
              Play top tracks
            </Button>
            {links.length ? (
              <div className="inline-flex flex-wrap items-center gap-2 text-xs text-music-muted">
                {links.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-white/20 px-3 py-1 uppercase tracking-[0.25em] text-music-ghost transition hover:border-white/40 hover:text-music-primary"
                  >
                    {extractHost(url)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </article>

      {biography?.length ? (
        <ContentSection title="About" className="max-w-3xl space-y-4">
          <div className="space-y-4 text-sm leading-relaxed text-music-secondary">
            {biography.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </ContentSection>
      ) : null}

      {topTracks.length ? (
        <ContentSection title="Top tracks">
          <div className="space-y-3 lg:hidden">
            {topTracks.slice(0, 5).map((track, index) => (
              <MusicTrackRow key={track.id} track={track} index={index + 1} />
            ))}
          </div>
          <div className="hidden lg:block">
            <MusicTrackTable tracks={topTracks} />
          </div>
        </ContentSection>
      ) : (
        <ContentSection
          title="Top tracks"
          description="We couldn't load additional track data for this artist."
        >
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-sm text-music-muted">
            Check back later for Discogs-powered tracklists.
          </div>
        </ContentSection>
      )}

      {popularReleases.length ? (
        <ContentSection title="Popular releases">
          <HorizontalScroller>
            {popularReleases.map((release) => (
              <MusicReleaseCard key={release.id} release={release} />
            ))}
          </HorizontalScroller>
        </ContentSection>
      ) : null}

      {relatedArtists.length ? (
        <ContentSection
          title="Related artists"
          description="More Discogs acts you might enjoy."
        >
          <HorizontalScroller showControls={relatedArtists.length > 4}>
            {relatedArtists.map((artist) => (
              <MusicArtistCard key={artist.id} artist={artist} />
            ))}
          </HorizontalScroller>
        </ContentSection>
      ) : null}
    </section>
  );
}

function extractHost(url: string) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
