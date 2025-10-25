'use client';

import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { MyListProvider } from './my-list-context';

type NetflixProvidersProps = {
  children: ReactNode;
};

export function NetflixProviders({ children }: NetflixProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MyListProvider>{children}</MyListProvider>
    </QueryClientProvider>
  );
}
