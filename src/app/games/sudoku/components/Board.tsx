'use client';

import { memo, useMemo } from 'react';
import type { ConflictFlags } from '../useMiniSudoku';
import { Cell } from './Cell';

type BoardProps = {
  grid: Array<Array<{ value: number | null; notes?: number[]; given?: boolean }>>;
  onCellSelect?: (row: number, col: number) => void;
  selected?: { row: number; col: number } | null;
  conflicts?: Record<string, ConflictFlags>;
  mistakeTokens?: Record<string, number>;
};

const GRID_SIZE = 6;
const REGION_HEIGHT = 2;
const REGION_WIDTH = 3;

const getRegionClasses = (row: number, col: number) => {
  const classes = ['relative', 'border', 'border-border/40'];
  if (row % REGION_HEIGHT === 0) classes.push('border-t-2');
  if (col % REGION_WIDTH === 0) classes.push('border-l-2');
  if ((row + 1) % REGION_HEIGHT === 0) classes.push('border-b-2');
  if ((col + 1) % REGION_WIDTH === 0) classes.push('border-r-2');
  return classes;
};

const getRegionIndex = (row: number, col: number) => {
  const regionsPerRow = GRID_SIZE / REGION_WIDTH;
  const regionRow = Math.floor(row / REGION_HEIGHT);
  const regionCol = Math.floor(col / REGION_WIDTH);
  return regionRow * regionsPerRow + regionCol;
};

export const Board = memo(function Board({
  grid,
  onCellSelect,
  selected,
  conflicts,
  mistakeTokens,
}: BoardProps) {
  const { rowConflicts, colConflicts, regionConflicts } = useMemo(() => {
    const rowFlags = Array(GRID_SIZE).fill(false);
    const colFlags = Array(GRID_SIZE).fill(false);
    const regionFlags = Array(
      (GRID_SIZE / REGION_WIDTH) * (GRID_SIZE / REGION_HEIGHT),
    ).fill(false);

    Object.entries(conflicts ?? {}).forEach(([key, flags]) => {
      if (!flags) return;
      const [rowStr, colStr] = key.split('-');
      const row = Number(rowStr);
      const col = Number(colStr);
      if (Number.isNaN(row) || Number.isNaN(col)) return;
      if (flags.row) rowFlags[row] = true;
      if (flags.col) colFlags[col] = true;
      if (flags.region) {
        const regionIndex = getRegionIndex(row, col);
        regionFlags[regionIndex] = true;
      }
    });

    return {
      rowConflicts: rowFlags,
      colConflicts: colFlags,
      regionConflicts: regionFlags,
    };
  }, [conflicts]);

  const buildWrapperClasses = (row: number, col: number) => {
    const classes = getRegionClasses(row, col);

    if (rowConflicts[row]) {
      classes.push('border-t-destructive/70', 'border-b-destructive/70');
    }
    if (colConflicts[col]) {
      classes.push('border-l-destructive/70', 'border-r-destructive/70');
    }

    const regionIndex = getRegionIndex(row, col);
    if (regionConflicts[regionIndex]) {
      if (row % REGION_HEIGHT === 0) classes.push('border-t-destructive/90');
      if ((row + 1) % REGION_HEIGHT === 0) classes.push('border-b-destructive/90');
      if (col % REGION_WIDTH === 0) classes.push('border-l-destructive/90');
      if ((col + 1) % REGION_WIDTH === 0) classes.push('border-r-destructive/90');
    }

    return classes.join(' ');
  };

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
          const cellConflicts = conflicts?.[key];
          const wrapperClasses = buildWrapperClasses(row, col);
          return (
            <div key={key} className={wrapperClasses} role="gridcell">
              <Cell
                row={row}
                col={col}
                value={cell.value}
                notes={cell.notes}
                isGiven={cell.given}
                isSelected={selected?.row === row && selected?.col === col}
                conflicts={cellConflicts}
                mistakeToken={mistakeTokens?.[key]}
                onSelect={onCellSelect}
              />
            </div>
          );
        }),
      )}
    </div>
  );
});
