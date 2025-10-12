import Image from 'next/image';
import type { MediaItem } from '@/lib/netflix/types';
import { formatVoteAverage, getMediaLabel, truncate } from '@/lib/netflix/helpers';
import { cn } from '@/lib/utils';
import { MyListButton } from './my-list-button';

type MediaCardProps = {
  item: MediaItem;
  className?: string;
  size?: 'compact' | 'expanded';
};

export function MediaCard({ item, className, size = 'compact' }: MediaCardProps) {
  const sizeClasses =
    size === 'expanded'
      ? 'w-full flex-shrink-0 md:w-full'
      : 'w-[180px] flex-shrink-0 md:w-[220px]';

  const imageSizes =
    size === 'expanded'
      ? '(min-width: 1280px) 280px, (min-width: 1024px) 240px, (min-width: 768px) 220px, (min-width: 640px) 200px, 160px'
      : '(min-width: 1024px) 220px, (min-width: 640px) 200px, 160px';

  return (
    <article
      className={cn(
        'group relative overflow-hidden rounded-md bg-zinc-900 text-white shadow-md transition hover:scale-105 hover:z-10',
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
          <MyListButton media={item} variant="icon" className="size-9" />
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
  );
}
