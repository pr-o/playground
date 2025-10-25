'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  MusicArtistCard,
  MusicPlaylistCard,
  MusicReleaseCard,
} from '@/components/apps/youtube-music/MusicCards';
import { MusicTrackRow } from '@/components/apps/youtube-music/MusicTrackRow';
import { ContentSection } from '@/components/apps/youtube-music/ContentSection';
import { HorizontalScroller } from '@/components/apps/youtube-music/HorizontalScroller';
import type { MusicSearchResult, MusicSearchGroup, MusicTopResult } from '@/types/music';
import { cn } from '@/lib/utils';
import { musicPath } from '@/lib/music/constants';

type MusicSearchResultsProps = {
  result: MusicSearchResult;
  activeFilter?: MusicSearchGroup['kind'];
};

const FILTER_LABELS: Record<MusicSearchGroup['kind'], string> = {
  songs: 'Songs',
  albums: 'Albums',
  playlists: 'Playlists',
  artists: 'Artists',
};

const TOP_RESULT_KIND_TO_FILTER: Record<
  MusicTopResult['kind'],
  MusicSearchGroup['kind']
> = {
  album: 'albums',
  playlist: 'playlists',
  artist: 'artists',
  song: 'songs',
};

export function MusicSearchResults({ result, activeFilter }: MusicSearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get('q') ?? '';

  const availableFilters = useMemo(() => {
    const kinds = new Set<MusicSearchGroup['kind']>();
    result.groups.forEach((group) => kinds.add(group.kind));
    return Array.from(kinds);
  }, [result.groups]);

  const visibleGroups = useMemo(() => {
    if (!activeFilter) return result.groups;
    return result.groups.filter((group) => group.kind === activeFilter);
  }, [result.groups, activeFilter]);

  const handleFilterChange = (kind?: MusicSearchGroup['kind']) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!kind) {
      params.delete('filter');
    } else {
      params.set('filter', kind);
    }
    router.replace(`${musicPath('search')}?${params.toString()}`);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        {result.topResult &&
          (!activeFilter ||
            TOP_RESULT_KIND_TO_FILTER[result.topResult.kind] === activeFilter) && (
            <ContentSection
              title="Top result"
              description="Fastest match based on Discogs relevance."
              headingClassName="mb-4"
            >
              <div className="max-w-xl">{renderTopResult(result.topResult)}</div>
            </ContentSection>
          )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => handleFilterChange(undefined)}
            className={cn(
              'rounded-full border border-white/15 px-4 py-2 text-sm transition',
              !activeFilter
                ? 'bg-white/20 text-music-primary'
                : 'text-music-muted hover:bg-white/10 hover:text-music-primary',
            )}
          >
            All
          </button>
          {availableFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() =>
                handleFilterChange(filter === activeFilter ? undefined : filter)
              }
              className={cn(
                'rounded-full border border-white/15 px-4 py-2 text-sm transition',
                activeFilter === filter
                  ? 'bg-white/20 text-music-primary'
                  : 'text-music-muted hover:bg-white/10 hover:text-music-primary',
              )}
            >
              {FILTER_LABELS[filter]}
            </button>
          ))}
        </div>
      </div>

      {visibleGroups.map((group) => (
        <ContentSection
          key={group.kind}
          title={group.title}
          action={
            group.total > group.items.length ? (
              <Link
                href={`${musicPath('search')}?q=${encodeURIComponent(query)}&filter=${group.kind}`}
                className="text-sm font-semibold text-music-primary transition hover:text-white"
              >
                See all
              </Link>
            ) : undefined
          }
        >
          {renderGroup(group)}
        </ContentSection>
      ))}
    </div>
  );
}

function renderTopResult(result: MusicSearchResult['topResult']) {
  if (!result) return null;

  switch (result.kind) {
    case 'album':
      return <MusicReleaseCard release={result.item} className="w-full max-w-xs" />;
    case 'playlist':
      return <MusicPlaylistCard playlist={result.item} className="w-full max-w-md" />;
    case 'artist':
      return <MusicArtistCard artist={result.item} className="w-full max-w-xs" />;
    case 'song':
      return <MusicTrackRow track={result.item} index={1} />;
    default:
      return null;
  }
}

function renderGroup(group: MusicSearchGroup) {
  switch (group.kind) {
    case 'songs':
      return (
        <div className="space-y-3">
          {group.items.map((track, index) => (
            <MusicTrackRow key={track.id} track={track} index={index + 1} />
          ))}
        </div>
      );
    case 'albums':
      return (
        <HorizontalScroller showControls={group.items.length > 3}>
          {group.items.map((album) => (
            <MusicReleaseCard key={album.id} release={album} />
          ))}
        </HorizontalScroller>
      );
    case 'playlists':
      return (
        <HorizontalScroller showControls={group.items.length > 3}>
          {group.items.map((playlist) => (
            <MusicPlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </HorizontalScroller>
      );
    case 'artists':
      return (
        <HorizontalScroller showControls={group.items.length > 4}>
          {group.items.map((artist) => (
            <MusicArtistCard key={artist.id} artist={artist} />
          ))}
        </HorizontalScroller>
      );
    default:
      return null;
  }
}
