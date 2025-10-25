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

type MusicPlaylistDetailProps = {
  hero: AlbumHeroData;
  tracks: TrackRowData[];
  related: PlaylistCardData[];
};

export function MusicPlaylistDetail({ hero, tracks, related }: MusicPlaylistDetailProps) {
  const loadQueue = useMusicPlaybackStore((state) => state.loadQueue);
  const pushToast = useMusicUIStore((state) => state.pushToast);

  const playbackTracks = useMemo(() => trackRowsToPlayback(tracks), [tracks]);

  const handlePlayAll = () => {
    if (!playbackTracks.length) {
      pushToast({
        title: 'No tracks available',
        description: 'This playlist does not include a previewable track list.',
        variant: 'warning',
      });
      return;
    }
    loadQueue(playbackTracks, 0);
    pushToast({
      title: 'Playing playlist',
      description: hero.title,
      variant: 'info',
    });
  };

  const handleShuffle = () => {
    if (!playbackTracks.length) return;
    const shuffled = [...playbackTracks].sort(() => Math.random() - 0.5);
    loadQueue(shuffled, 0);
    pushToast({
      title: 'Shuffle enabled',
      description: hero.title,
      variant: 'info',
    });
  };

  const handleAddToLibrary = () => {
    pushToast({
      title: 'Playlist saved',
      description: `${hero.title} added to your Discogs collection`,
      variant: 'success',
    });
  };

  const handleDownload = () => {
    pushToast({
      title: 'Download queued',
      description: 'Offline download simulation triggered.',
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
