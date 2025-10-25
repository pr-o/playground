'use client';

import type { MouseEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, ListPlus, Play, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AlbumCardData, ArtistSummaryData, PlaylistCardData } from '@/types/music';
import { useMusicPlaybackStore, useMusicUIStore } from '@/store/music';
import { albumCardToPlayback, playlistCardToPlayback } from '@/lib/music/playback';
import { musicPath } from '@/lib/music/constants';

const FALLBACK_ART =
  'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80';

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

type MusicQuickPickCardProps = {
  release: AlbumCardData;
  href?: string;
  className?: string;
};

type MusicMixCardProps = MusicPlaylistCardProps;

type CardActionHandlers = {
  handlePlay: (event: MouseEvent) => void;
  handlePlayNext: (event: MouseEvent) => void;
  handleAddToQueue: (event: MouseEvent) => void;
};

function useCardPlaybackActions(
  playbackTitle: string,
  playbackDescription: string | undefined,
  playbackTrack:
    | ReturnType<typeof albumCardToPlayback>
    | ReturnType<typeof playlistCardToPlayback>,
): CardActionHandlers {
  const playTrack = useMusicPlaybackStore((state) => state.playTrack);
  const addToQueue = useMusicPlaybackStore((state) => state.addToQueue);
  const pushToast = useMusicUIStore((state) => state.pushToast);

  const handlePlay = (event: MouseEvent) => {
    event.preventDefault();
    playTrack(playbackTrack, { startPlaying: true });
    pushToast({
      title: 'Now playing',
      description: playbackDescription ?? playbackTitle,
      variant: 'info',
      durationMs: 2000,
    });
  };

  const handlePlayNext = (event: MouseEvent) => {
    event.preventDefault();
    addToQueue(playbackTrack, { next: true });
    pushToast({
      title: 'Queued to play next',
      description: playbackTitle,
      variant: 'success',
      durationMs: 2000,
    });
  };

  const handleAddToQueue = (event: MouseEvent) => {
    event.preventDefault();
    addToQueue(playbackTrack);
    pushToast({
      title: 'Added to queue',
      description: playbackTitle,
      variant: 'success',
      durationMs: 2000,
    });
  };

  return { handlePlay, handlePlayNext, handleAddToQueue };
}

export function MusicReleaseCard({ release, href, className }: MusicReleaseCardProps) {
  const targetHref = href ?? musicPath('album', release.id);
  const playbackTrack = albumCardToPlayback(release);
  const { handlePlay, handlePlayNext, handleAddToQueue } = useCardPlaybackActions(
    release.name,
    release.primaryArtist,
    playbackTrack,
  );

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
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={handlePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow"
            aria-label={`Play ${release.name}`}
          >
            <Play className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handlePlayNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white transition hover:bg-black/60"
            aria-label={`Play ${release.name} next`}
          >
            <ListPlus className="h-5 w-5" />
          </button>
        </div>
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
        <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToQueue}
            className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-music-ghost transition hover:border-white/40 hover:text-music-primary"
          >
            queue
          </button>
        </div>
      </div>
    </Link>
  );
}

export function MusicPlaylistCard({ playlist, href, className }: MusicPlaylistCardProps) {
  const targetHref = href ?? musicPath('playlist', playlist.id);
  const playbackTrack = playlistCardToPlayback(playlist);
  const { handlePlay, handlePlayNext, handleAddToQueue } = useCardPlaybackActions(
    playlist.name,
    playlist.description,
    playbackTrack,
  );

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
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={handlePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow"
            aria-label={`Play ${playlist.name}`}
          >
            <Play className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handlePlayNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white transition hover:bg-black/60"
            aria-label={`Play ${playlist.name} next`}
          >
            <ListPlus className="h-5 w-5" />
          </button>
        </div>
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
        <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToQueue}
            className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-music-ghost transition hover:border-white/40 hover:text-music-primary"
          >
            queue
          </button>
        </div>
      </div>
    </Link>
  );
}

export function MusicMixCard({ playlist, href, className }: MusicMixCardProps) {
  const targetHref = href ?? musicPath('mix', playlist.id);
  const playbackTrack = playlistCardToPlayback(playlist);
  const { handlePlay, handlePlayNext, handleAddToQueue } = useCardPlaybackActions(
    playlist.name,
    playlist.description,
    playbackTrack,
  );

  return (
    <Link
      href={targetHref}
      className={cn(
        'group flex w-48 flex-col gap-3 rounded-3xl border border-white/5 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-4 text-music-muted transition hover:border-white/20 hover:from-white/20 hover:via-white/10',
        className,
      )}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-music-card-alt">
        <Image
          src={playlist.imageUrl ?? FALLBACK_ART}
          alt={playlist.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="192px"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-black shadow">
          Mix
        </span>
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={handlePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow"
            aria-label={`Play ${playlist.name}`}
          >
            <Play className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={handlePlayNext}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/40 text-white transition hover:bg-black/60"
            aria-label={`Play ${playlist.name} next`}
          >
            <ListPlus className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="line-clamp-2 text-sm font-semibold text-music-primary">
          {playlist.name}
        </h3>
        {playlist.description && (
          <p className="line-clamp-2 text-xs text-music-muted">{playlist.description}</p>
        )}
        <p className="text-xs uppercase tracking-[0.25em] text-music-ghost">
          {playlist.ownerName ?? 'Discogs Curated'}
        </p>
        <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
          <button
            type="button"
            onClick={handleAddToQueue}
            className="rounded-full border border-white/20 px-2 py-1 text-[10px] uppercase tracking-[0.3em] text-music-ghost transition hover:border-white/40 hover:text-music-primary"
          >
            queue
          </button>
        </div>
      </div>
    </Link>
  );
}

export function MusicQuickPickCard({
  release,
  href,
  className,
}: MusicQuickPickCardProps) {
  const targetHref = href ?? musicPath('album', release.id);
  const playbackTrack = albumCardToPlayback(release);
  const { handlePlay, handlePlayNext, handleAddToQueue } = useCardPlaybackActions(
    release.name,
    release.primaryArtist,
    playbackTrack,
  );

  return (
    <Link
      href={targetHref}
      className={cn(
        'group flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-4 py-3 transition hover:border-white/20 hover:bg-white/10',
        className,
      )}
    >
      <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-music-card-alt">
        <Image
          src={release.imageUrl ?? FALLBACK_ART}
          alt={release.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-110"
          sizes="64px"
        />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-semibold text-music-primary">
          {release.name}
        </p>
        <p className="truncate text-xs text-music-muted">
          {release.primaryArtist ?? 'Various artists'}
        </p>
      </div>
      <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          onClick={handlePlay}
          className="rounded-full border border-white/20 p-1.5 text-music-muted transition hover:border-white/40 hover:text-music-primary"
          aria-label={`Play ${release.name}`}
        >
          <Play className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handlePlayNext}
          className="rounded-full border border-white/20 p-1.5 text-music-muted transition hover:border-white/40 hover:text-music-primary"
          aria-label={`Play ${release.name} next`}
        >
          <ListPlus className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleAddToQueue}
          className="rounded-full border border-white/20 p-1.5 text-music-muted transition hover:border-white/40 hover:text-music-primary"
          aria-label={`Add ${release.name} to queue`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {release.releaseDate && (
        <span className="text-[10px] uppercase tracking-[0.3em] text-music-ghost">
          {release.releaseDate}
        </span>
      )}
    </Link>
  );
}

export function MusicArtistCard({ artist, href, className }: MusicArtistCardProps) {
  const targetHref = href ?? musicPath('artist', artist.id);

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
