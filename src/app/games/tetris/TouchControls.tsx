'use client';

import { memo, useCallback } from 'react';
import type { PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import type { TetrisInputActions } from './useInput';

type TouchControlsProps = {
  actions: TetrisInputActions;
  disabled?: boolean;
  className?: string;
};

const BUTTON_BASE =
  'flex-1 rounded-md border border-border/60 bg-muted/30 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground shadow-sm transition active:scale-[0.97]';

export const TouchControls = memo(function TouchControls({
  actions,
  disabled = false,
  className,
}: TouchControlsProps) {
  const handleTap = useCallback(
    (callback: () => void) => (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
        return;
      }
      event.preventDefault();
      if (disabled) return;
      callback();
    },
    [disabled],
  );

  const handleSoftDropStart = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
        return;
      }
      event.preventDefault();
      if (disabled) return;
      actions.onSoftDrop(true);
    },
    [actions, disabled],
  );

  const handleSoftDropEnd = useCallback(
    (event: PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== 'touch' && event.pointerType !== 'pen') {
        return;
      }
      event.preventDefault();
      actions.onSoftDrop(false);
    },
    [actions],
  );

  return (
    <div
      className={cn(
        'mt-2 flex w-full flex-col gap-3 rounded-lg border border-border/60 bg-background/80 p-3 backdrop-blur md:hidden',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(BUTTON_BASE, 'basis-1/3')}
          onPointerDown={handleTap(actions.onLeft)}
        >
          Left
        </button>
        <button
          type="button"
          className={cn(BUTTON_BASE, 'basis-1/3')}
          onPointerDown={handleSoftDropStart}
          onPointerUp={handleSoftDropEnd}
          onPointerCancel={handleSoftDropEnd}
          onPointerLeave={handleSoftDropEnd}
        >
          Drop
        </button>
        <button
          type="button"
          className={cn(BUTTON_BASE, 'basis-1/3')}
          onPointerDown={handleTap(actions.onRight)}
        >
          Right
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={cn(BUTTON_BASE, 'basis-1/2')}
          onPointerDown={handleTap(actions.onRotateCW)}
        >
          Rotate
        </button>
        <button
          type="button"
          className={cn(BUTTON_BASE, 'basis-1/2')}
          onPointerDown={handleTap(actions.onHardDrop)}
        >
          Slam
        </button>
      </div>
      <button
        type="button"
        className={cn(BUTTON_BASE, 'w-full')}
        onPointerDown={handleTap(actions.onPauseToggle)}
      >
        Pause
      </button>
    </div>
  );
});
