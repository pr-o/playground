'use client';

import type { ReactNode } from 'react';
import { useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBreakpointValue } from '@/hooks/music/use-breakpoint-value';

type HorizontalScrollerProps = {
  children: ReactNode;
  className?: string;
  scrollAmount?: number;
  showControls?: boolean;
};

export function HorizontalScroller({
  children,
  className,
  scrollAmount,
  showControls = true,
}: HorizontalScrollerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const responsiveScrollAmount = useBreakpointValue(
    {
      base: 220,
      md: 320,
      xl: 380,
    },
    320,
  );

  const resolvedScrollAmount = useMemo(
    () => scrollAmount ?? responsiveScrollAmount ?? 320,
    [responsiveScrollAmount, scrollAmount],
  );

  const handleScroll = (direction: 'left' | 'right') => {
    const container = containerRef.current;
    if (!container) return;
    const amount = direction === 'left' ? -resolvedScrollAmount : resolvedScrollAmount;
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
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-music/50 bg-music-card/90 p-2 text-music-secondary shadow-lg transition hover:border-white/60 hover:text-music-primary md:left-3"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => handleScroll('right')}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full border border-music/50 bg-music-card/90 p-2 text-music-secondary shadow-lg transition hover:border-white/60 hover:text-music-primary md:right-3"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
      <div
        ref={containerRef}
        className="no-scrollbar flex gap-3 overflow-x-auto scroll-smooth px-4 py-2 sm:gap-4 sm:px-6 lg:px-10"
      >
        {children}
      </div>
    </div>
  );
}
