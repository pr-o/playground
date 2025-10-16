export type MusicPlaybackTrack = {
  id: string;
  title: string;
  artists: string[];
  albumName?: string;
  artworkUrl?: string;
  durationMs: number;
  previewUrl?: string | null;
  source?: 'discogs' | 'mock';
};
