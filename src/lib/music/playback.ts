import type { MusicPlaybackTrack } from '@/types/playback';
import type { AlbumCardData, PlaylistCardData, TrackRowData } from '@/types/music';

const FALLBACK_PREVIEW_URL =
  'https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4e/Beep-sound.ogg/Beep-sound.ogg.mp3';

export function trackRowToPlayback(track: TrackRowData): MusicPlaybackTrack {
  return {
    id: track.id,
    title: track.title,
    artists: track.artists,
    albumName: track.albumName,
    artworkUrl: track.artworkUrl,
    durationMs: track.durationMs,
    previewUrl: track.previewUrl ?? FALLBACK_PREVIEW_URL,
    source: 'discogs',
  };
}

export function trackRowsToPlayback(tracks: TrackRowData[]): MusicPlaybackTrack[] {
  return tracks.map(trackRowToPlayback);
}

export function albumCardToPlayback(album: AlbumCardData): MusicPlaybackTrack {
  return {
    id: album.id,
    title: album.name,
    artists: album.primaryArtist ? [album.primaryArtist] : ['Various Artists'],
    albumName: album.name,
    artworkUrl: album.imageUrl,
    durationMs: album.totalTracks ? album.totalTracks * 180000 : 180000,
    previewUrl: FALLBACK_PREVIEW_URL,
    source: 'discogs',
  };
}

export function playlistCardToPlayback(playlist: PlaylistCardData): MusicPlaybackTrack {
  return {
    id: playlist.id,
    title: playlist.name,
    artists: playlist.ownerName ? [playlist.ownerName] : ['Discogs Editorial'],
    albumName: playlist.description,
    artworkUrl: playlist.imageUrl,
    durationMs: playlist.totalTracks ? playlist.totalTracks * 180000 : 180000,
    previewUrl: FALLBACK_PREVIEW_URL,
    source: 'discogs',
  };
}
