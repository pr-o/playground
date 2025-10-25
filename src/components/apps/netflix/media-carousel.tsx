'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MediaItem } from '@/lib/netflix/types';
import { MediaCard } from './media-card';

type MediaCarouselProps = {
  title: string;
  items: MediaItem[];
  isLoading?: boolean;
  error?: Error | null;
};

export function MediaCarousel({ title, items, isLoading, error }: MediaCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const node = scrollContainerRef.current;
    if (!node) return;
    const scrollAmount = direction === 'left' ? -node.clientWidth : node.clientWidth;
    node.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const showEmpty = !isLoading && !error && items.length === 0;
  const showControls = !isLoading && !error && items.length > 0;

  return (
    <section className="relative">
      <header className="mb-3 px-1">
        <h3 className="text-lg font-semibold text-white md:text-xl">{title}</h3>
      </header>
      <div className="relative">
        {isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[260px] w-[180px] animate-pulse rounded-md bg-zinc-800"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-6 text-sm text-red-200">
            Failed to load this row. Try refreshing the page.
          </div>
        ) : showEmpty ? (
          <div className="rounded-md border border-white/10 bg-white/5 p-6 text-sm text-white/70">
            Nothing to show right now. Check back soon for updates.
          </div>
        ) : (
          <div className="flex items-center gap-3">
            {showControls && (
              <CarouselButton direction="left" onClick={() => scroll('left')} />
            )}
            <div className="relative flex-1 overflow-hidden">
              <div
                ref={scrollContainerRef}
                className="flex gap-3 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [\&::-webkit-scrollbar]:hidden"
              >
                {items.map((item) => (
                  <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
                ))}
              </div>
            </div>
            {showControls && (
              <CarouselButton direction="right" onClick={() => scroll('right')} />
            )}
          </div>
        )}
      </div>
    </section>
  );
}

type CarouselButtonProps = {
  direction: 'left' | 'right';
  onClick: () => void;
};

function CarouselButton({ direction, onClick }: CarouselButtonProps) {
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={`Scroll ${direction}`}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
    >
      <Icon className="size-5" />
    </button>
  );
}
