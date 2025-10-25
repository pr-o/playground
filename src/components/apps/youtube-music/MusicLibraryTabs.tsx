'use client';

import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Library, List as ListIcon, PlusCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MusicArtistCard,
  MusicPlaylistCard,
  MusicReleaseCard,
} from '@/components/apps/youtube-music/MusicCards';
import { MusicTrackRow } from '@/components/apps/youtube-music/MusicTrackRow';
import type {
  AlbumCardData,
  ArtistSummaryData,
  PlaylistCardData,
  TrackRowData,
} from '@/types/music';
import {
  MusicPlaylistCardSkeleton,
  MusicReleaseCardSkeleton,
  TrackRowSkeleton,
} from '@/components/apps/youtube-music/MusicSkeletons';
import { cn } from '@/lib/utils';

type LibraryTab = 'playlists' | 'songs' | 'albums' | 'artists';

type MusicLibraryTabsProps = {
  activeTab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  playlists: PlaylistCardData[];
  albums: AlbumCardData[];
  tracks: TrackRowData[];
  artists: ArtistSummaryData[];
  isLoading: boolean;
  error?: string;
  onCreatePlaylist?: () => void;
};

type SortOption = 'recent' | 'az';
type FormatFilter = 'all' | 'compilation' | 'mix';
type YearFilter = 'all' | '2020s' | '2010s' | 'earlier';

