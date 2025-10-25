'use client';

import { useMemo } from 'react';
import { HeroBanner } from '@/components/apps/netflix/hero-banner';
import { MediaCarousel } from '@/components/apps/netflix/media-carousel';
import { HERO_FALLBACK_SLUG, HOME_COLLECTION_ORDER } from '@/lib/netflix/constants';
import {
  useNetflixCollection,
  useNetflixCollections,
} from '@/hooks/netflix/use-netflix-collection';
import { pickHeroCandidate } from '@/lib/netflix/normalize';

export default function NetflixHomePage() {
  const heroQuery = useNetflixCollection(HERO_FALLBACK_SLUG);
  const { rows } = useNetflixCollections(HOME_COLLECTION_ORDER);

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
