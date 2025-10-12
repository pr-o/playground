'use client';

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { netflixApiClient } from '@/lib/netflix/netflix-client';
import { netflixQueryKeys } from '@/lib/netflix/query-keys';
import type {
  MediaDetail,
  TitleDetailResponsePayload,
  TMDBMediaType,
} from '@/lib/netflix/types';

async function fetchTitleDetail(
  mediaType: TMDBMediaType,
  id: number,
): Promise<MediaDetail> {
  const response = await netflixApiClient.get<TitleDetailResponsePayload>(
    `/titles/${mediaType}/${id}`,
  );
  return response.data.media;
}

export function useNetflixTitleDetail(
  mediaType: TMDBMediaType,
  id: number,
  options?: Omit<
    UseQueryOptions<
      MediaDetail,
      Error,
      MediaDetail,
      ReturnType<typeof netflixQueryKeys.title>
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: netflixQueryKeys.title(mediaType, id),
    queryFn: () => fetchTitleDetail(mediaType, id),
    ...options,
  });
}
