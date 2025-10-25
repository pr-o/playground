'use client';

import { useMemo } from 'react';
import { MusicDetailHero } from '@/components/apps/youtube-music/MusicDetailHero';
import { MusicTrackTable } from '@/components/apps/youtube-music/MusicTrackTable';
import { ContentSection } from '@/components/apps/youtube-music/ContentSection';
import { HorizontalScroller } from '@/components/apps/youtube-music/HorizontalScroller';
import { MusicReleaseCard } from '@/components/apps/youtube-music/MusicCards';
import type { AlbumCardData, AlbumHeroData, TrackRowData } from '@/types/music';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';
import { trackRowsToPlayback } from '@/lib/music/playback';

type MusicAlbumDetailProps = {
  hero: AlbumHeroData;
  tracks: TrackRowData[];
  related: AlbumCardData[];
};

export function MusicAlbumDetail({ hero, tracks, related }: MusicAlbumDetailProps) {
  const loadQueue = useMusicPlaybackStore((state) => state.loadQueue);
  const pushToast = useMusicUIStore((state) => state.pushToast);

  const playbackTracks = useMemo(() => trackRowsToPlayback(tracks), [tracks]);

  const handlePlayAll = () => {
    if (!playbackTracks.length) {
      pushToast({
        title: 'No tracks available',
        description: 'This release does not include a previewable track list.',
        variant: 'warning',
      });
      return;
    }
    loadQueue(playbackTracks, 0);
    pushToast({
      title: 'Playing release',
      description: hero.title,
      variant: 'info',
    });
  };

  const handleShuffle = () => {
    if (!playbackTracks.length) return;
    const shuffled = [...playbackTracks].sort(() => Math.random() - 0.5);
    loadQueue(shuffled, 0);
    pushToast({
      title: 'Shuffled queue',
      description: hero.title,
      variant: 'info',
    });
  };

  const handleAddToLibrary = () => {
    pushToast({
      title: 'Saved to library',
      description: `${hero.title} added to your Discogs favorites`,
      variant: 'success',
    });
  };

  const handleDownload = () => {
    pushToast({
      title: 'Download started',
      description: 'Download simulation started for this release.',
      variant: 'info',
    });
  };

  return (
    <section className="flex flex-1 flex-col gap-10 p-6">
      <MusicDetailHero
        hero={hero}
        variant="album"
        onPlayAll={handlePlayAll}
        onShuffle={handleShuffle}
        onAddToLibrary={handleAddToLibrary}
        onDownload={handleDownload}
      />
      <MusicTrackTable tracks={tracks} />

      {related.length > 0 && (
        <ContentSection
          title="More like this"
          description="Dig further into fresh Discogs releases."
        >
          <HorizontalScroller>
            {related.map((item) => (
              <MusicReleaseCard key={item.id} release={item} />
            ))}
          </HorizontalScroller>
        </ContentSection>
      )}
    </section>
  );
}