export function MusicLibraryTabs({
  activeTab,
  onTabChange,
  playlists,
  albums,
  tracks,
  artists,
  isLoading,
  error,
  onCreatePlaylist,
}: MusicLibraryTabsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOption, setSortOption] = useState<SortOption>('recent');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [yearFilter, setYearFilter] = useState<YearFilter>('all');

  useEffect(() => {
    if (activeTab === 'songs') {
      setViewMode('list');
    }
  }, [activeTab]);

  const filteredPlaylists = useMemo(() => {
    let items = playlists;
    if (formatFilter === 'compilation') {
      items = items.filter((playlist) =>
        playlist.description?.toLowerCase().includes('compilation'),
      );
    } else if (formatFilter === 'mix') {
      items = items.filter((playlist) =>
        playlist.description?.toLowerCase().includes('mix'),
      );
    }

    if (sortOption === 'az') {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    }
    return items;
  }, [playlists, formatFilter, sortOption]);

  const filteredAlbums = useMemo(() => {
    let items = albums;
    if (yearFilter !== 'all') {
      items = items.filter((album) => {
        const year = album.releaseDate ? Number.parseInt(album.releaseDate, 10) : 0;
        if (!year) return false;
        if (yearFilter === '2020s') return year >= 2020;
        if (yearFilter === '2010s') return year >= 2010 && year < 2020;
        return year < 2010;
      });
    }

    if (sortOption === 'az') {
      items = [...items].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOption === 'recent') {
      items = [...items].sort((a, b) => {
        const yearA = a.releaseDate ? Number.parseInt(a.releaseDate, 10) : 0;
        const yearB = b.releaseDate ? Number.parseInt(b.releaseDate, 10) : 0;
        return yearB - yearA;
      });
    }

    return items;
  }, [albums, sortOption, yearFilter]);

  const filteredTracks = useMemo(() => {
    if (sortOption === 'az') {
      return [...tracks].sort((a, b) => a.title.localeCompare(b.title));
    }
    return tracks;
  }, [tracks, sortOption]);

  const filteredArtists = useMemo(() => {
    if (sortOption === 'az') {
      return [...artists].sort((a, b) => a.name.localeCompare(b.name));
    }
    return artists;
  }, [artists, sortOption]);

  const hasContent = useMemo(
    () => ({
      playlists: filteredPlaylists.length > 0,
      albums: filteredAlbums.length > 0,
      songs: filteredTracks.length > 0,
      artists: filteredArtists.length > 0,
    }),
    [
      filteredAlbums.length,
      filteredArtists.length,
      filteredPlaylists.length,
      filteredTracks.length,
    ],
  );

  const renderEmptyState = (title: string, description: string) => (
    <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-3xl border border-white/5 bg-white/5 text-center text-music-muted">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-music-primary">
        <Library className="h-6 w-6" />
      </div>
      <p className="text-lg font-semibold text-music-primary">{title}</p>
      <p className="max-w-xs text-sm text-music-muted">{description}</p>
    </div>
  );

  const renderCreatePlaylistCard = (variant: 'grid' | 'list') => (
    <button
      type="button"
      onClick={onCreatePlaylist}
      className={cn(
        'group flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-white/10 bg-white/5 text-music-muted transition hover:border-white/40 hover:bg-white/10',
        variant === 'grid'
          ? 'h-full min-h-[12rem] p-6 text-center'
          : 'flex-row items-center justify-start rounded-2xl px-4 py-3',
      )}
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-music-primary">
        <PlusCircle className="h-6 w-6" />
      </span>
      <div className="space-y-1">
        <p className="text-sm font-semibold text-music-primary">Create new playlist</p>
        <p className="text-xs text-music-muted">
          Launch the editor to curate your next Discogs mix.
        </p>
      </div>
    </button>
  );

  const renderPlaylistListRow = (playlist: PlaylistCardData) => (
    <div
      key={playlist.id}
      className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-music-primary">
          {playlist.name}
        </p>
        {playlist.description && (
          <p className="truncate text-xs text-music-muted">{playlist.description}</p>
        )}
      </div>
      <span className="text-xs uppercase tracking-[0.3em] text-music-ghost">
        {playlist.ownerName ?? 'Discogs'}
      </span>
    </div>
  );

  const renderAlbumListRow = (album: AlbumCardData) => (
    <div
      key={album.id}
      className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-music-primary">{album.name}</p>
        <p className="truncate text-xs text-music-muted">
          {[album.primaryArtist, album.releaseDate].filter(Boolean).join(' • ')}
        </p>
      </div>
      {album.totalTracks && (
        <span className="text-xs text-music-muted">{album.totalTracks} tracks</span>
      )}
    </div>
  );

  const getActiveContent = () => {
    if (isLoading) {
      if (activeTab === 'songs') {
        return (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <TrackRowSkeleton key={index} index={index + 1} />
            ))}
          </div>
        );
      }
      if (activeTab === 'artists') {
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <MusicPlaylistCardSkeleton key={index} />
            ))}
          </div>
        );
      }
      const SkeletonComponent =
        activeTab === 'playlists' ? MusicPlaylistCardSkeleton : MusicReleaseCardSkeleton;
      return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonComponent key={index} />
          ))}
        </div>
      );
    }

    if (activeTab === 'playlists') {
      if (!hasContent.playlists) {
        return renderEmptyState(
          'No compilations saved',
          'Start collecting Discogs compilations to see them appear here.',
        );
      }

      if (viewMode === 'grid') {
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {renderCreatePlaylistCard('grid')}
            {filteredPlaylists.map((playlist) => (
              <MusicPlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {renderCreatePlaylistCard('list')}
          {filteredPlaylists.map((playlist) => renderPlaylistListRow(playlist))}
        </div>
      );
    }

    if (activeTab === 'albums') {
      if (!hasContent.albums) {
        return renderEmptyState(
          'No albums yet',
          'Save Discogs albums to populate your library.',
        );
      }

      if (viewMode === 'grid') {
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAlbums.map((album) => (
              <MusicReleaseCard key={album.id} release={album} />
            ))}
          </div>
        );
      }

      return (
        <div className="space-y-3">
          {filteredAlbums.map((album) => renderAlbumListRow(album))}
        </div>
      );
    }

    if (activeTab === 'songs') {
      if (!hasContent.songs) {
        return renderEmptyState(
          'No songs saved',
          'Add tracks from Discogs releases to build your library.',
        );
      }

      return (
        <div className="space-y-3">
          {filteredTracks.map((track, index) => (
            <MusicTrackRow key={track.id} track={track} index={index + 1} />
          ))}
        </div>
      );
    }

    if (!hasContent.artists) {
      return renderEmptyState(
        'No artists followed',
        'Follow Discogs artists and DJs to keep tabs on new drops.',
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredArtists.map((artist) => (
          <MusicArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1 text-sm">
          {(
            [
              ['playlists', 'Playlists'],
              ['songs', 'Songs'],
              ['albums', 'Albums'],
              ['artists', 'Artists'],
            ] as Array<[LibraryTab, string]>
          ).map(([tab, label]) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`rounded-full px-4 py-2 transition ${
                activeTab === tab
                  ? 'bg-white/20 text-music-primary'
                  : 'text-music-muted hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {(activeTab === 'playlists' || activeTab === 'albums') && (
            <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition ${
                  viewMode === 'grid'
                    ? 'bg-white/20 text-music-primary'
                    : 'text-music-muted hover:bg-white/10'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Grid
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition ${
                  viewMode === 'list'
                    ? 'bg-white/20 text-music-primary'
                    : 'text-music-muted hover:bg-white/10'
                }`}
              >
                <ListIcon className="h-4 w-4" />
                List
              </button>
            </div>
          )}

          <Select
            value={sortOption}
            onValueChange={(next) => setSortOption(next as SortOption)}
          >
            <SelectTrigger className="h-9 min-w-[8rem] rounded-full border-white/10 bg-white/10 text-sm text-music-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Recent activity</SelectItem>
              <SelectItem value="az">A → Z</SelectItem>
            </SelectContent>
          </Select>

          {activeTab === 'playlists' && (
            <Select
              value={formatFilter}
              onValueChange={(next) => setFormatFilter(next as FormatFilter)}
            >
              <SelectTrigger className="h-9 min-w-[8rem] rounded-full border-white/10 bg-white/10 text-sm text-music-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All formats</SelectItem>
                <SelectItem value="compilation">Compilations</SelectItem>
                <SelectItem value="mix">Mixes</SelectItem>
              </SelectContent>
            </Select>
          )}

          {activeTab === 'albums' && (
            <Select
              value={yearFilter}
              onValueChange={(next) => setYearFilter(next as YearFilter)}
            >
              <SelectTrigger className="h-9 min-w-[8rem] rounded-full border-white/10 bg-white/10 text-sm text-music-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                <SelectItem value="2020s">2020s</SelectItem>
                <SelectItem value="2010s">2010s</SelectItem>
                <SelectItem value="earlier">Earlier</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-3xl border border-red-900/60 bg-red-950/30 p-5 text-sm text-red-100">
          <p className="font-semibold">Discogs error</p>
          <p className="mt-2 text-red-100/80">{error}</p>
        </div>
      )}

      {getActiveContent()}
    </div>
  );
}
