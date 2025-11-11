'use client';

import { memo } from 'react';
import { Cell } from './Cell';

type BoardProps = {
  grid: Array<Array<{ value: number | null; notes?: number[]; given?: boolean }>>;
  onCellSelect?: (row: number, col: number) => void;
  selected?: { row: number; col: number } | null;
  conflicts?: Record<string, boolean>;
};

const GRID_SIZE = 6;
const REGION_HEIGHT = 2;
const REGION_WIDTH = 3;

const getRegionClasses = (row: number, col: number) => {
  const classes = ['border', 'border-border/40'];
  if (row % REGION_HEIGHT === 0) classes.push('border-t-2');
  if (col % REGION_WIDTH === 0) classes.push('border-l-2');
  if ((row + 1) % REGION_HEIGHT === 0) classes.push('border-b-2');
  if ((col + 1) % REGION_WIDTH === 0) classes.push('border-r-2');
  return classes.join(' ');
};

export const Board = memo(function Board({
  grid,
  onCellSelect,
  selected,
  conflicts,
}: BoardProps) {
  return (
    <div
      className="grid w-full max-w-lg grid-cols-6 gap-[1px] rounded-xl border border-border bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-2"
      role="grid"
      aria-label="Mini Sudoku board"
    >
      {Array.from({ length: GRID_SIZE }).map((_, row) =>
        Array.from({ length: GRID_SIZE }).map((__, col) => {
          const cell = grid[row]?.[col] ?? { value: null, notes: [] };
          const key = `${row}-${col}`;
          return (
            <div key={key} className={getRegionClasses(row, col)} role="gridcell">
              <Cell
                row={row}
                col={col}
                value={cell.value}
                notes={cell.notes}
                isGiven={cell.given}
                isSelected={selected?.row === row && selected?.col === col}
                isConflict={Boolean(conflicts?.[key])}
                onSelect={onCellSelect}
              />
            </div>
          );
        }),
      )}
    </div>
  );
});
