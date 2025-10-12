import type { CollectionSlug } from './types';

export const netflixQueryKeys = {
  all: ['netflix'] as const,
  collections() {
    return [...this.all, 'collections'] as const;
  },
  collection(slug: CollectionSlug) {
    return [...this.collections(), slug] as const;
  },
};
