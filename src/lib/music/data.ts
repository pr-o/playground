import { cache } from 'react';
import { fetchDiscogs, isDiscogsApiError } from '@/lib/discogs/client';
import { hasDiscogsAuth } from '@/lib/discogs/config';
import { discogsHomeMock } from '@/lib/mock-data/discogs';
import {
  mapArtistSummary,
  mapReleaseToCard,
  mapSearchResultToAlbumCard,
  mapSearchResultToPlaylistCard,
  mapTrackToRow,
} from '@/lib/music/mappers';
import type {
  MusicExploreData,
  MusicHomeData,
  MusicLibraryData,
  MusicResult,
} from '@/types/music';
import type {
  DiscogsMasterRelease,
  DiscogsRelease,
  DiscogsSearchResponse,
  DiscogsSearchResult,
} from '@/types/discogs';

const HOME_GENRES = ['Electronic', 'Pop', 'Rock'] as const;
const EXPLORE_GENRES = ['Electronic', 'Jazz', 'Hip Hop'] as const;

type FetchReleaseOptions = {
  includeTracklist?: boolean;
};

async function fetchReleaseById(id: number | string, options: FetchReleaseOptions = {}) {
  try {
    const release = await fetchDiscogs<DiscogsRelease>(`/releases/${id}`);
    if (
      options.includeTracklist &&
      (!release.tracklist || release.tracklist.length === 0) &&
      release['master_id']
    ) {
      const master = await fetchDiscogs<DiscogsMasterRelease>(
        `/masters/${release['master_id']}`,
      );
      release.tracklist = master.tracklist;
    }
    return release;
  } catch {
    return null;
  }
}

function withResult<T>(fn: () => Promise<T>, fallback?: T): Promise<MusicResult<T>> {
  return fn()
    .then((data) => ({ ok: true as const, data }))
    .catch((error: unknown) => {
      if (fallback) {
        return { ok: true as const, data: fallback };
      }
      if (isDiscogsApiError(error)) {
        return {
          ok: false as const,
          error: error.message,
          cause: { status: error.status, details: error.details },
        };
      }
      return {
        ok: false as const,
        error: 'Unexpected Discogs data error',
        cause: error,
      };
    });
}

async function fetchGenreReleases(
  genre: string,
  limit = 12,
): Promise<DiscogsSearchResult[]> {
  const response = await fetchDiscogs<DiscogsSearchResponse>('/database/search', {
    searchParams: {
      genre,
      type: 'release',
      sort: 'year',
      sort_order: 'desc',
      per_page: limit,
    },
  });
  return response.results.filter((result) => result.type === 'release');
}

async function fetchCompilationReleases(limit = 12) {
  const response = await fetchDiscogs<DiscogsSearchResponse>('/database/search', {
    searchParams: {
      format: 'Compilation',
      type: 'release',
      sort: 'hot',
      sort_order: 'desc',
      per_page: limit,
    },
  });
  return response.results.filter((result) => result.type === 'release');
}

async function fetchPopularArtists(limit = 6) {
  const response = await fetchDiscogs<DiscogsSearchResponse>('/database/search', {
    searchParams: {
      q: '',
      type: 'artist',
      per_page: limit,
      sort: 'followers',
      sort_order: 'desc',
    },
  });
  return response.results.filter((result) => result.type === 'artist');
}

