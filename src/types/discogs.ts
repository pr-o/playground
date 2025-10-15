export type DiscogsImage = {
  type: string;
  uri: string;
  uri150: string;
  width: number;
  height: number;
};

export type DiscogsArtistSummary = {
  id: number;
  name: string;
  resource_url: string;
  thumbnail_url?: string;
  uri?: string;
  role?: string;
};

export type DiscogsLabelSummary = {
  id: number;
  name: string;
  resource_url: string;
  catno?: string;
};

export type DiscogsTrack = {
  position: string;
  type_: string;
  title: string;
  duration: string;
  extraartists?: DiscogsArtistSummary[];
};

export type DiscogsRelease = {
  id: number;
  title: string;
  country?: string;
  year?: number | string;
  released?: string;
  genres?: string[];
  styles?: string[];
  thumb?: string;
  notes?: string;
  images?: DiscogsImage[];
  resource_url: string;
  uri: string;
  artists?: DiscogsArtistSummary[];
  labels?: DiscogsLabelSummary[];
  tracklist?: DiscogsTrack[];
  community?: {
    want?: number;
    have?: number;
    rating?: {
      count: number;
      average: number;
    };
  };
  videos?: Array<{
    uri: string;
    title: string;
    description?: string;
  }>;
};

export type DiscogsMasterRelease = DiscogsRelease & {
  main_release: number;
  versions_url: string;
  most_recent_release?: number;
};

export type DiscogsArtist = {
  id: number;
  name: string;
  realname?: string;
  profile?: string;
  resource_url: string;
  uri: string;
  images?: DiscogsImage[];
  members?: DiscogsArtistSummary[];
  urls?: string[];
};

export type DiscogsSearchResult = {
  id: number;
  type: string;
  title: string;
  year?: string;
  country?: string;
  genre?: string[];
  style?: string[];
  thumb?: string;
  cover_image?: string;
  resource_url: string;
  uri: string;
  label?: string[];
  format?: string[];
};

export type DiscogsSearchResponse = {
  pagination: {
    per_page: number;
    items: number;
    page: number;
    pages: number;
    urls?: {
      next?: string;
      prev?: string;
    };
  };
  results: DiscogsSearchResult[];
};
