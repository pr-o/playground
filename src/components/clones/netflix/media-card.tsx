'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogCloseButton,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNetflixTitleDetail } from '@/hooks/netflix/use-netflix-title-detail';
import type { MediaDetail, MediaItem } from '@/lib/netflix/types';
import { formatVoteAverage, getMediaLabel, truncate } from '@/lib/netflix/helpers';
import { cn } from '@/lib/utils';
import { MyListButton } from './my-list-button';

type MediaCardProps = {
  item: MediaItem;
  className?: string;
  size?: 'compact' | 'expanded';
};

export function MediaCard({ item, className, size = 'compact' }: MediaCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const detailQuery = useNetflixTitleDetail(item.mediaType, item.id, {
    enabled: isOpen,
    staleTime: 5 * 60_000,
  });

  const detail = detailQuery.data;

  const sizeClasses =
    size === 'expanded'
      ? 'w-full flex-shrink-0 md:w-full'
      : 'w-[180px] flex-shrink-0 md:w-[220px]';

  const imageSizes =
    size === 'expanded'
      ? '(min-width: 1280px) 280px, (min-width: 1024px) 240px, (min-width: 768px) 220px, (min-width: 640px) 200px, 160px'
      : '(min-width: 1024px) 220px, (min-width: 640px) 200px, 160px';

  const modalMedia: MediaItem | MediaDetail = detail ?? item;
  const heroImage =
    detail?.backdropPath ?? detail?.posterPath ?? item.backdropPath ?? item.posterPath;
  const displayOverview = detail?.overview?.length ? detail.overview : item.overview;
  const genres = detail?.genres ?? [];
  const episodes = detail?.episodes ?? [];
  const matchLabel = formatVoteAverage(modalMedia.voteAverage);

  const infoLines = useMemo(() => {
    const entries: Array<{ label: string; value: string | null }> = [
      {
        label: 'Media Type',
        value: modalMedia.mediaType === 'movie' ? 'Movie' : 'Series',
      },
      { label: 'Original Language', value: modalMedia.originalLanguage ?? null },
    ];
    if (detail?.runtime) {
      entries.push({ label: 'Runtime', value: `${detail.runtime} min` });
    }
    if (detail?.numberOfSeasons) {
      entries.push({ label: 'Seasons', value: `${detail.numberOfSeasons}` });
    }
    if (detail?.numberOfEpisodes) {
      entries.push({ label: 'Episodes', value: `${detail.numberOfEpisodes}` });
    }
    if (detail?.status) {
      entries.push({ label: 'Status', value: detail.status });
    }
    if (modalMedia.releaseDate) {
      entries.push({ label: 'Released', value: modalMedia.releaseDate });
    }
    return entries.filter((entry) => Boolean(entry.value));
  }, [detail, modalMedia]);

  const handleCardKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(true);
    }
  };

  const handleMyListClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <article
          role="button"
          tabIndex={0}
          onKeyDown={handleCardKeyDown}
          className={cn(
            'group relative overflow-hidden rounded-md bg-zinc-900 text-white shadow-md transition hover:scale-105 hover:z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
            sizeClasses,
            className,
          )}
        >
          <div className="relative h-[260px] w-full bg-zinc-800">
            {item.posterPath ? (
              <Image
                src={item.posterPath}
                alt={item.title}
                fill
                sizes={imageSizes}
                className="object-cover transition duration-300 group-hover:opacity-20"
              />
            ) : item.backdropPath ? (
              <Image
                src={item.backdropPath}
                alt={item.title}
                fill
                sizes={imageSizes}
                className="object-cover transition duration-300 group-hover:opacity-20"
              />
            ) : (
              <div className="h-full w-full bg-zinc-800" />
            )}
          </div>
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/50 to-transparent p-4 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-sm font-semibold leading-tight">{item.title}</h3>
              <MyListButton
                media={item}
                variant="icon"
                className="size-9 pointer-events-auto"
                onClick={handleMyListClick}
              />
            </div>
            <p className="mt-2 text-xs text-white/70">{getMediaLabel(item)}</p>
            <p className="mt-2 text-xs leading-snug text-white/80">
              {truncate(item.overview, 120)}
            </p>
            <p className="mt-3 text-xs font-semibold text-green-400">
              Match score {formatVoteAverage(item.voteAverage)}
            </p>
          </div>
        </article>
      </DialogTrigger>
      <DialogContent className="p-4">
        <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-zinc-950 text-white shadow-2xl">
          <DialogTitle className="sr-only">{modalMedia.title}</DialogTitle>
          <DialogCloseButton />
          <div className="relative aspect-video w-full bg-zinc-900">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={modalMedia.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 space-y-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold drop-shadow md:text-4xl">
                  {modalMedia.title}
                </h2>
                {detail?.tagline ? (
                  <p className="text-sm text-white/80 md:text-base">{detail.tagline}</p>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold uppercase text-white/70 md:text-sm">
                <span className="text-green-400">{matchLabel} Match</span>
                <span>{getMediaLabel(modalMedia)}</span>
                {detail?.runtime ? <span>{detail.runtime} min</span> : null}
              </div>
              <div className="flex flex-wrap gap-3 text-sm font-semibold">
                <button className="flex items-center gap-2 rounded-md bg-white px-5 py-2 text-black transition hover:bg-white/90">
                  Play
                </button>
                <button className="flex items-center gap-2 rounded-md bg-white/20 px-5 py-2 text-white transition hover:bg-white/30">
                  More Like This
                </button>
                <MyListButton media={modalMedia} variant="icon" className="size-10" />
              </div>
            </div>
          </div>
          <div className="grid max-h-[70vh] gap-6 overflow-y-auto p-6 md:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <section className="space-y-3">
                <h3 className="text-lg font-semibold">About</h3>
                <p className="text-sm text-white/80 md:text-base">
                  {displayOverview || 'No overview available yet.'}
                </p>
              </section>
              <section className="space-y-3">
                <h3 className="text-lg font-semibold">Episodes</h3>
                {detailQuery.isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-16 w-full animate-pulse rounded-md bg-white/10"
                      />
                    ))}
                  </div>
                ) : episodes.length ? (
                  <ul className="space-y-3">
                    {episodes.slice(0, 6).map((episode) => (
                      <li
                        key={episode.id}
                        className="rounded-md border border-white/10 bg-white/5 p-4 text-sm md:flex md:items-start md:gap-4"
                      >
                        <div className="flex h-20 w-32 flex-shrink-0 items-center justify-center overflow-hidden rounded-md bg-black/40">
                          {episode.stillPath ? (
                            <Image
                              src={episode.stillPath}
                              alt={episode.name}
                              width={128}
                              height={80}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs text-white/50">
                              Episode {episode.episodeNumber}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 space-y-1 md:mt-0">
                          <p className="text-sm font-semibold text-white">
                            {episode.episodeNumber}. {episode.name}
                          </p>
                          <p className="text-xs text-white/70">
                            {episode.airDate
                              ? new Date(episode.airDate).toLocaleDateString()
                              : 'TBA'}
                            {episode.runtime ? ` • ${episode.runtime}m` : ''}
                          </p>
                          <p className="text-xs text-white/60">
                            {episode.overview
                              ? truncate(episode.overview, 150)
                              : 'No synopsis available.'}
                          </p>
                        </div>
                      </li>
                    ))}
                    {episodes.length > 6 ? (
                      <li className="text-xs text-white/60">Showing first 6 episodes.</li>
                    ) : null}
                  </ul>
                ) : (
                  <p className="text-sm text-white/60">
                    Episode information is not available yet.
                  </p>
                )}
              </section>
            </div>
            <aside className="space-y-4">
              <section className="space-y-2">
                <h4 className="text-base font-semibold">Genres</h4>
                {genres.length ? (
                  <ul className="flex flex-wrap gap-2 text-xs text-white/70">
                    {genres.map((genre) => (
                      <li key={genre.id} className="rounded-full bg-white/10 px-3 py-1">
                        {genre.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/60">Genres coming soon.</p>
                )}
              </section>
              <section className="space-y-2">
                <h4 className="text-base font-semibold">Details</h4>
                <dl className="space-y-2 text-xs text-white/70">
                  {infoLines.map((entry) => (
                    <div key={entry.label} className="flex justify-between gap-4">
                      <dt className="font-medium text-white/80">{entry.label}</dt>
                      <dd className="text-right">{entry.value}</dd>
                    </div>
                  ))}
                </dl>
              </section>
              {detail?.homepage ? (
                <a
                  href={detail.homepage}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-md bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
                >
                  Visit Official Site
                </a>
              ) : null}
            </aside>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
