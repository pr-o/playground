'use client';

import { memo, useMemo } from 'react';
import type { TetrominoId } from '@/lib/tetris';
import { cn } from '@/lib/utils';
import { TetrominoPreview } from './TetrominoPreview';

type NextQueueProps = {
  queue: TetrominoId[];
  slots?: number;
  isReady?: boolean;
  className?: string;
};

export const NextQueue = memo(function NextQueue({
  queue,
  slots = 3,
  isReady = true,
  className,
}: NextQueueProps) {
  const items = useMemo(() => {
    return Array.from({ length: slots }, (_, index) =>
      isReady ? (queue[index] ?? null) : null,
    );
  }, [isReady, queue, slots]);

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border gap-3 p-4 border-border bg-muted/20',
        className,
      )}
    >
      <header className="flex items-center justify-between text-sm uppercase tracking-wide text-muted-foreground">
        <span className="font-semibold">Next</span>
        <span className="text-xs text-muted-foreground/70">Queue</span>
      </header>
      <div className="space-y-3">
        {items.map((id, index) => (
          <TetrominoPreview
            key={id ? `${id}-${index}` : `preview-${index}`}
            id={id}
            className="bg-background/80"
          />
        ))}
      </div>
    </div>
  );
});
