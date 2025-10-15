import {
  getAlbumMock,
  getArtistTopTracksMock,
  getCategoriesMock,
  getFeaturedPlaylistsMock,
  getNewReleasesMock,
  getPlaylistMock,
  getRecommendationsMock,
  getRelatedArtistsMock,
} from '@/lib/spotify/mocks';
import type {
  SpotifyAlbumResponse,
  SpotifyArtistTopTracksResponse,
  SpotifyCategoriesResponse,
  SpotifyFeaturedPlaylistsResponse,
  SpotifyNewReleasesResponse,
  SpotifyPlaylistResponse,
  SpotifyRecommendationsResponse,
  SpotifyRelatedArtistsResponse,
  SpotifySearchResponse,
} from '@/types/spotify';
import { fetchSpotify } from './client';

type BaseOptions = {
  forceMock?: boolean;
};

export async function getFeaturedPlaylists(
  options: {
    country?: string;
    locale?: string;
    timestamp?: string;
    limit?: number;
    offset?: number;
    forceMock?: boolean;
  } = {},
) {
  const { country = 'US', locale = 'en_US', limit = 20, offset = 0, forceMock } = options;
  return fetchSpotify<SpotifyFeaturedPlaylistsResponse>('/browse/featured-playlists', {
    searchParams: { country, locale, limit, offset, timestamp: options.timestamp },
    mock: getFeaturedPlaylistsMock,
    forceMock,
  });
}

export async function getCategories(
  options: {
    country?: string;
    locale?: string;
    limit?: number;
    offset?: number;
    forceMock?: boolean;
  } = {},
) {
  const { country = 'US', locale = 'en_US', limit = 20, offset = 0, forceMock } = options;
  return fetchSpotify<SpotifyCategoriesResponse>('/browse/categories', {
    searchParams: { country, locale, limit, offset },
    mock: getCategoriesMock,
    forceMock,
  });
}

export async function getNewReleases(
  options: {
    country?: string;
    limit?: number;
    offset?: number;
    forceMock?: boolean;
  } = {},
) {
  const { country = 'US', limit = 20, offset = 0, forceMock } = options;
  return fetchSpotify<SpotifyNewReleasesResponse>('/browse/new-releases', {
    searchParams: { country, limit, offset },
    mock: getNewReleasesMock,
    forceMock,
  });
}

export async function getPlaylist(
  playlistId: string,
  options: BaseOptions & { market?: string } = {},
) {
  const { market = 'US', forceMock } = options;
  return fetchSpotify<SpotifyPlaylistResponse>(`/playlists/${playlistId}`, {
    searchParams: { market },
    mock: getPlaylistMock,
    forceMock,
  });
}

export async function getAlbum(
  albumId: string,
  options: BaseOptions & { market?: string } = {},
) {
  const { market = 'US', forceMock } = options;
  return fetchSpotify<SpotifyAlbumResponse>(`/albums/${albumId}`, {
    searchParams: { market },
    mock: getAlbumMock,
    forceMock,
  });
}

export async function getArtistTopTracks(
  artistId: string,
  options: BaseOptions & { market?: string } = {},
) {
  const { market = 'US', forceMock } = options;
  return fetchSpotify<SpotifyArtistTopTracksResponse>(`/artists/${artistId}/top-tracks`, {
    searchParams: { market },
    mock: getArtistTopTracksMock,
    forceMock,
  });
}

export async function getRelatedArtists(artistId: string, options: BaseOptions = {}) {
  return fetchSpotify<SpotifyRelatedArtistsResponse>(
    `/artists/${artistId}/related-artists`,
    {
      mock: getRelatedArtistsMock,
      forceMock: options.forceMock,
    },
  );
}

export async function getRecommendations(
  params: {
    seed_artists?: string;
    seed_genres?: string;
    seed_tracks?: string;
    limit?: number;
    market?: string;
    min_energy?: number;
    max_energy?: number;
    target_tempo?: number;
  },
  options: BaseOptions = {},
) {
  return fetchSpotify<SpotifyRecommendationsResponse>('/recommendations', {
    searchParams: { ...params },
    mock: getRecommendationsMock,
    forceMock: options.forceMock,
  });
}

export async function searchCatalog(
  query: string,
  types: Array<'album' | 'artist' | 'playlist' | 'track'>,
  options: {
    limit?: number;
    offset?: number;
    market?: string;
    forceMock?: boolean;
  } = {},
) {
  const { limit = 10, offset = 0, market = 'US', forceMock } = options;
  const topTracksMock = getArtistTopTracksMock().tracks;
  return fetchSpotify<SpotifySearchResponse>('/search', {
    searchParams: {
      q: query,
      type: types.join(','),
      limit,
      offset,
      market,
    },
    mock: () => ({
      tracks: topTracksMock
        ? {
            href: '',
            items: topTracksMock,
            limit,
            next: null,
            offset: 0,
            previous: null,
            total: topTracksMock.length,
          }
        : undefined,
    }),
    forceMock,
  });
}
