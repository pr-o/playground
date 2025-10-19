import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BejeweledGame } from '@/components/games/bejeweled/BejeweledGame';

const title = 'Bejeweled - Playground';

export const metadata: Metadata = {
  title,
  description:
    'Play a handcrafted Bejeweled experience powered by PixiJS and modern Next.js patterns.',
  openGraph: {
    title,
    description:
      'Slide gems, clear combos, and enjoy the polished Bejeweled playground built with PixiJS.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description:
      'Slide gems, clear combos, and enjoy the polished Bejeweled playground built with PixiJS.',
  },
};

export default function BejeweledPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-10 px-4 py-12 sm:py-16">
      <header className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">Bejeweled</h1>
      </header>

      <Suspense
        fallback={
          <div className="flex h-[480px] w-[480px] items-center justify-center rounded-3xl border border-border/60 bg-muted/20 text-muted-foreground">
            Loading board…
          </div>
        }
      >
        <BejeweledGame />
      </Suspense>
    </div>
  );
}
