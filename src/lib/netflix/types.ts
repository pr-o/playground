export type TMDBMediaType = 'movie' | 'tv';

export type TMDBDateField = string | null | undefined;

export interface TMDBMediaRaw {
  id: number;
  media_type?: TMDBMediaType;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  backdrop_path?: string | null;
  poster_path?: string | null;
  release_date?: TMDBDateField;
  first_air_date?: TMDBDateField;
  vote_average?: number | null;
  popularity?: number | null;
  original_language?: string | null;
  genre_ids?: number[];
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface MediaItem {
  id: number;
  mediaType: TMDBMediaType;
  title: string;
  overview: string;
  backdropPath: string | null;
  posterPath: string | null;
  releaseDate: string | null;
  voteAverage: number | null;
  popularity: number | null;
  originalLanguage: string | null;
  genreIds: number[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episodeNumber: number;
  seasonNumber: number;
  stillPath: string | null;
  airDate: string | null;
  runtime: number | null;
}

export interface MediaDetail extends MediaItem {
  tagline: string | null;
  genres: TMDBGenre[];
  homepage: string | null;
  runtime: number | null;
  numberOfSeasons: number | null;
  numberOfEpisodes: number | null;
  status: string | null;
  episodes: Episode[];
}

export interface MediaCollection {
  slug: string;
  label: string;
  items: MediaItem[];
}

export interface CollectionResponsePayload {
  slug: string;
  label: string;
  items: MediaItem[];
  fetchedAt: string;
}

export interface TitleDetailResponsePayload {
  media: MediaDetail;
  fetchedAt: string;
}

export type CollectionSlug =
  | 'trending'
  | 'trending-tv'
  | 'trending-movies'
  | 'top-rated-tv'
  | 'top-rated-movies'
  | 'popular-tv'
  | 'popular-movies'
  | 'upcoming-movies'
  | 'now-playing-movies'
  | 'airing-today'
  | 'new-popular-tv'
  | 'discover-movies'
  | 'discover-tv';
