'use client';

import { useCallback, useMemo, useState } from 'react';
import { Board } from './components/Board';
import { NumberPad } from './components/NumberPad';

const mockGrid = Array.from({ length: 6 }, (_, row) =>
  Array.from({ length: 6 }, (_, col) => ({
    value: row === col ? ((row + 1) as number) : null,
    notes: row !== col ? [1, 2, 3] : [],
    given: row === col,
  })),
);

export function MiniSudokuGame() {
  const [selected, setSelected] = useState<{ row: number; col: number } | null>(null);
  const [notesEnabled, setNotesEnabled] = useState(false);
  const grid = useMemo(() => mockGrid, []);

  const handleInput = useCallback(
    (value: number) => {
      console.log('mini sudoku input placeholder', value, selected);
    },
    [selected],
  );

  const handleErase = useCallback(() => {
    console.log('mini sudoku erase placeholder', selected);
  }, [selected]);

  const handleToggleNotes = useCallback(() => {
    setNotesEnabled((prev) => !prev);
  }, []);

  const handleStubAction = useCallback((action: string) => {
    console.log(`mini sudoku stub action: ${action}`);
  }, []);

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
            Interact with the placeholder keypad below. Game actions are logged in the
            console until state logic lands.
          </p>
          <NumberPad
            digits={[1, 2, 3, 4, 5, 6]}
            onInput={handleInput}
            onErase={handleErase}
            notesEnabled={notesEnabled}
            onToggleNotes={handleToggleNotes}
            onHint={() => handleStubAction('hint')}
            onUndo={() => handleStubAction('undo')}
            onRedo={() => handleStubAction('redo')}
          />
        </aside>
      </div>
    </section>
  );
}
