import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Game2048 } from '@/components/games/game-2048/Game2048';
import { SonnerToaster } from '@/components/ui/sonner';

const title = '2048 Remix - Playground';

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

export default function Game2048Page() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-10 px-4 py-12 sm:py-16">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          2048 Remix
        </h1>
      </header>

      <Suspense
        fallback={
          <div className="flex h-[420px] w-[420px] items-center justify-center rounded-3xl border border-border/60 bg-muted/20 text-muted-foreground">
            Loading game…
          </div>
        }
      >
        {/* Client component renders the interactive game */}
        <Game2048 />
      </Suspense>
      <SonnerToaster position="top-center" />
    </div>
  );
}
