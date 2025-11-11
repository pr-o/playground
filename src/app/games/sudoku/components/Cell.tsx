'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';

type CellProps = {
  row: number;
  col: number;
  value: number | null;
  notes?: number[];
  isGiven?: boolean;
  isSelected?: boolean;
  isConflict?: boolean;
  onSelect?: (row: number, col: number) => void;
};

const MotionButton = motion.button;

const baseClasses =
  'relative aspect-square w-full border border-border/40 bg-slate-950/60 text-center text-xl font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

const selectedClasses = 'bg-primary/15 text-primary shadow-inner shadow-primary/30';
const conflictClasses = 'bg-destructive/20 text-destructive';
const givenClasses = 'text-muted-foreground';

export const Cell = memo(function Cell({
  row,
  col,
  value,
  notes,
  isGiven,
  isSelected,
  isConflict,
  onSelect,
}: CellProps) {
  const content =
    value ??
    (notes?.length ? (
      <div className="grid grid-cols-3 text-[10px] font-normal text-muted-foreground">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} className="leading-3">
            {notes?.includes(index + 1) ? index + 1 : ''}
          </span>
        ))}
      </div>
    ) : null);

  return (
    <MotionButton
      type="button"
      className={[
        baseClasses,
        isSelected ? selectedClasses : '',
        isConflict ? conflictClasses : '',
        isGiven ? givenClasses : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect?.(row, col)}
      whileTap={{ scale: 0.95 }}
      data-testid={`mini-sudoku-cell-${row}-${col}`}
    >
      {content}
    </MotionButton>
  );
});
