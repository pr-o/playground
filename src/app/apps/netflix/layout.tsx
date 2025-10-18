import type { ReactNode } from 'react';
import { NetflixProviders } from '@/components/clones/netflix/netflix-providers';
import { NetflixShell } from '@/components/clones/netflix/netflix-shell';

export default function NetflixLayout({ children }: { children: ReactNode }) {
  return (
    <NetflixProviders>
      <NetflixShell>{children}</NetflixShell>
    </NetflixProviders>
  );
}
