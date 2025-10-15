import { create } from 'zustand';
import type {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyTrack,
} from '@/types/spotify';

export type LibraryState = {
  playlists: SpotifyPlaylist[];
  albums: SpotifyAlbum[];
  artists: SpotifyArtist[];
  likedTracks: SpotifyTrack[];
  listeningHistory: SpotifyTrack[];
  likedTrackIds: Record<string, true>;
  savedPlaylistIds: Record<string, true>;
  savedAlbumIds: Record<string, true>;
};

export type LibraryActions = {
  hydrateLibrary: (data: Partial<LibraryState>) => void;
  setPlaylists: (playlists: SpotifyPlaylist[]) => void;
  setAlbums: (albums: SpotifyAlbum[]) => void;
  setArtists: (artists: SpotifyArtist[]) => void;
  setLikedTracks: (tracks: SpotifyTrack[]) => void;
  toggleTrackLike: (track: SpotifyTrack) => void;
  togglePlaylistSaved: (playlist: SpotifyPlaylist) => void;
  toggleAlbumSaved: (album: SpotifyAlbum) => void;
  recordPlay: (track: SpotifyTrack) => void;
  clearHistory: () => void;
};

export type LibraryStore = LibraryState & LibraryActions;

const MAX_HISTORY_ITEMS = 50;

const initialState: LibraryState = {
  playlists: [],
  albums: [],
  artists: [],
  likedTracks: [],
  listeningHistory: [],
  likedTrackIds: {},
  savedPlaylistIds: {},
  savedAlbumIds: {},
};

function normalizeList<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export const useMusicLibraryStore = create<LibraryStore>((set) => ({
  ...initialState,

  hydrateLibrary: (data) => {
    set((state) => ({
      ...state,
      ...data,
      likedTrackIds: data.likedTracks
        ? data.likedTracks.reduce<Record<string, true>>((acc, track) => {
            acc[track.id] = true;
            return acc;
          }, {})
        : state.likedTrackIds,
      savedAlbumIds: data.albums
        ? data.albums.reduce<Record<string, true>>((acc, album) => {
            acc[album.id] = true;
            return acc;
          }, {})
        : state.savedAlbumIds,
      savedPlaylistIds: data.playlists
        ? data.playlists.reduce<Record<string, true>>((acc, playlist) => {
            acc[playlist.id] = true;
            return acc;
          }, {})
        : state.savedPlaylistIds,
    }));
  },

  setPlaylists: (playlists) => {
    set((state) => ({
      ...state,
      playlists: normalizeList(playlists),
      savedPlaylistIds: playlists.reduce<Record<string, true>>((acc, playlist) => {
        acc[playlist.id] = true;
        return acc;
      }, {}),
    }));
  },

  setAlbums: (albums) => {
    set((state) => ({
      ...state,
      albums: normalizeList(albums),
      savedAlbumIds: albums.reduce<Record<string, true>>((acc, album) => {
        acc[album.id] = true;
        return acc;
      }, {}),
    }));
  },

  setArtists: (artists) => {
    set((state) => ({
      ...state,
      artists: normalizeList(artists),
    }));
  },

  setLikedTracks: (tracks) => {
    set(() => ({
      likedTracks: normalizeList(tracks),
      likedTrackIds: tracks.reduce<Record<string, true>>((acc, track) => {
        acc[track.id] = true;
        return acc;
      }, {}),
    }));
  },

  toggleTrackLike: (track) => {
    set((state) => {
      const isLiked = Boolean(state.likedTrackIds[track.id]);
      if (isLiked) {
        return {
          ...state,
          likedTracks: state.likedTracks.filter((item) => item.id !== track.id),
          likedTrackIds: Object.keys(state.likedTrackIds).reduce<Record<string, true>>(
            (acc, id) => {
              if (id !== track.id) {
                acc[id] = true;
              }
              return acc;
            },
            {},
          ),
        };
      }

      return {
        ...state,
        likedTracks: normalizeList([track, ...state.likedTracks]),
        likedTrackIds: {
          ...state.likedTrackIds,
          [track.id]: true,
        },
      };
    });
  },

  togglePlaylistSaved: (playlist) => {
    set((state) => {
      const isSaved = Boolean(state.savedPlaylistIds[playlist.id]);
      if (isSaved) {
        return {
          ...state,
          playlists: state.playlists.filter((item) => item.id !== playlist.id),
          savedPlaylistIds: Object.keys(state.savedPlaylistIds).reduce<
            Record<string, true>
          >((acc, id) => {
            if (id !== playlist.id) {
              acc[id] = true;
            }
            return acc;
          }, {}),
        };
      }

      return {
        ...state,
        playlists: normalizeList([playlist, ...state.playlists]),
        savedPlaylistIds: {
          ...state.savedPlaylistIds,
          [playlist.id]: true,
        },
      };
    });
  },

  toggleAlbumSaved: (album) => {
    set((state) => {
      const isSaved = Boolean(state.savedAlbumIds[album.id]);
      if (isSaved) {
        return {
          ...state,
          albums: state.albums.filter((item) => item.id !== album.id),
          savedAlbumIds: Object.keys(state.savedAlbumIds).reduce<Record<string, true>>(
            (acc, id) => {
              if (id !== album.id) {
                acc[id] = true;
              }
              return acc;
            },
            {},
          ),
        };
      }

      return {
        ...state,
        albums: normalizeList([album, ...state.albums]),
        savedAlbumIds: {
          ...state.savedAlbumIds,
          [album.id]: true,
        },
      };
    });
  },

  recordPlay: (track) => {
    set((state) => {
      const updatedHistory = [
        track,
        ...state.listeningHistory.filter((item) => item.id !== track.id),
      ];
      if (updatedHistory.length > MAX_HISTORY_ITEMS) {
        updatedHistory.length = MAX_HISTORY_ITEMS;
      }
      return {
        ...state,
        listeningHistory: updatedHistory,
      };
    });
  },

  clearHistory: () => {
    set((state) => ({
      ...state,
      listeningHistory: [],
    }));
  },
}));
