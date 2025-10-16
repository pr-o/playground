'use client';

import type { ReactNode } from 'react';
import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type HorizontalScrollerProps = {
  children: ReactNode;
  className?: string;
  scrollAmount?: number;
  showControls?: boolean;
};

export function HorizontalScroller({
  children,
  className,
  scrollAmount = 320,
  showControls = true,
}: HorizontalScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const amount = direction === 'left' ? -scrollAmount : scrollAmount;
    container.scrollBy({ left: amount, behavior: 'smooth' });
  };

  return (
    <div className={cn('relative', className)}>
      {showControls && (
        <>
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => handleScroll('left')}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-music/50 bg-music-card/90 p-2 text-music-secondary shadow-lg transition hover:border-white/60 hover:text-music-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => handleScroll('right')}
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-music/50 bg-music-card/90 p-2 text-music-secondary shadow-lg transition hover:border-white/60 hover:text-music-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      <div
        ref={containerRef}
        className="no-scrollbar flex gap-4 overflow-x-auto scroll-smooth px-10 py-2"
      >
        {children}
      </div>
    </div>
  );
}
