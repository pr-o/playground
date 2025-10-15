import { formatNumber, formatRelativeDate } from '@/lib/format';
import type {
  AlbumCardData,
  AlbumHeroData,
  ArtistSummaryData,
  PlaylistCardData,
  TrackRowData,
} from '@/types/music';
import type {
  DiscogsArtist,
  DiscogsArtistSummary,
  DiscogsMasterRelease,
  DiscogsRelease,
  DiscogsSearchResult,
  DiscogsTrack,
} from '@/types/discogs';

function pickReleaseImage(release?: DiscogsRelease | DiscogsMasterRelease | null) {
  if (!release) return undefined;
  if (release.images?.length) {
    return release.images[0]?.uri ?? release.images[0]?.uri150;
  }
  if ('cover_image' in release && release.cover_image) return release.cover_image;
  if ('thumb' in release && release.thumb) return release.thumb;
  return undefined;
}

function pickSearchImage(
  result: DiscogsSearchResult | { cover_image?: string; thumb?: string },
) {
  return result.cover_image ?? result.thumb;
}

function parseDuration(duration?: string) {
  if (!duration) return 0;
  const parts = duration.split(':').map((part) => Number.parseInt(part, 10));
  if (parts.length === 2) {
    return parts[0] * 60 * 1000 + parts[1] * 1000;
  }
  if (parts.length === 3) {
    return parts[0] * 60 * 60 * 1000 + parts[1] * 60 * 1000 + parts[2] * 1000;
  }
  return 0;
}

function ensureReleaseYear(release?: DiscogsRelease | DiscogsMasterRelease) {
  if (!release) return undefined;
  if (typeof release.year === 'number') return release.year.toString();
  if (typeof release.year === 'string') return release.year;
  if (release.released) return release.released.slice(0, 4);
  return undefined;
}

function formatCommunityStats(release?: DiscogsRelease | DiscogsMasterRelease) {
  if (!release?.community) return undefined;
  const want = release.community.want ?? 0;
  const have = release.community.have ?? 0;
  if (!want && !have) return undefined;
  return `${formatNumber(want, { maximumFractionDigits: 0 })} want • ${formatNumber(have, { maximumFractionDigits: 0 })} have`;
}

export function mapReleaseToCard(
  release: DiscogsRelease | DiscogsMasterRelease,
): AlbumCardData {
  const primaryArtist = release.artists?.length
    ? release.artists.map((artist) => artist.name).join(', ')
    : undefined;

  return {
    id: String(release.id),
    name: release.title,
    releaseDate: ensureReleaseYear(release),
    totalTracks: release.tracklist?.length,
    primaryArtist,
    imageUrl: pickReleaseImage(release),
  };
}

export function mapSearchResultToAlbumCard(
  result:
    | DiscogsSearchResult
    | {
        id: number | string;
        title: string;
        year?: string | number;
        label?: string[];
        cover_image?: string;
        thumb?: string;
      },
): AlbumCardData {
  return {
    id: String(result.id),
    name: result.title,
    releaseDate: typeof result.year === 'number' ? String(result.year) : result.year,
    totalTracks: undefined,
    primaryArtist: result.label?.[0],
    imageUrl: pickSearchImage(result as DiscogsSearchResult),
  };
}

export function mapSearchResultToPlaylistCard(
  result:
    | DiscogsSearchResult
    | {
        id: number | string;
        title: string;
        genre?: string[];
        style?: string[];
        label?: string[];
        format?: string[];
        cover_image?: string;
        thumb?: string;
      },
): PlaylistCardData {
  const primaryLabel = result.label?.[0];
  return {
    id: String(result.id),
    name: result.title,
    description: [result.format?.join(', '), result.genre?.join(', ')]
      .filter(Boolean)
      .join(' • '),
    ownerName: primaryLabel,
    totalTracks: undefined,
    imageUrl: pickSearchImage(result as DiscogsSearchResult),
  };
}

export function mapReleaseToHero(
  release: DiscogsRelease | DiscogsMasterRelease,
  options?: { dominantColor?: string },
): AlbumHeroData {
  const releaseDate = release.released
    ? formatRelativeDate(release.released)
    : ensureReleaseYear(release);
  const description =
    release.notes ??
    [
      release.genres?.slice(0, 3).join(' • '),
      release.styles?.slice(0, 2).join(' • '),
      formatCommunityStats(release),
    ]
      .filter(Boolean)
      .join(' • ');

  return {
    id: String(release.id),
    title: release.title,
    subtitle:
      release.artists?.map((artist) => artist.name).join(' • ') ?? 'Various Artists',
    imageUrl: pickReleaseImage(release),
    releaseDate: releaseDate ?? undefined,
    trackCount: release.tracklist?.length,
    artistNames: release.artists?.map((artist) => artist.name) ?? [],
    description,
    followers: release.community?.have,
    dominantColor: options?.dominantColor,
  };
}

export function mapTrackToRow(
  track: DiscogsTrack,
  release: DiscogsRelease | DiscogsMasterRelease,
): TrackRowData {
  const durationMs = parseDuration(track.duration);
  const artists =
    track.extraartists?.length &&
    track.extraartists.some((extra) => extra.role?.includes('Featuring'))
      ? track.extraartists
          .filter((extra) => extra.role?.includes('Featuring'))
          .map((artist) => artist.name)
      : (release.artists?.map((artist) => artist.name) ?? []);

  return {
    id: `${release.id}-${track.position || track.title}`,
    title: track.title,
    artists,
    albumName: release.title,
    artworkUrl: pickReleaseImage(release),
    durationMs,
    explicit: false,
    popularity: release.community?.rating?.average,
    previewUrl: undefined,
    addedAt: undefined,
    trackNumber: track.position
      ? Number.parseInt(track.position.replace(/\D/g, ''), 10) || undefined
      : undefined,
  };
}

export function mapArtistSummary(
  artist: DiscogsArtist | DiscogsArtistSummary,
): ArtistSummaryData {
  const imageUrl =
    'images' in artist && artist.images && artist.images.length
      ? (artist.images[0]?.uri ?? artist.images[0]?.uri150)
      : 'thumbnail_url' in artist
        ? artist.thumbnail_url
        : undefined;

  return {
    id: String(artist.id),
    name: artist.name,
    imageUrl,
    followers: undefined,
    genres: undefined,
  };
}
