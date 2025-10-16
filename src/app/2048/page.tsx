import { Suspense } from 'react';
import { Game2048 } from '@/components/game-2048/Game2048';

export default function Game2048Page() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center gap-10 px-4 py-12 sm:py-16">
      <header className="flex flex-col items-center gap-2 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-muted-foreground">
          Classic Arcade
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          2048 Remix
        </h1>
        <p className="max-w-xl text-balance text-sm text-muted-foreground sm:text-base">
          Swipe, merge, and chase the 2048 tile. Tiles persist locally so you can pause
          and resume whenever inspiration strikes.
        </p>
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
    </div>
  );
}