export const getMusicHomeData = cache(async (): Promise<MusicResult<MusicHomeData>> => {
  if (!hasDiscogsAuth()) {
    const mock = buildHomeDataFromMock();
    return { ok: true, data: mock };
  }

  return withResult(async () => {
    const [genreResults, compilationResults, artistResults] = await Promise.all([
      Promise.all(HOME_GENRES.map((genre) => fetchGenreReleases(genre))),
      fetchCompilationReleases(12),
      fetchPopularArtists(8),
    ]);

    const sections: MusicHomeData['sections'] = [];

    if (genreResults[0]?.length) {
      sections.push({
        kind: 'new-releases',
        title: `Latest in ${HOME_GENRES[0]}`,
        items: genreResults[0].map(mapSearchResultToAlbumCard),
      });
    }

    if (genreResults[1]?.length) {
      sections.push({
        kind: 'new-releases',
        title: `Fresh ${HOME_GENRES[1]} finds`,
        items: genreResults[1].map(mapSearchResultToAlbumCard),
      });
    }

    if (compilationResults.length) {
      sections.push({
        kind: 'featured-playlists',
        title: 'Curated compilations',
        items: compilationResults.map(mapSearchResultToPlaylistCard),
      });
    }

    if (artistResults.length) {
      const featuredArtists = artistResults.map((result) =>
        mapArtistSummary({
          id: Number.parseInt(String(result.id), 10),
          name: result.title,
          resource_url: result.resource_url,
          thumbnail_url: result.thumb,
        }),
      );

      sections.push({
        kind: 'featured-artists',
        title: 'Trending artists',
        items: featuredArtists,
      });
    }

    return {
      message: 'Discogs editorial picks',
      sections,
    };
  }, buildHomeDataFromMock());
});

export const getMusicExploreData = cache(
  async (): Promise<MusicResult<MusicExploreData>> => {
    return withResult(async () => {
      const genrePromises = EXPLORE_GENRES.map((genre) => fetchGenreReleases(genre, 16));
      const [genreReleases, trendingReleases] = await Promise.all([
        Promise.all(genrePromises),
        fetchGenreReleases('Electronic', 8),
      ]);

      const topReleaseResults = trendingReleases
        .filter((result) => result.type === 'release')
        .slice(0, 5);
      const topReleaseDetails = await Promise.all(
        topReleaseResults.map((result) =>
          fetchReleaseById(result.id, { includeTracklist: true }),
        ),
      );

      const trackRows = topReleaseDetails
        .filter((release): release is DiscogsRelease =>
          Boolean(release && release.tracklist && release.tracklist.length),
        )
        .flatMap((release) => {
          const firstTrack = release.tracklist?.find((track) => track.type_ === 'track');
          return firstTrack ? [mapTrackToRow(firstTrack, release)] : [];
        });

      const sections: MusicExploreData['sections'] = [
        {
          kind: 'categories',
          title: 'Explore genres',
          items: EXPLORE_GENRES.map((genre) => ({
            id: genre.toLowerCase(),
            name: genre,
            iconUrl: undefined,
          })),
        },
      ];

      genreReleases.forEach((results, index) => {
        if (!results.length) return;
        sections.push({
          kind: 'new-releases',
          title: `Top ${EXPLORE_GENRES[index]} releases`,
          items: results.map(mapSearchResultToAlbumCard),
        });
      });

      if (trackRows.length) {
        sections.push({
          kind: 'top-tracks',
          title: 'Notable tracks',
          items: trackRows,
        });
      }

      return { sections };
    });
  },
);

export const getMusicLibraryData = cache(
  async (): Promise<MusicResult<MusicLibraryData>> => {
    return withResult(async () => {
      const [compilations, albums] = await Promise.all([
        fetchCompilationReleases(12),
        fetchDiscogs<DiscogsSearchResponse>('/database/search', {
          searchParams: {
            type: 'release',
            format: 'Album',
            per_page: 12,
            sort: 'year',
            sort_order: 'desc',
          },
        }),
      ]);

      return {
        collections: [
          {
            kind: 'playlists',
            items: compilations.map(mapSearchResultToPlaylistCard),
          },
          {
            kind: 'albums',
            items: albums.results
              .filter((result) => result.type === 'release')
              .map(mapSearchResultToAlbumCard),
          },
        ],
      };
    });
  },
);

function buildHomeDataFromMock(): MusicHomeData {
  return {
    message: 'Discogs editorial picks',
    sections: [
      {
        kind: 'new-releases',
        title: 'Latest releases',
        items: discogsHomeMock.newReleases.map(mapReleaseToCard),
      },
      {
        kind: 'featured-playlists',
        title: 'Curated compilations',
        items: discogsHomeMock.editorialPlaylists.map(mapSearchResultToPlaylistCard),
      },
      {
        kind: 'featured-artists' as const,
        title: 'Trending artists',
        items: discogsHomeMock.featuredArtists.map((artist) => mapArtistSummary(artist)),
      },
    ],
  };
}
