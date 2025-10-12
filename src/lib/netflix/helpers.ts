import type { MediaItem } from './types';

export function formatVoteAverage(vote: number | null): string {
  if (!vote) return 'NR';
  return vote.toFixed(1);
}

export function formatReleaseYear(media: MediaItem): string | null {
  if (!media.releaseDate) return null;
  return new Date(media.releaseDate).getFullYear().toString();
}

export function getMediaLabel(media: MediaItem): string {
  const parts: string[] = [];
  const year = formatReleaseYear(media);
  if (year) parts.push(year);
  parts.push(media.mediaType === 'movie' ? 'Movie' : 'Series');
  return parts.join(' • ');
}

export function truncate(text: string, limit = 220): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trimEnd()}…`;
}
