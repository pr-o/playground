'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Board } from './components/Board';
import { CompletionOverlay } from './components/CompletionOverlay';
import { NumberPad } from './components/NumberPad';
import { useMiniSudoku } from './useMiniSudoku';

const DIGIT_REGEX = /^[1-6]$/;
const TIMER_STORAGE_KEY = 'mini-sudoku-timer-v1';

const readStoredElapsed = (puzzleId: number): number => {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = window.localStorage.getItem(TIMER_STORAGE_KEY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (data?.puzzleId !== puzzleId) return 0;
    return typeof data.elapsedMs === 'number' ? data.elapsedMs : 0;
  } catch {
    return 0;
  }
};

const formatElapsed = (ms: number): string => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
};

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
  } = useMiniSudoku();
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number | null>(null);

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

  useEffect(() => {
    let prevTime: number | null = null;

    if (status !== 'playing') {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      prevTime = null;
      return;
    }

    const tick = (timestamp: number) => {
      if (prevTime == null) {
        prevTime = timestamp;
      }
      const delta = timestamp - prevTime;
      prevTime = timestamp;
      setElapsedMs((current) => current + delta);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [status]);

  useEffect(() => {
    setElapsedMs((current) => {
      const stored = readStoredElapsed(puzzleId);
      return stored === current ? current : stored;
    });
  }, [puzzleId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(
        TIMER_STORAGE_KEY,
        JSON.stringify({ puzzleId, elapsedMs }),
      );
    } catch {
      // ignore timer persistence failures
    }
  }, [elapsedMs, puzzleId]);

  const puzzleLabel = useMemo(
    () => `Puzzle #${String(puzzleId).padStart(3, '0')}`,
    [puzzleId],
  );
  const timerLabel = formatElapsed(elapsedMs);

  const handleRestart = () => {
    setElapsedMs(0);
    restartPuzzle();
  };

  const handleNextPuzzle = () => {
    setElapsedMs(0);
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
                <span className="text-lg font-semibold text-primary">{hintsUsed}</span>
              </div>
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
