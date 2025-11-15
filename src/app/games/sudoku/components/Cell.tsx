'use client';

import { memo, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import type { ConflictFlags } from '../useMiniSudoku';

type CellProps = {
  row: number;
  col: number;
  value: number | null;
  notes?: number[];
  isGiven?: boolean;
  isSelected?: boolean;
  conflicts?: ConflictFlags;
  mistakeToken?: number;
  onSelect?: (row: number, col: number) => void;
};

const MotionButton = motion.button;

const baseClasses =
  'relative aspect-square w-full border border-border/40 bg-slate-950/60 text-center text-xl font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

const selectedClasses = 'bg-primary/15 text-primary shadow-inner shadow-primary/30';
const givenClasses = 'text-muted-foreground';

export const Cell = memo(function Cell({
  row,
  col,
  value,
  notes,
  isGiven,
  isSelected,
  conflicts,
  mistakeToken,
  onSelect,
}: CellProps) {
  const controls = useAnimation();
  const hasConflict = Boolean(
    conflicts && (conflicts.row || conflicts.col || conflicts.region),
  );

  useEffect(() => {
    if (mistakeToken == null) return;
    controls.start({
      x: [0, -4, 4, -2, 2, 0],
      transition: { duration: 0.45, ease: 'easeInOut' },
    });
  }, [controls, mistakeToken]);

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
        hasConflict ? 'border-transparent text-destructive' : '',
        !hasConflict && isGiven ? givenClasses : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect?.(row, col)}
      whileTap={{ scale: 0.95 }}
      animate={controls}
      initial={false}
      aria-invalid={hasConflict}
      data-testid={`mini-sudoku-cell-${row}-${col}`}
    >
      {content}
    </MotionButton>
  );
});
