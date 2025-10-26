// import { trpc } from '@/trpc/client'; // to fetch from client
import { HydrateClient, trpc } from '@/trpc/server';
import { PageClient } from './client';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

export default async function Home() {
  // const { data } = await trpc.hello.useQuery({ user: 'Sung' }); // fetch from client
  // const data = await trpc.hello({ user: 'Sung' }); // fetch from backend
  void trpc.hello.prefetch({ user: 'Sung' }); // fetch from backend

  return (
    <HydrateClient>
      <Suspense fallback={<p>Loading...</p>}>
        <ErrorBoundary fallback={<p>Error</p>}>
          <PageClient />
        </ErrorBoundary>
      </Suspense>
    </HydrateClient>
  );
}
