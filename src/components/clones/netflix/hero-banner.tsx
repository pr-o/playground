import Image from 'next/image';
import type { MediaItem } from '@/lib/netflix/types';
import { formatVoteAverage, getMediaLabel, truncate } from '@/lib/netflix/helpers';
import { MyListButton } from './my-list-button';

type HeroBannerProps = {
  media: MediaItem | null | undefined;
  isLoading?: boolean;
};

export function HeroBanner({ media, isLoading }: HeroBannerProps) {
  if (!media) {
    if (isLoading) {
      return <HeroBannerSkeleton isLoading />;
    }
    return <HeroBannerEmpty />;
  }

  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-b-lg bg-black/40">
      {media.backdropPath ? (
        <Image
          src={media.backdropPath}
          alt={media.title}
          fill
          priority
          className="object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black" />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black" />
      <div className="absolute inset-x-6 bottom-24 flex flex-col gap-4 md:bottom-28 md:max-w-xl">
        <h2 className="text-3xl font-bold drop-shadow md:text-5xl">{media.title}</h2>
        <p className="text-sm font-semibold text-green-400 md:text-base">
          {formatVoteAverage(media.voteAverage)} Match • {getMediaLabel(media)}
        </p>
        <p className="line-clamp-3 text-sm text-white/80 md:text-base">
          {truncate(media.overview, 190)}
        </p>
        <div className="mt-2 flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-md bg-white px-5 py-2 text-sm font-bold text-black transition hover:bg-white/90 md:text-base">
            Play
          </button>
          <button className="flex items-center gap-2 rounded-md bg-gray-500/70 px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-500/50 md:text-base">
            More Info
          </button>
          <MyListButton media={media} variant="icon" />
        </div>
      </div>
    </section>
  );
}

type HeroBannerSkeletonProps = {
  isLoading?: boolean;
};

function HeroBannerSkeleton({ isLoading }: HeroBannerSkeletonProps) {
  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden rounded-b-lg bg-gradient-to-br from-zinc-800 to-black">
      <div className="absolute inset-x-6 bottom-24 flex animate-pulse flex-col gap-4 md:bottom-28 md:max-w-xl">
        <div className="h-12 w-48 rounded bg-white/20" />
        <div className="h-4 w-32 rounded bg-white/20" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-white/20" />
          <div className="h-3 w-5/6 rounded bg-white/20" />
          <div className="h-3 w-3/4 rounded bg-white/20" />
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-24 rounded bg-white/30" />
          <div className="h-10 w-28 rounded bg-white/30" />
          <div className="h-10 w-10 rounded-full bg-white/30" />
        </div>
      </div>
      {isLoading && (
        <span className="absolute right-6 top-6 text-xs uppercase tracking-wide text-white/60">
          Loading…
        </span>
      )}
    </section>
  );
}

function HeroBannerEmpty() {
  return (
    <section className="relative flex h-[60vh] min-h-[360px] items-center justify-center rounded-b-lg border border-dashed border-white/10 bg-black/40">
      <div className="text-center text-sm text-white/60">
        No feature selected yet. Add shows to your list or explore other tabs to discover
        something new.
      </div>
    </section>
  );
}
