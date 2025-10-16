import type { MusicPlaybackTrack } from '@/types/playback';
import type { TrackRowData } from '@/types/music';

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
