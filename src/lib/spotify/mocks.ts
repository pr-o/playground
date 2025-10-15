import { musicHomeMock } from '@/lib/mock-data/music';
import type {
  SpotifyAlbumResponse,
  SpotifyArtist,
  SpotifyArtistTopTracksResponse,
  SpotifyCategoriesResponse,
  SpotifyFeaturedPlaylistsResponse,
  SpotifyNewReleasesResponse,
  SpotifyPlaylistResponse,
  SpotifyRecommendationsResponse,
  SpotifyRelatedArtistsResponse,
  SpotifyTrack,
} from '@/types/spotify';

const demoArtist: SpotifyArtist = {
  id: 'artist-nova',
  name: 'Nova Haze',
  genres: ['synthwave', 'alt pop'],
  images: [
    {
      url: 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=512&q=80',
      width: 512,
      height: 512,
    },
  ],
  followers: { total: 486234 },
  popularity: 66,
};

const demoArtistAlt: SpotifyArtist = {
  id: 'artist-lumina',
  name: 'Lumina Lines',
  genres: ['indie electronica'],
  images: [
    {
      url: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&w=512&q=80',
      width: 512,
      height: 512,
    },
  ],
  followers: { total: 238012 },
  popularity: 61,
};

const demoAlbum: SpotifyAlbumResponse = {
  id: 'astral-season',
  name: 'Astral Season',
  album_type: 'album',
  release_date: '2024-09-06',
  total_tracks: 6,
  images: [
    {
      url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=512&q=80',
      width: 512,
      height: 512,
    },
  ],
  artists: [demoArtist],
  tracks: {
    href: 'https://api.spotify.com/v1/albums/astral-season/tracks',
    items: [],
    limit: 6,
    next: null,
    offset: 0,
    previous: null,
    total: 6,
  },
};

const demoTracks: SpotifyTrack[] = [
  {
    id: 'track-midnight-avenue',
    name: 'Midnight Avenue',
    duration_ms: 218000,
    explicit: false,
    popularity: 55,
    preview_url: 'https://p.scdn.co/mp3-preview/dummy-midnight-avenue?cid=demo',
    artists: [demoArtist],
    album: demoAlbum,
  },
  {
    id: 'track-starlit-motion',
    name: 'Starlit Motion',
    duration_ms: 205000,
    explicit: false,
    popularity: 58,
    preview_url: 'https://p.scdn.co/mp3-preview/dummy-starlit-motion?cid=demo',
    artists: [demoArtist, demoArtistAlt],
    album: demoAlbum,
  },
  {
    id: 'track-neon-drift',
    name: 'Neon Drift',
    duration_ms: 244000,
    explicit: false,
    popularity: 62,
    preview_url: 'https://p.scdn.co/mp3-preview/dummy-neon-drift?cid=demo',
    artists: [demoArtistAlt],
    album: demoAlbum,
  },
];

demoAlbum.tracks.items = demoTracks.map((track, index) => ({
  ...track,
  disc_number: 1,
  track_number: index + 1,
}));

const playlistDetailMock: SpotifyPlaylistResponse = {
  id: 'late-night-drive',
  name: 'Late Night Drive',
  description: 'Cruise through the city lights with shimmering synths.',
  images: [
    {
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=512&q=80',
      width: 512,
      height: 512,
    },
  ],
  owner: {
    id: 'spotify',
    display_name: 'Spotify',
  },
  followers: { total: 1820456 },
  external_urls: {
    spotify: 'https://open.spotify.com/playlist/late-night-drive',
  },
  tracks: {
    href: 'https://api.spotify.com/v1/playlists/late-night-drive/tracks',
    items: demoTracks.map((track) => ({
      added_at: '2024-08-20T08:00:00Z',
      track,
    })),
    limit: demoTracks.length,
    next: null,
    offset: 0,
    previous: null,
    total: demoTracks.length,
  },
};

const recommendationsMock: SpotifyRecommendationsResponse = {
  tracks: demoTracks,
  seeds: [
    {
      id: demoArtist.id,
      type: 'artist',
      afterFilteringSize: 250,
      afterRelinkingSize: 250,
      initialPoolSize: 250,
    },
  ],
};

const artistTopTracksMock: SpotifyArtistTopTracksResponse = {
  tracks: demoTracks,
};

const relatedArtistsMock: SpotifyRelatedArtistsResponse = {
  artists: [
    demoArtistAlt,
    {
      id: 'artist-cascade',
      name: 'Cascade Echo',
      genres: ['dream pop', 'indie electronica'],
      popularity: 58,
      images: [
        {
          url: 'https://images.unsplash.com/photo-1499084732479-de2c02d45fc4?auto=format&fit=crop&w=512&q=80',
          width: 512,
          height: 512,
        },
      ],
      followers: { total: 162334 },
    },
  ],
};

export const spotifyMockData = {
  featuredPlaylists: musicHomeMock.featuredPlaylists as SpotifyFeaturedPlaylistsResponse,
  categories: musicHomeMock.categories as SpotifyCategoriesResponse,
  newReleases: musicHomeMock.newReleases as SpotifyNewReleasesResponse,
  playlist: playlistDetailMock,
  album: demoAlbum,
  recommendations: recommendationsMock,
  artistTopTracks: artistTopTracksMock,
  relatedArtists: relatedArtistsMock,
};

export function getFeaturedPlaylistsMock() {
  return spotifyMockData.featuredPlaylists;
}

export function getCategoriesMock() {
  return spotifyMockData.categories;
}

export function getNewReleasesMock() {
  return spotifyMockData.newReleases;
}

export function getPlaylistMock() {
  return spotifyMockData.playlist;
}

export function getAlbumMock() {
  return spotifyMockData.album;
}

export function getRecommendationsMock() {
  return spotifyMockData.recommendations;
}

export function getArtistTopTracksMock() {
  return spotifyMockData.artistTopTracks;
}

export function getRelatedArtistsMock() {
  return spotifyMockData.relatedArtists;
}
