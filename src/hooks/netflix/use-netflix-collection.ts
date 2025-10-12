'use client';

import { useQueries, useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { netflixApiClient } from '@/lib/netflix/netflix-client';
import { NETFLIX_COLLECTIONS } from '@/lib/netflix/collections';
import { netflixQueryKeys } from '@/lib/netflix/query-keys';
import type { CollectionResponsePayload, CollectionSlug } from '@/lib/netflix/types';

async function fetchCollection(slug: CollectionSlug): Promise<CollectionResponsePayload> {
  const response = await netflixApiClient.get<CollectionResponsePayload>(
    `/collections/${slug}`,
  );
  return response.data;
}

type CollectionQueryOptions = Omit<
  UseQueryOptions<
    CollectionResponsePayload,
    Error,
    CollectionResponsePayload,
    ReturnType<typeof netflixQueryKeys.collection>
  >,
  'queryKey' | 'queryFn'
>;

export function useNetflixCollection(
  slug: CollectionSlug,
  options?: CollectionQueryOptions,
) {
  return useQuery({
    queryKey: netflixQueryKeys.collection(slug),
    queryFn: () => fetchCollection(slug),
    ...options,
  });
}

export function useNetflixCollections(slugs: CollectionSlug[]) {
  return useQueries({
    queries: slugs.map((slug) => ({
      queryKey: netflixQueryKeys.collection(slug),
      queryFn: () => fetchCollection(slug),
    })),
    combine: (results) => {
      const rows = results.map((result, index) => {
        const slug = slugs[index];
        const fallbackLabel = NETFLIX_COLLECTIONS[slug]?.label ?? '';
        return {
          slug,
          label: result.data?.label ?? fallbackLabel,
          items: result.data?.items ?? [],
          isLoading: result.isLoading,
          isError: result.isError,
          error: result.error,
        };
      });

      return {
        rows,
        isAnyLoading: rows.some((row) => row.isLoading),
        isAnyError: rows.some((row) => row.isError),
      };
    },
  });
}
