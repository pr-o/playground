'use client';

import { useMemo, useState } from 'react';
import { MusicLibraryTabs } from '@/components/apps/youtube-music/MusicLibraryTabs';
import { useMusicLibraryData } from '@/hooks/music/use-music-library-data';

export default function YoutubeMusicLibraryPage() {
  const [activeTab, setActiveTab] = useState<
    'playlists' | 'songs' | 'albums' | 'artists'
  >('playlists');
  const { data, isLoading, error } = useMusicLibraryData();

  const playlists = useMemo(
    () => data?.collections.find((collection) => collection.kind === 'playlists'),
    [data],
  );
  const albums = useMemo(
    () => data?.collections.find((collection) => collection.kind === 'albums'),
    [data],
  );
  const tracks = useMemo(
    () => data?.collections.find((collection) => collection.kind === 'tracks'),
    [data],
  );
  const artists = useMemo(
    () => data?.collections.find((collection) => collection.kind === 'artists'),
    [data],
  );

  return (
    <section className="flex flex-1 flex-col gap-6 p-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-music-muted">
          YouTube Music
        </p>
        <h1 className="text-3xl font-semibold text-glow-music">Library</h1>
        <p className="max-w-xl text-sm text-music-secondary">
          Browse your Discogs-inspired collections. Switch between compilations and
          albums.
        </p>
      </header>

      <MusicLibraryTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        playlists={playlists?.items ?? []}
        albums={albums?.items ?? []}
        tracks={tracks?.items ?? []}
        artists={artists?.items ?? []}
        isLoading={isLoading}
        error={error}
      />
    </section>
  );
}
