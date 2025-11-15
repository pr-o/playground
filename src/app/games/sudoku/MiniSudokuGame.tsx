'use client';

import { useMemo } from 'react';
import { DIFFICULTY_CONFIGS } from '@/lib/sudoku-mini';
import { toast } from 'sonner';
import { Board } from './components/Board';
import { CompletionOverlay } from './components/CompletionOverlay';
import { NumberPad } from './components/NumberPad';
import { GameHeader } from './components/GameHeader';
import { NotesToggle } from './components/NotesToggle';
import { HintButton } from './components/HintButton';
import { useSelectionNavigation } from './hooks/useSelectionNavigation';
import { useSudokuTimer } from './hooks/useSudokuTimer';
import { useHints } from './hooks/useHints';
import { useMiniSudoku } from './useMiniSudoku';

const formatElapsedDetailed = (ms: number) => {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
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

  const handleHint = () => {
    if (!hasHints) {
      toast.warning('No hints remaining in this difficulty.');
      return;
    }
    requestHint();
  };

  return (
    <section className="flex flex-col gap-6 rounded-xl border border-border bg-card/80 p-6 shadow-sm">
      <GameHeader
        puzzleLabel={puzzleLabel}
        timerLabel={timerLabel}
        mistakes={mistakeCount}
        hintsUsed={hintsUsed}
        maxHints={maxHints}
        remainingHints={remainingHints}
        elapsedLabel={formatElapsedDetailed(elapsedMs)}
        difficulty={difficulty}
        options={difficultyOptions}
        onDifficultyChange={setDifficulty}
        onRestart={handleRestart}
        onNext={handleNextPuzzle}
        status={status}
      />
      <div className="flex flex-col gap-6 xl:flex-row">
        <div className="flex flex-1 flex-col gap-4">
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
        <div className="flex w-full flex-col gap-4 xl:w-80">
          <div className="flex flex-wrap justify-center gap-3 rounded-xl border border-border bg-card/70 p-3">
            <NotesToggle
              enabled={notesMode}
              onToggle={toggleNotes}
              disabled={interactionsDisabled}
            />
            <HintButton
              remaining={remainingHints}
              max={maxHints}
              onHint={handleHint}
              disabled={interactionsDisabled}
            />
          </div>
          <NumberPad
            digits={[1, 2, 3, 4, 5, 6]}
            onInput={inputDigit}
            onErase={erase}
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo}
            canRedo={canRedo}
            disabled={interactionsDisabled}
          />
        </div>
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
