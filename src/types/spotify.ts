export type SpotifyExternalUrls = {
  spotify: string;
};

export type SpotifyImage = {
  url: string;
  width?: number | null;
  height?: number | null;
};

export type SpotifyFollowers = {
  total: number;
};

export type SpotifyOwner = {
  id: string;
  display_name?: string;
  external_urls?: SpotifyExternalUrls;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  genres?: string[];
  images?: SpotifyImage[];
  followers?: SpotifyFollowers;
  popularity?: number;
  external_urls?: SpotifyExternalUrls;
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  total_tracks: number;
  images: SpotifyImage[];
  label?: string;
  artists: SpotifyArtist[];
  external_urls?: SpotifyExternalUrls;
  tracks?: SpotifyPaginated<SpotifyTrack>;
};

export type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  track_number?: number;
  disc_number?: number;
  explicit?: boolean;
  popularity?: number;
  preview_url?: string | null;
  is_playable?: boolean;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
  external_urls?: SpotifyExternalUrls;
};

export type SpotifyPlaylistTrack = {
  added_at?: string;
  track: SpotifyTrack;
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description?: string;
  images: SpotifyImage[];
  owner: SpotifyOwner;
  tracks: {
    total: number;
    items?: SpotifyPlaylistTrack[];
  };
  followers?: SpotifyFollowers;
  snapshot_id?: string;
  primary_color?: string | null;
  external_urls?: SpotifyExternalUrls;
};

export type SpotifyCategory = {
  id: string;
  name: string;
  icons: SpotifyImage[];
  href?: string;
};

export type SpotifyPaginated<T> = {
  href?: string;
  items: T[];
  limit: number;
  next?: string | null;
  offset: number;
  previous?: string | null;
  total: number;
};

export type SpotifyFeaturedPlaylistsResponse = {
  message: string;
  playlists: SpotifyPaginated<SpotifyPlaylist>;
};

export type SpotifyCategoriesResponse = {
  categories: SpotifyPaginated<SpotifyCategory>;
};

export type SpotifyNewReleasesResponse = {
  albums: SpotifyPaginated<SpotifyAlbum>;
};

export type SpotifyRecommendationsResponse = {
  tracks: SpotifyTrack[];
  seeds: Array<{
    id: string;
    href?: string;
    initialPoolSize?: number;
    afterFilteringSize?: number;
    afterRelinkingSize?: number;
    type?: string;
  }>;
};

export type SpotifyPlaylistResponse = SpotifyPlaylist & {
  followers: SpotifyFollowers;
  tracks: SpotifyPaginated<SpotifyPlaylistTrack>;
};

export type SpotifyAlbumResponse = SpotifyAlbum & {
  tracks: SpotifyPaginated<SpotifyTrack>;
};

export type SpotifySearchResponse = {
  tracks?: SpotifyPaginated<SpotifyTrack>;
  albums?: SpotifyPaginated<SpotifyAlbum>;
  playlists?: SpotifyPaginated<SpotifyPlaylist>;
  artists?: SpotifyPaginated<SpotifyArtist>;
};

export type SpotifyArtistTopTracksResponse = {
  tracks: SpotifyTrack[];
};

export type SpotifyRelatedArtistsResponse = {
  artists: SpotifyArtist[];
};

export type SpotifyAudioFeatures = {
  id: string;
  danceability: number;
  energy: number;
  tempo: number;
  valence: number;
  instrumentalness: number;
  acousticness: number;
};

export type SpotifyAudioFeaturesResponse = {
  audio_features: SpotifyAudioFeatures[];
};
