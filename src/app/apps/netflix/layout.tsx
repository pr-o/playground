import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NetflixProviders } from '@/components/clones/netflix/netflix-providers';
import { NetflixShell } from '@/components/clones/netflix/netflix-shell';

const title = 'Netflix - Playground';

export const metadata: Metadata = {
  title,
  description:
    'Browse the curated Playground projects, including interactive apps and games built with Next.js and modern UI patterns.',
  openGraph: {
    title,
    description:
      'Discover interactive apps and games crafted in the Playground with polished Next.js experiences.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description:
      'Discover interactive apps and games crafted in the Playground with polished Next.js experiences.',
  },
};

export default function NetflixLayout({ children }: { children: ReactNode }) {
  return (
    <NetflixProviders>
      <NetflixShell>{children}</NetflixShell>
    </NetflixProviders>
  );
}
