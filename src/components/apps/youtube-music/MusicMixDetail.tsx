'use client';

import { useMemo } from 'react';
import { MusicDetailHero } from '@/components/apps/youtube-music/MusicDetailHero';
import { MusicTrackTable } from '@/components/apps/youtube-music/MusicTrackTable';
import { ContentSection } from '@/components/apps/youtube-music/ContentSection';
import { HorizontalScroller } from '@/components/apps/youtube-music/HorizontalScroller';
import { MusicPlaylistCard } from '@/components/apps/youtube-music/MusicCards';
import type { AlbumHeroData, PlaylistCardData, TrackRowData } from '@/types/music';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';
import { trackRowsToPlayback } from '@/lib/music/playback';

type MusicMixDetailProps = {
  hero: AlbumHeroData;
  tracks: TrackRowData[];
  related: PlaylistCardData[];
};

export function MusicMixDetail({ hero, tracks, related }: MusicMixDetailProps) {
  const loadQueue = useMusicPlaybackStore((state) => state.loadQueue);
  const pushToast = useMusicUIStore((state) => state.pushToast);

  const playbackTracks = useMemo(() => trackRowsToPlayback(tracks), [tracks]);

  const handlePlayAll = () => {
    if (!playbackTracks.length) {
      pushToast({
        title: 'No tracks available',
        description: 'This mix does not include a previewable track list yet.',
        variant: 'warning',
      });
      return;
    }
    loadQueue(playbackTracks, 0);
    pushToast({
      title: 'Mix started',
      description: hero.title,
      variant: 'info',
    });
  };

  const handleShuffle = () => {
    if (!playbackTracks.length) return;
    const shuffled = [...playbackTracks].sort(() => Math.random() - 0.5);
    loadQueue(shuffled, 0);
    pushToast({
      title: 'Mix shuffled',
      description: hero.title,
      variant: 'info',
    });
  };

  const handleAddToLibrary = () => {
    pushToast({
      title: 'Mix saved',
      description: `${hero.title} added to your mock library.`,
      variant: 'success',
    });
  };

  const handleDownload = () => {
    pushToast({
      title: 'Download queued',
      description: 'Offline download simulation triggered for this mix.',
      variant: 'info',
    });
  };

  return (
    <section className="flex flex-1 flex-col gap-10 p-6">
      <MusicDetailHero
        hero={hero}
        variant="playlist"
        onPlayAll={handlePlayAll}
        onShuffle={handleShuffle}
        onAddToLibrary={handleAddToLibrary}
        onDownload={handleDownload}
      />

      {tracks.length ? (
        <MusicTrackTable tracks={tracks} />
      ) : (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-sm text-music-muted">
          We&apos;ll populate this mix with Discogs-powered tracks once available.
        </div>
      )}

      {related.length ? (
        <ContentSection
          title="Recommended blends"
          description="More compilations inspired by this mood."
        >
          <HorizontalScroller>
            {related.map((item) => (
              <MusicPlaylistCard key={item.id} playlist={item} />
            ))}
          </HorizontalScroller>
        </ContentSection>
      ) : null}
    </section>
  );
}
