'use client';

import { useMemo, useState } from 'react';
import { Board } from './components/Board';

const mockGrid = Array.from({ length: 6 }, (_, row) =>
  Array.from({ length: 6 }, (_, col) => ({
    value: row === col ? ((row + 1) as number) : null,
    notes: row !== col ? [1, 2, 3] : [],
    given: row === col,
  })),
);

export function MiniSudokuGame() {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const grid = useMemo(() => mockGrid, []);

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-card/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Mini Sudoku
              </p>
              <h2 className="text-2xl font-semibold">Puzzle #000</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Difficulty</span>
              <span className="rounded-full border border-border/60 px-3 py-1 text-foreground">
                Beginner
              </span>
            </div>
          </div>
          <Board grid={grid} selected={selected} onCellSelect={setSelected} />
        </div>
        <aside className="flex flex-1 flex-col gap-4 rounded-lg border border-dashed border-border/50 bg-muted/20 p-4 text-muted-foreground">
          <p className="text-sm">
            Number pad, hints, and stats will live here. For now, this placeholder shows
            the responsive panel layout.
          </p>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <button
                key={index}
                type="button"
                className="flex-1 min-w-[60px] rounded-md border border-border bg-background px-3 py-2 text-center text-sm font-semibold text-foreground shadow-sm"
              >
                {index + 1}
              </button>
            ))}
            <button
              type="button"
              className="flex-1 min-w-[60px] rounded-md border border-border bg-background px-3 py-2 text-center text-sm font-semibold text-foreground shadow-sm"
            >
              Erase
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
