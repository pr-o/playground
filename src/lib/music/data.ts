import { cache } from 'react';
import { fetchDiscogs, isDiscogsApiError } from '@/lib/discogs/client';
import { hasDiscogsAuth } from '@/lib/discogs/config';
import { discogsHomeMock } from '@/lib/mock-data/discogs';
import { musicPath } from '@/lib/music/constants';
import {
  mapArtistToHero,
  mapArtistSummary,
  mapReleaseToCard,
  mapReleaseToHero,
  mapSearchResultToAlbumCard,
  mapSearchResultToPlaylistCard,
  mapTrackToRow,
} from '@/lib/music/mappers';
import type {
  ArtistSummaryData,
  MusicExploreData,
  MusicHomeData,
  MusicLibraryData,
  MusicResult,
  TrackRowData,
  MusicAlbumDetail,
  MusicArtistDetail,
  MusicMixDetail,
  MusicPlaylistDetail,
  MusicSearchGroup,
  MusicSearchResult,
  MusicSearchSuggestion,
  MusicTopResult,
} from '@/types/music';
import type {
  DiscogsArtist,
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

function humanizeIdentifier(identifier: string) {
  return decodeURIComponent(identifier.replace(/-/g, ' '));
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

function deriveHeroColor(
  release?: Pick<DiscogsRelease, 'genres'> | { genres?: string[] } | null,
): string | undefined {
  const genre = release?.genres?.[0]?.toLowerCase();
  switch (genre) {
    case 'electronic':
      return 'rgba(138, 79, 255, 0.65)';
    case 'jazz':
      return 'rgba(45, 156, 219, 0.6)';
    case 'hip hop':
    case 'hip-hop':
      return 'rgba(242, 153, 74, 0.6)';
    case 'rock':
      return 'rgba(235, 87, 87, 0.6)';
    case 'pop':
      return 'rgba(255, 87, 161, 0.6)';
    default:
      return release?.genres?.length ? 'rgba(94, 114, 228, 0.6)' : undefined;
  }
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

export const getMusicAlbumDetail = cache(
  async (id: string): Promise<MusicResult<MusicAlbumDetail>> => {
    const fallback = buildAlbumDetailFromMock(id);

    if (!id) {
      return {
        ok: false,
        error: 'Missing album identifier',
      };
    }

    return withResult(async () => {
      const release = await fetchReleaseById(id, { includeTracklist: true });
      if (!release) {
        throw new Error(`Unable to load release ${id}`);
      }

      const hero = mapReleaseToHero(release, {
        dominantColor: deriveHeroColor(release),
      });
      const tracks =
        release.tracklist
          ?.filter((track) => track.type_ === 'track')
          .map((track) => mapTrackToRow(track, release)) ?? [];

      const relatedGenre = release.genres?.[0];
      let related: MusicAlbumDetail['related'] = [];
      if (relatedGenre) {
        const relatedResults = await fetchGenreReleases(relatedGenre, 8);
        related = relatedResults
          .filter((result) => String(result.id) !== String(release.id))
          .map(mapSearchResultToAlbumCard);
      }

      return {
        hero,
        tracks,
        related,
      };
    }, fallback);
  },
);

export const getMusicPlaylistDetail = cache(
  async (id: string): Promise<MusicResult<MusicPlaylistDetail>> => {
    const fallback = buildPlaylistDetailFromMock(id);

    if (!id) {
      return {
        ok: false,
        error: 'Missing playlist identifier',
      };
    }

    return withResult(async () => {
      const release = await fetchReleaseById(id, { includeTracklist: true });
      if (!release) {
        throw new Error(`Unable to load playlist ${id}`);
      }

      const hero = mapReleaseToHero(release, {
        dominantColor: deriveHeroColor(release),
      });
      const tracks =
        release.tracklist
          ?.filter((track) => track.type_ === 'track')
          .map((track) => mapTrackToRow(track, release)) ?? [];

      const relatedResults = await fetchCompilationReleases(12);
      const related = relatedResults
        .filter((result) => String(result.id) !== String(release.id))
        .map(mapSearchResultToPlaylistCard);

      return {
        hero,
        tracks,
        related,
      };
    }, fallback);
  },
);

export const getMusicArtistDetail = cache(
  async (id: string): Promise<MusicResult<MusicArtistDetail>> => {
    const fallback = buildArtistDetailFromMock(id);

    if (!id) {
      return {
        ok: false,
        error: 'Missing artist identifier',
      };
    }

    return withResult(async () => {
      const artist = await fetchDiscogs<DiscogsArtist>(`/artists/${id}`);

      const releasesResponse = await fetchDiscogs<DiscogsSearchResponse>(
        '/database/search',
        {
          searchParams: {
            artist: artist.name,
            type: 'release',
            per_page: 20,
            sort: 'year',
            sort_order: 'desc',
          },
        },
      );

      const releaseResults = releasesResponse.results.filter(
        (result) => result.type === 'release',
      );
      const popularReleases = releaseResults.slice(0, 8).map(mapSearchResultToAlbumCard);

      const releaseDetails = await Promise.all(
        releaseResults
          .slice(0, 4)
          .map((result) => fetchReleaseById(result.id, { includeTracklist: true })),
      );

      const topTracks = releaseDetails
        .filter((release): release is DiscogsRelease =>
          Boolean(release && release.tracklist && release.tracklist.length),
        )
        .flatMap(
          (release) =>
            release.tracklist
              ?.filter((track) => track.type_ === 'track')
              .slice(0, 3)
              .map((track) => mapTrackToRow(track, release)) ?? [],
        )
        .slice(0, 12);

      const genreSource =
        releaseDetails.find((release) => release?.genres && release.genres.length) ??
        null;
      const primaryGenres = genreSource?.genres;

      let relatedArtists: ArtistSummaryData[] = [];
      if (primaryGenres?.length) {
        const relatedResponse = await fetchDiscogs<DiscogsSearchResponse>(
          '/database/search',
          {
            searchParams: {
              genre: primaryGenres[0],
              type: 'artist',
              per_page: 12,
            },
          },
        );

        relatedArtists = relatedResponse.results
          .filter(
            (result) =>
              result.type === 'artist' && String(result.id) !== String(artist.id),
          )
          .slice(0, 8)
          .map((result) => ({
            id: String(result.id),
            name: result.title,
            imageUrl: result.thumb,
            followers: undefined,
            genres: result.genre,
          }));
      }

      const hero = mapArtistToHero(artist, {
        genres: primaryGenres,
      });

      return {
        hero,
        topTracks,
        popularReleases,
        relatedArtists,
      };
    }, fallback);
  },
);

export const getMusicMixDetail = cache(
  async (id: string): Promise<MusicResult<MusicMixDetail>> => {
    const fallback = buildMixDetailFromMock(id);

    if (!id) {
      return {
        ok: false,
        error: 'Missing mix identifier',
      };
    }

    const humanLabel = humanizeIdentifier(id);

    return withResult(async () => {
      const response = await fetchDiscogs<DiscogsSearchResponse>('/database/search', {
        searchParams: {
          q: humanLabel,
          type: 'release',
          per_page: 20,
          sort: 'hot',
          sort_order: 'desc',
        },
      });

      const releases = response.results.filter((result) => result.type === 'release');
      if (!releases.length) {
        throw new Error(`No releases found for mix ${humanLabel}`);
      }

      const releaseDetails = await Promise.all(
        releases
          .slice(0, 4)
          .map((result) => fetchReleaseById(result.id, { includeTracklist: true })),
      );

      const tracks = releaseDetails
        .filter((release): release is DiscogsRelease =>
          Boolean(release && release.tracklist && release.tracklist.length),
        )
        .flatMap(
          (release) =>
            release.tracklist
              ?.filter((track) => track.type_ === 'track')
              .slice(0, 3)
              .map((track) => mapTrackToRow(track, release)) ?? [],
        )
        .slice(0, 20);

      const heroSource =
        releaseDetails.find((release) => release) ??
        (await fetchReleaseById(releases[0].id, { includeTracklist: true }));

      const mixTitle = `${humanLabel
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')} Mix`;

      const hero = heroSource
        ? {
            ...mapReleaseToHero(heroSource, {
              dominantColor: deriveHeroColor(heroSource),
            }),
            title: mixTitle,
            subtitle: 'Various Artists',
            trackCount: tracks.length,
            artistNames: ['Various Artists'],
            description: `A Discogs-powered blend for ${humanLabel.toLowerCase()}.`,
          }
        : {
            id,
            title: mixTitle,
            subtitle: 'Various Artists',
            imageUrl: releases[0]?.cover_image ?? releases[0]?.thumb,
            releaseDate: undefined,
            trackCount: tracks.length,
            artistNames: ['Various Artists'],
            description: `A Discogs-powered blend for ${humanLabel.toLowerCase()}.`,
            followers: undefined,
            dominantColor: undefined,
          };

      const related = releases
        .slice(0, 8)
        .map(mapSearchResultToPlaylistCard)
        .filter(Boolean);

      return {
        hero,
        tracks,
        related,
      };
    }, fallback);
  },
);

export async function searchMusicCatalog(
  query: string,
): Promise<MusicResult<MusicSearchResult>> {
  const trimmed = query.trim();
  if (!trimmed) {
    return {
      ok: true,
      data: { query: '', groups: [] },
    };
  }

  const fallback = buildSearchResultFromMock(trimmed);

  return withResult(async () => {
    const [releaseResponse, artistResponse] = await Promise.all([
      fetchDiscogs<DiscogsSearchResponse>('/database/search', {
        searchParams: {
          q: trimmed,
          type: 'release',
          per_page: 15,
        },
      }),
      fetchDiscogs<DiscogsSearchResponse>('/database/search', {
        searchParams: {
          q: trimmed,
          type: 'artist',
          per_page: 10,
        },
      }),
    ]);

    const releaseResults = releaseResponse.results.filter(
      (result) => result.type === 'release',
    );
    const albumResults = releaseResults.filter((result) =>
      result.format?.some((format) => /album/i.test(format)),
    );
    const playlistResults = releaseResults.filter((result) =>
      result.format?.some((format) => /compilation|mix/i.test(format)),
    );

    const albumItems = albumResults.slice(0, 6).map(mapSearchResultToAlbumCard);
    const playlistItems = playlistResults.slice(0, 6).map(mapSearchResultToPlaylistCard);

    const songReleaseDetails = await Promise.all(
      releaseResults
        .slice(0, 3)
        .map((result) => fetchReleaseById(result.id, { includeTracklist: true })),
    );
    const songItems = songReleaseDetails
      .filter((release): release is DiscogsRelease =>
        Boolean(release && release.tracklist && release.tracklist.length),
      )
      .flatMap(
        (release) =>
          release.tracklist
            ?.filter((track) => track.type_ === 'track')
            .slice(0, 4)
            .map((track) => mapTrackToRow(track, release)) ?? [],
      )
      .slice(0, 10);

    const artistItems = artistResponse.results
      .filter((result) => result.type === 'artist')
      .slice(0, 6)
      .map((result) =>
        mapArtistSummary({
          id: Number.parseInt(String(result.id), 10),
          name: result.title,
          resource_url: result.resource_url,
          thumbnail_url: result.thumb,
        }),
      );

    const groups: MusicSearchGroup[] = [];
    if (songItems.length) {
      groups.push({
        kind: 'songs',
        title: 'Songs',
        items: songItems,
        total: songItems.length,
      });
    }
    if (albumItems.length) {
      groups.push({
        kind: 'albums',
        title: 'Albums',
        items: albumItems,
        total: albumResults.length,
      });
    }
    if (playlistItems.length) {
      groups.push({
        kind: 'playlists',
        title: 'Playlists',
        items: playlistItems,
        total: playlistResults.length,
      });
    }
    if (artistItems.length) {
      groups.push({
        kind: 'artists',
        title: 'Artists',
        items: artistItems,
        total: artistResponse.results.length,
      });
    }

    let topResult: MusicTopResult | undefined;
    if (albumItems[0]) {
      topResult = { kind: 'album', item: albumItems[0] };
    } else if (artistItems[0]) {
      topResult = { kind: 'artist', item: artistItems[0] };
    } else if (playlistItems[0]) {
      topResult = { kind: 'playlist', item: playlistItems[0] };
    } else if (songItems[0]) {
      topResult = { kind: 'song', item: songItems[0] };
    }

    return {
      query: trimmed,
      topResult,
      groups,
    };
  }, fallback);
}

export async function getMusicSearchSuggestions(
  query: string,
): Promise<MusicSearchSuggestion[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  if (!hasDiscogsAuth()) {
    return buildSearchSuggestionsFromMock(trimmed);
  }

  try {
    const [releaseResponse, artistResponse] = await Promise.all([
      fetchDiscogs<DiscogsSearchResponse>('/database/search', {
        searchParams: {
          q: trimmed,
          type: 'release',
          per_page: 6,
        },
      }),
      fetchDiscogs<DiscogsSearchResponse>('/database/search', {
        searchParams: {
          q: trimmed,
          type: 'artist',
          per_page: 6,
        },
      }),
    ]);

    const suggestions: MusicSearchSuggestion[] = [];

    releaseResponse.results
      .filter((result) => result.type === 'release')
      .slice(0, 6)
      .forEach((result) => {
        const kind: MusicTopResult['kind'] = result.format?.some((format) =>
          /compilation|mix/i.test(format),
        )
          ? 'playlist'
          : 'album';
        suggestions.push({
          id: String(result.id),
          label: result.title,
          kind,
          href:
            kind === 'playlist'
              ? musicPath('playlist', result.id)
              : musicPath('album', result.id),
        });
      });

    artistResponse.results
      .filter((result) => result.type === 'artist')
      .slice(0, 6)
      .forEach((result) => {
        suggestions.push({
          id: String(result.id),
          label: result.title,
          kind: 'artist',
          href: `${musicPath('search')}?q=${encodeURIComponent(result.title)}&filter=artists`,
        });
      });

    return suggestions.slice(0, 8);
  } catch (error) {
    if (isDiscogsApiError(error)) {
      return buildSearchSuggestionsFromMock(trimmed);
    }
    return buildSearchSuggestionsFromMock(trimmed);
  }
}

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

function buildArtistDetailFromMock(id?: string): MusicArtistDetail {
  const featured =
    discogsHomeMock.featuredArtists.find((item) => String(item.id) === String(id)) ??
    discogsHomeMock.featuredArtists[0];

  const releases = discogsHomeMock.newReleases.filter((release) =>
    release.artists?.some((artist) => artist.id === featured?.id),
  );

  const tracks = releases
    .flatMap((release) =>
      release.tracklist
        ?.filter((track) => track.type_ === 'track')
        .map((track) => mapTrackToRow(track, release as unknown as DiscogsRelease)),
    )
    .filter(Boolean) as TrackRowData[];

  const popularReleases = (releases.length ? releases : discogsHomeMock.newReleases)
    .slice(0, 6)
    .map((release) => mapReleaseToCard(release as unknown as DiscogsRelease));

  const relatedArtists = discogsHomeMock.featuredArtists
    .filter((artist) => artist.id !== featured?.id)
    .map((artist) => mapArtistSummary(artist));

  const hero = {
    id: String(featured?.id ?? id ?? 'artist'),
    name: featured?.name ?? humanizeIdentifier(String(id ?? 'Unknown artist')),
    imageUrl: featured?.thumbnail_url,
    profile:
      'This is mock artist data sourced from Discogs fixtures. Connect Discogs credentials for live data.',
    memberNames: undefined,
    urls: undefined,
    genres: undefined,
    realName: undefined,
  };

  return {
    hero,
    topTracks: tracks.slice(0, 10),
    popularReleases,
    relatedArtists,
  };
}

function buildMixDetailFromMock(id?: string): MusicMixDetail {
  const mix =
    discogsHomeMock.editorialPlaylists.find((item) => String(item.id) === String(id)) ??
    discogsHomeMock.editorialPlaylists[0];

  const tracks = discogsHomeMock.newReleases
    .flatMap((release) =>
      release.tracklist
        ?.filter((track) => track.type_ === 'track')
        .slice(0, 1)
        .map((track) => mapTrackToRow(track, release as unknown as DiscogsRelease)),
    )
    .filter(Boolean) as TrackRowData[];

  const hero = {
    id: String(mix?.id ?? id ?? 'mix'),
    title: `${(mix?.title ?? humanizeIdentifier(String(id ?? 'Mock mix'))).trim()} Mix`,
    subtitle: 'Various Artists',
    imageUrl: mix?.thumb,
    releaseDate: undefined,
    trackCount: tracks.length,
    artistNames: ['Various Artists'],
    description:
      'Mock mix assembled from Discogs fixtures. Connect Discogs credentials for live blends.',
    followers: undefined,
    dominantColor: undefined,
  };

  const related = discogsHomeMock.editorialPlaylists
    .filter((playlist) => playlist.id !== mix?.id)
    .map((playlist) => mapSearchResultToPlaylistCard(playlist));

  return {
    hero,
    tracks,
    related,
  };
}

function buildLibraryDataFromMock(): MusicLibraryData {
  const mockTracks = discogsHomeMock.newReleases
    .flatMap((release) =>
      release.tracklist
        ?.filter((track) => track.type_ === 'track')
        .slice(0, 1)
        .map((track) => mapTrackToRow(track, release as unknown as DiscogsRelease)),
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
        items: discogsHomeMock.newReleases.map((release) =>
          mapReleaseToCard(release as unknown as DiscogsRelease),
        ),
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

function buildAlbumDetailFromMock(id?: string): MusicAlbumDetail {
  const release =
    discogsHomeMock.newReleases.find((item) => String(item.id) === String(id)) ??
    discogsHomeMock.newReleases[0];
  const castRelease = release as unknown as DiscogsRelease;
  const hero = mapReleaseToHero(castRelease, {
    dominantColor: deriveHeroColor(castRelease),
  });
  const tracks =
    castRelease.tracklist
      ?.filter((track) => track.type_ === 'track')
      .map((track) => mapTrackToRow(track, castRelease)) ?? [];
  const related = discogsHomeMock.newReleases
    .filter((item) => item.id !== release.id)
    .slice(0, 8)
    .map((item) => mapReleaseToCard(item as unknown as DiscogsRelease));

  return {
    hero,
    tracks,
    related,
  };
}

function buildPlaylistDetailFromMock(id?: string): MusicPlaylistDetail {
  const playlist =
    discogsHomeMock.editorialPlaylists.find((item) => String(item.id) === String(id)) ??
    discogsHomeMock.editorialPlaylists[0];
  const matchingRelease =
    discogsHomeMock.newReleases.find((item) => String(item.id) === String(playlist.id)) ??
    discogsHomeMock.newReleases[0];
  const castRelease = matchingRelease as unknown as DiscogsRelease;

  const hero = mapReleaseToHero(castRelease, {
    dominantColor: deriveHeroColor(castRelease),
  });
  const tracks =
    castRelease.tracklist
      ?.filter((track) => track.type_ === 'track')
      .map((track) => mapTrackToRow(track, castRelease)) ?? [];
  const related = discogsHomeMock.editorialPlaylists
    .filter((item) => item.id !== playlist.id)
    .slice(0, 8)
    .map((item) => mapSearchResultToPlaylistCard(item));

  return {
    hero,
    tracks,
    related,
  };
}

function buildSearchResultFromMock(query: string): MusicSearchResult {
  const albums = discogsHomeMock.newReleases.map((release) =>
    mapReleaseToCard(release as unknown as DiscogsRelease),
  );
  const playlists = discogsHomeMock.editorialPlaylists.map((item) =>
    mapSearchResultToPlaylistCard(item),
  );
  const tracks = discogsHomeMock.newReleases
    .flatMap((release) =>
      release.tracklist
        ?.filter((track) => track.type_ === 'track')
        .slice(0, 2)
        .map((track) => mapTrackToRow(track, release as unknown as DiscogsRelease)),
    )
    .filter(Boolean) as TrackRowData[];
  const artists = discogsHomeMock.featuredArtists.map((artist) =>
    mapArtistSummary(artist),
  );

  const groups: MusicSearchGroup[] = [];
  if (tracks.length) {
    groups.push({
      kind: 'songs',
      title: 'Songs',
      items: tracks.slice(0, 8),
      total: tracks.length,
    });
  }
  if (albums.length) {
    groups.push({
      kind: 'albums',
      title: 'Albums',
      items: albums.slice(0, 6),
      total: albums.length,
    });
  }
  if (playlists.length) {
    groups.push({
      kind: 'playlists',
      title: 'Playlists',
      items: playlists.slice(0, 6),
      total: playlists.length,
    });
  }
  if (artists.length) {
    groups.push({
      kind: 'artists',
      title: 'Artists',
      items: artists.slice(0, 6),
      total: artists.length,
    });
  }

  const topResult: MusicTopResult | undefined = albums[0]
    ? { kind: 'album', item: albums[0] }
    : artists[0]
      ? { kind: 'artist', item: artists[0] }
      : playlists[0]
        ? { kind: 'playlist', item: playlists[0] }
        : tracks[0]
          ? { kind: 'song', item: tracks[0] }
          : undefined;

  return {
    query,
    topResult,
    groups,
  };
}

function buildSearchSuggestionsFromMock(query: string): MusicSearchSuggestion[] {
  const lower = query.toLowerCase();
  const albumSuggestions = discogsHomeMock.newReleases
    .filter((release) => release.title.toLowerCase().includes(lower))
    .slice(0, 4)
    .map((release) => ({
      id: String(release.id),
      label: release.title,
      kind: 'album' as const,
      href: musicPath('album', release.id),
    }));

  const playlistSuggestions = discogsHomeMock.editorialPlaylists
    .filter((playlist) => playlist.title.toLowerCase().includes(lower))
    .slice(0, 3)
    .map((playlist) => ({
      id: String(playlist.id),
      label: playlist.title,
      kind: 'playlist' as const,
      href: musicPath('playlist', playlist.id),
    }));

  const artistSuggestions = discogsHomeMock.featuredArtists
    .filter((artist) => artist.name.toLowerCase().includes(lower))
    .slice(0, 3)
    .map((artist) => ({
      id: String(artist.id),
      label: artist.name,
      kind: 'artist' as const,
      href: `${musicPath('search')}?q=${encodeURIComponent(artist.name)}&filter=artists`,
    }));

  return [...albumSuggestions, ...playlistSuggestions, ...artistSuggestions].slice(0, 8);
}

function buildHomeDataFromMock(): MusicHomeData {
  return {
    message: 'Discogs editorial picks',
    sections: [
      {
        kind: 'new-releases',
        title: 'Latest releases',
        items: discogsHomeMock.newReleases.map((release) =>
          mapReleaseToCard(release as unknown as DiscogsRelease),
        ),
      },
      {
        kind: 'quick-picks',
        title: 'Quick picks for you',
        items: discogsHomeMock.newReleases
          .slice(0, 6)
          .map((release) => mapReleaseToCard(release as unknown as DiscogsRelease)),
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
