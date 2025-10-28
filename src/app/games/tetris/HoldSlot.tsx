'use client';

import { memo } from 'react';
import type { TetrominoId } from '@/lib/tetris';
import { cn } from '@/lib/utils';
import { TetrominoPreview } from './TetrominoPreview';

type HoldSlotProps = {
  piece: TetrominoId | null;
  canHold: boolean;
  className?: string;
};

export const HoldSlot = memo(function HoldSlot({
  piece,
  canHold,
  className,
}: HoldSlotProps) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border gap-3 p-4 border-border bg-muted/20',
        className,
      )}
    >
      <header className="flex items-center justify-between text-sm uppercase tracking-wide text-muted-foreground">
        <span className="font-semibold">Hold</span>
        <span className="text-xs text-muted-foreground/70">
          {canHold ? 'Ready' : 'Locked'}
        </span>
      </header>
      <TetrominoPreview id={piece} />
      <p className="text-xs text-muted-foreground">
        Press <span className="font-semibold text-foreground">Shift</span> to swap.
      </p>
    </div>
  );
});
