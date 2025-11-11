'use client';

import { useEffect } from 'react';
import { Board } from './components/Board';
import { NumberPad } from './components/NumberPad';
import { useMiniSudoku } from './useMiniSudoku';

const DIGIT_REGEX = /^[1-6]$/;

export function MiniSudokuGame() {
  const {
    board,
    selected,
    notesMode,
    conflicts,
    mistakeTokens,
    selectCell,
    moveSelection,
    toggleNotes,
    inputDigit,
    erase,
    undo,
    redo,
    canUndo,
    canRedo,
    requestHint,
  } = useMiniSudoku();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const tagName = (event.target as HTMLElement | null)?.tagName;
      if (tagName && ['INPUT', 'TEXTAREA'].includes(tagName)) {
        return;
      }

      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        if (event.key === 'ArrowUp') moveSelection(-1, 0);
        if (event.key === 'ArrowDown') moveSelection(1, 0);
        if (event.key === 'ArrowLeft') moveSelection(0, -1);
        if (event.key === 'ArrowRight') moveSelection(0, 1);
        return;
      }

      if (DIGIT_REGEX.test(event.key)) {
        event.preventDefault();
        inputDigit(Number(event.key));
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        erase();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        redo();
        return;
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        toggleNotes();
        return;
      }

      if (event.key.toLowerCase() === 'h') {
        event.preventDefault();
        requestHint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [erase, inputDigit, moveSelection, redo, requestHint, toggleNotes, undo]);

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
          <Board
            grid={board}
            selected={selected}
            onCellSelect={selectCell}
            conflicts={conflicts}
            mistakeTokens={mistakeTokens}
          />
        </div>
        <aside className="flex flex-1 flex-col gap-4 rounded-lg border border-dashed border-border/50 bg-muted/20 p-4 text-muted-foreground">
          <p className="text-sm text-foreground">
            Click or use arrow keys to select a cell. Input 1-6 to solve, toggle notes
            with the button or press <kbd>N</kbd>, erase with Backspace/Delete, undo with
            ⌘/Ctrl+Z, redo with ⌘/Ctrl+Shift+Z, and request a hint with <kbd>H</kbd>.
          </p>
          <NumberPad
            digits={[1, 2, 3, 4, 5, 6]}
            onInput={inputDigit}
            onErase={erase}
            notesEnabled={notesMode}
            onToggleNotes={toggleNotes}
            onHint={requestHint}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
          />
        </aside>
      </div>
    </section>
  );
}
