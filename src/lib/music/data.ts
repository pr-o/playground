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
  TrackRowData,
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

    const quickPickAlbums = genreResults
      .flat()
      .slice(0, 6)
      .map(mapSearchResultToAlbumCard);

    if (quickPickAlbums.length) {
      sections.push({
        kind: 'quick-picks',
        title: 'Quick picks for you',
        items: quickPickAlbums,
      });
    }

    const mixCards = compilationResults.slice(0, 6).map(mapSearchResultToPlaylistCard);
    if (mixCards.length) {
      sections.push({
        kind: 'mixes',
        title: 'Your Discogs mixes',
        items: mixCards,
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
      const [genreReleases, trendingReleases, singlesResponse, popularArtists] =
        await Promise.all([
          Promise.all(genrePromises),
          fetchGenreReleases('Electronic', 8),
          fetchDiscogs<DiscogsSearchResponse>('/database/search', {
            searchParams: {
              type: 'release',
              format: 'Single',
              per_page: 12,
              sort: 'year',
              sort_order: 'desc',
            },
          }),
          fetchPopularArtists(8),
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

      const sections: MusicExploreData['sections'] = [];

      genreReleases.forEach((results, index) => {
        if (!results.length) return;
        sections.push({
          kind: 'new-releases',
          title: `Top ${EXPLORE_GENRES[index]} releases`,
          items: results.map(mapSearchResultToAlbumCard),
        });
      });

      const singleResults = singlesResponse.results.filter(
        (result) => result.type === 'release',
      );
      if (singleResults.length) {
        sections.push({
          kind: 'new-releases',
          title: 'New singles & EPs',
          items: singleResults.map(mapSearchResultToAlbumCard),
        });
      }

      if (trackRows.length) {
        sections.push({
          kind: 'chart-tracks',
          title: 'Top tracks - Global',
          region: 'Global',
          items: trackRows,
        });
      }

      if (popularArtists.length) {
        const chartArtists = popularArtists.map((result) =>
          mapArtistSummary({
            id: Number.parseInt(String(result.id), 10),
            name: result.title,
            resource_url: result.resource_url,
            thumbnail_url: result.thumb,
          }),
        );

        sections.push({
          kind: 'chart-artists',
          title: 'Top artists - Global',
          region: 'Global',
          items: chartArtists,
        });
      }

      sections.push({
        kind: 'categories',
        title: 'Moods & genres',
        items: EXPLORE_GENRES.map((genre) => ({
          id: genre.toLowerCase(),
          name: genre,
          iconUrl: undefined,
        })),
      });

      return { sections };
    });
  },
);

export const getMusicLibraryData = cache(
  async (): Promise<MusicResult<MusicLibraryData>> => {
    const mock = buildLibraryDataFromMock();

    if (!hasDiscogsAuth()) {
      return { ok: true, data: mock };
    }

    return withResult(async () => {
      const [compilations, albums, trackReleases, popularArtists] = await Promise.all([
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
        fetchGenreReleases('Electronic', 6),
        fetchPopularArtists(8),
      ]);

      const trackReleaseDetails = await Promise.all(
        trackReleases
          .slice(0, 4)
          .map((result) => fetchReleaseById(result.id, { includeTracklist: true })),
      );

      const trackCollection = trackReleaseDetails
        .filter((release): release is DiscogsRelease =>
          Boolean(release && release.tracklist && release.tracklist.length),
        )
        .flatMap(
          (release) =>
            release.tracklist
              ?.filter((track) => track.type_ === 'track')
              .slice(0, 2)
              .map((track) => mapTrackToRow(track, release)) ?? [],
        )
        .slice(0, 10);

      const artistCollection = popularArtists.map((result) =>
        mapArtistSummary({
          id: Number.parseInt(String(result.id), 10),
          name: result.title,
          resource_url: result.resource_url,
          thumbnail_url: result.thumb,
        }),
      );

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
          {
            kind: 'tracks',
            items: trackCollection,
          },
          {
            kind: 'artists',
            items: artistCollection,
          },
        ],
      };
    }, mock);
  },
);

function buildLibraryDataFromMock(): MusicLibraryData {
  const mockTracks = discogsHomeMock.newReleases
    .flatMap((release) =>
      release.tracklist
        ?.filter((track) => track.type_ === 'track')
        .slice(0, 1)
        .map((track) => mapTrackToRow(track, release)),
    )
    .filter(Boolean) as TrackRowData[];

  return {
    collections: [
      {
        kind: 'playlists',
        items: discogsHomeMock.editorialPlaylists.map(mapSearchResultToPlaylistCard),
      },
      {
        kind: 'albums',
        items: discogsHomeMock.newReleases.map(mapReleaseToCard),
      },
      {
        kind: 'tracks',
        items: mockTracks,
      },
      {
        kind: 'artists',
        items: discogsHomeMock.featuredArtists.map((artist) => mapArtistSummary(artist)),
      },
    ],
  };
}

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
        kind: 'quick-picks',
        title: 'Quick picks for you',
        items: discogsHomeMock.newReleases.slice(0, 6).map(mapReleaseToCard),
      },
      {
        kind: 'mixes',
        title: 'Your Discogs mixes',
        items: discogsHomeMock.editorialPlaylists
          .slice(0, 6)
          .map(mapSearchResultToPlaylistCard),
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
