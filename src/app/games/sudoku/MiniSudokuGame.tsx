'use client';

import { useMemo } from 'react';
import { DIFFICULTY_CONFIGS, type Difficulty } from '@/lib/sudoku-mini';
import { Board } from './components/Board';
import { CompletionOverlay } from './components/CompletionOverlay';
import { NumberPad } from './components/NumberPad';
import { useSelectionNavigation } from './hooks/useSelectionNavigation';
import { useSudokuTimer } from './hooks/useSudokuTimer';
import { useHints } from './hooks/useHints';
import { useMiniSudoku } from './useMiniSudoku';

export function MiniSudokuGame() {
  const {
    board,
    selected,
    notesMode,
    conflicts,
    mistakeTokens,
    hintsUsed,
    mistakeCount,
    status,
    puzzleId,
    difficulty,
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
    restartPuzzle,
    nextPuzzle,
    setDifficulty,
  } = useMiniSudoku();
  const {
    remaining: remainingHints,
    maxHints,
    hasHints,
  } = useHints(difficulty, hintsUsed);
  const {
    elapsedMs,
    formatted: timerLabel,
    reset: resetTimer,
  } = useSudokuTimer({
    puzzleId,
    status,
  });
  useSelectionNavigation({
    disabled: status === 'loading' || status === 'error',
    onMove: moveSelection,
    onInput: inputDigit,
    onErase: erase,
    onToggleNotes: toggleNotes,
    onUndo: (redoRequested) => {
      if (redoRequested) {
        redo();
      } else {
        undo();
      }
    },
    onRedo: redo,
    onHint: requestHint,
  });

  const puzzleLabel = useMemo(
    () => `Puzzle #${String(puzzleId).padStart(3, '0')}`,
    [puzzleId],
  );
  const difficultyOptions = Object.values(DIFFICULTY_CONFIGS);
  const interactionsDisabled = status === 'loading' || status === 'error';

  const handleRestart = () => {
    resetTimer();
    restartPuzzle();
  };

  const handleNextPuzzle = () => {
    resetTimer();
    nextPuzzle();
  };

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-card/80 p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-wide text-muted-foreground">
                Mini Sudoku
              </p>
              <h2 className="text-2xl font-semibold">{puzzleLabel}</h2>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex flex-col text-left">
                <span className="text-xs uppercase tracking-wide">Timer</span>
                <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
                  {timerLabel}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide">Mistakes</span>
                <span className="text-lg font-semibold text-destructive">
                  {mistakeCount}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wide">Hints</span>
                <span className="text-lg font-semibold text-primary">
                  {remainingHints}/{maxHints}
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs uppercase tracking-wide">Difficulty</span>
                <select
                  className="w-32 rounded-md border border-border bg-background/80 px-2 py-1 text-sm font-semibold text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value as Difficulty)}
                  disabled={status === 'loading'}
                >
                  {difficultyOptions.map((config) => (
                    <option key={config.id} value={config.id}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {status === 'error' && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Failed to load puzzle.{' '}
              <button
                type="button"
                className="font-semibold underline underline-offset-2 hover:text-destructive/80"
                onClick={nextPuzzle}
              >
                Try again
              </button>
            </div>
          )}
          <div className="relative">
            {(status === 'loading' || status === 'error') && (
              <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-card/80 text-sm text-muted-foreground backdrop-blur">
                {status === 'loading' ? 'Generating puzzle…' : 'Unavailable'}
              </div>
            )}
            <Board
              grid={board}
              selected={selected}
              onCellSelect={interactionsDisabled ? undefined : selectCell}
              conflicts={conflicts}
              mistakeTokens={mistakeTokens}
            />
          </div>
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
            disabled={interactionsDisabled}
            hintDisabled={interactionsDisabled || !hasHints}
          />
        </aside>
      </div>
      <CompletionOverlay
        open={status === 'completed'}
        puzzleLabel={puzzleLabel}
        elapsedMs={elapsedMs}
        mistakes={mistakeCount}
        hintsUsed={hintsUsed}
        onRestart={handleRestart}
        onNext={handleNextPuzzle}
      />
    </section>
  );
}
