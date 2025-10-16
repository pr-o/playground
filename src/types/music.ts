export type PlaylistCardData = {
  id: string;
  name: string;
  description?: string;
  ownerName?: string;
  totalTracks?: number;
  imageUrl?: string;
  fallbackColor?: string;
};

export type AlbumCardData = {
  id: string;
  name: string;
  releaseDate?: string;
  totalTracks?: number;
  primaryArtist?: string;
  imageUrl?: string;
};

export type AlbumHeroData = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl?: string;
  releaseDate?: string;
  trackCount?: number;
  artistNames: string[];
  description?: string | null;
  followers?: number;
  dominantColor?: string;
};

export type TrackRowData = {
  id: string;
  title: string;
  artists: string[];
  albumName?: string;
  artworkUrl?: string;
  durationMs: number;
  explicit: boolean;
  popularity?: number;
  previewUrl?: string | null;
  addedAt?: string;
  trackNumber?: number;
};

export type ArtistSummaryData = {
  id: string;
  name: string;
  imageUrl?: string;
  followers?: number;
  genres?: string[];
};

export type MusicHomeSection =
  | {
      kind: 'featured-playlists';
      title: string;
      items: PlaylistCardData[];
    }
  | {
      kind: 'featured-artists';
      title: string;
      items: ArtistSummaryData[];
    }
  | {
      kind: 'categories';
      title: string;
      items: Array<{
        id: string;
        name: string;
        iconUrl?: string;
      }>;
    }
  | {
      kind: 'new-releases';
      title: string;
      items: AlbumCardData[];
    }
  | {
      kind: 'mixes';
      title: string;
      items: PlaylistCardData[];
    }
  | {
      kind: 'quick-picks';
      title: string;
      items: AlbumCardData[];
    };

export type MusicHomeData = {
  message?: string;
  sections: MusicHomeSection[];
};

export type MusicExploreSection =
  | {
      kind: 'categories';
      title: string;
      items: Array<{
        id: string;
        name: string;
        iconUrl?: string;
      }>;
    }
  | {
      kind: 'new-releases';
      title: string;
      items: AlbumCardData[];
    }
  | {
      kind: 'chart-tracks';
      title: string;
      items: TrackRowData[];
      region?: string;
    }
  | {
      kind: 'chart-artists';
      title: string;
      items: ArtistSummaryData[];
      region?: string;
    };

export type MusicExploreData = {
  sections: MusicExploreSection[];
};

export type MusicLibraryCollection =
  | {
      kind: 'playlists';
      items: PlaylistCardData[];
    }
  | {
      kind: 'albums';
      items: AlbumCardData[];
    }
  | {
      kind: 'tracks';
      items: TrackRowData[];
    }
  | {
      kind: 'artists';
      items: ArtistSummaryData[];
    };

export type MusicLibraryData = {
  collections: MusicLibraryCollection[];
};

export type MusicResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
      cause?: unknown;
    };
