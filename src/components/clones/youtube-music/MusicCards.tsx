import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlbumCardData, ArtistSummaryData, PlaylistCardData } from '@/types/music';

type MusicReleaseCardProps = {
  release: AlbumCardData;
  href?: string;
  className?: string;
};

type MusicPlaylistCardProps = {
  playlist: PlaylistCardData;
  href?: string;
  className?: string;
};

type MusicArtistCardProps = {
  artist: ArtistSummaryData;
  href?: string;
  className?: string;
};

const FALLBACK_ART =
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80';

export function MusicReleaseCard({ release, href, className }: MusicReleaseCardProps) {
  const targetHref = href ?? `/clones/youtube-music/album/${release.id}`;
  return (
    <Link
      href={targetHref}
      className={cn(
        'group flex w-44 flex-col gap-3 rounded-3xl border border-white/5 bg-white/5 p-4 text-music-muted transition hover:border-white/20 hover:bg-white/10',
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-music-card-alt">
        <Image
          src={release.imageUrl ?? FALLBACK_ART}
          alt={release.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="176px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/0 to-black/10 opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="space-y-2">
        <h3 className="truncate text-base font-semibold text-music-primary">
          {release.name}
        </h3>
        <p className="truncate text-xs uppercase tracking-[0.2em] text-music-ghost">
          {release.primaryArtist ?? 'Various Artists'}
        </p>
        <p className="text-xs text-music-muted">
          {[release.releaseDate, release.totalTracks && `${release.totalTracks} tracks`]
            .filter(Boolean)
            .join(' • ')}
        </p>
      </div>
    </Link>
  );
}

export function MusicPlaylistCard({ playlist, href, className }: MusicPlaylistCardProps) {
  const targetHref = href ?? `/clones/youtube-music/playlist/${playlist.id}`;
  return (
    <Link
      href={targetHref}
      className={cn(
        'group flex w-64 flex-col gap-3 rounded-3xl border border-white/5 bg-white/5 p-4 text-music-muted transition hover:border-white/20 hover:bg-white/10',
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-transparent">
        <Image
          src={playlist.imageUrl ?? FALLBACK_ART}
          alt={playlist.name}
          fill
          className="object-cover opacity-90 transition duration-500 group-hover:scale-105 group-hover:opacity-100"
          sizes="256px"
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-black shadow">
            <ChevronRight className="h-5 w-5" />
          </span>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="truncate text-base font-semibold text-music-primary">
          {playlist.name}
        </h3>
        {playlist.description && (
          <p className="line-clamp-2 text-xs text-music-muted">{playlist.description}</p>
        )}
        <p className="text-xs uppercase tracking-[0.25em] text-music-ghost">
          {playlist.ownerName ?? 'Discogs Editorial'}
        </p>
      </div>
    </Link>
  );
}

export function MusicArtistCard({ artist, href, className }: MusicArtistCardProps) {
  const targetHref = href ?? `/clones/youtube-music/artist/${artist.id}`;

  return (
    <Link
      href={targetHref}
      className={cn(
        'group flex w-44 flex-col items-center gap-3 rounded-3xl border border-white/5 bg-white/5 p-4 text-center text-music-muted transition hover:border-white/20 hover:bg-white/10',
        className,
      )}
    >
      <div className="relative h-24 w-24 overflow-hidden rounded-full bg-music-card-alt">
        <Image
          src={artist.imageUrl ?? FALLBACK_ART}
          alt={artist.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-110"
          sizes="96px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 transition group-hover:opacity-100" />
      </div>
      <div className="space-y-1">
        <h3 className="line-clamp-2 text-sm font-semibold text-music-primary">
          {artist.name}
        </h3>
        {artist.followers && (
          <p className="text-xs text-music-muted">
            {artist.followers.toLocaleString()} listeners
          </p>
        )}
      </div>
    </Link>
  );
}
