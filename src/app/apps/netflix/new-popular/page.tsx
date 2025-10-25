'use client';

import { useMemo } from 'react';
import { HeroBanner } from '@/components/apps/netflix/hero-banner';
import { MediaCarousel } from '@/components/apps/netflix/media-carousel';
import { NEW_AND_POPULAR_ORDER } from '@/lib/netflix/constants';
import {
  useNetflixCollection,
  useNetflixCollections,
} from '@/hooks/netflix/use-netflix-collection';
import { pickHeroCandidate } from '@/lib/netflix/normalize';

const HERO_SLUG = 'now-playing-movies' as const;

export default function NetflixNewPopularPage() {
  const heroQuery = useNetflixCollection(HERO_SLUG);
  const { rows } = useNetflixCollections(NEW_AND_POPULAR_ORDER);

  const heroMedia = useMemo(() => {
    if (!heroQuery.data?.items?.length) return null;
    return pickHeroCandidate(heroQuery.data.items);
  }, [heroQuery.data?.items]);

  return (
    <div className="space-y-10 pb-12">
      <HeroBanner media={heroMedia} isLoading={heroQuery.isLoading} />

      {rows.map((row) => (
        <MediaCarousel
          key={row.slug}
          title={row.label}
          items={row.items}
          isLoading={row.isLoading}
          error={row.error ?? null}
        />
      ))}
    </div>
  );
}
