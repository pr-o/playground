'use client';

import { useMemo } from 'react';
import { HeroBanner } from '@/components/apps/netflix/hero-banner';
import { MediaCard } from '@/components/apps/netflix/media-card';
import { useMyList } from '@/components/apps/netflix/my-list-context';
import { pickHeroCandidate } from '@/lib/netflix/normalize';

export default function NetflixMyListPage() {
  const { items, isHydrated } = useMyList();

  const heroMedia = useMemo(() => {
    if (!items.length) return null;
    return pickHeroCandidate(items);
  }, [items]);

  const showEmptyState = isHydrated && items.length === 0;

  return (
    <div className="space-y-10 pb-12">
      <HeroBanner media={heroMedia} isLoading={!isHydrated} />

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-white md:text-2xl">My List</h2>
        {showEmptyState ? (
          <div className="rounded-md border border-dashed border-white/10 bg-white/5 p-10 text-center text-sm text-white/70">
            You haven&apos;t added anything yet. Browse shows and movies to build your
            personal list.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <MediaCard
                key={`${item.mediaType}-${item.id}`}
                item={item}
                size="expanded"
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
