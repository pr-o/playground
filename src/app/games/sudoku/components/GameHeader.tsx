'use client';

import { RotateCcw } from 'lucide-react';
import type { Difficulty } from '@/lib/sudoku-mini';
import { DifficultyPicker } from './DifficultyPicker';
import { NextPuzzleButton } from './NextPuzzleButton';

type GameHeaderProps = {
  puzzleLabel: string;
  timerLabel: string;
  elapsedLabel?: string;
  mistakes: number;
  hintsUsed: number;
  maxHints: number;
  remainingHints: number;
  difficulty: Difficulty;
  options: { id: Difficulty; label: string }[];
  onDifficultyChange: (difficulty: Difficulty) => void;
  onRestart: () => void;
  onNext: () => void;
  status: string;
};

export function GameHeader({
  puzzleLabel,
  timerLabel,
  elapsedLabel,
  mistakes,
  hintsUsed,
  maxHints,
  remainingHints,
  difficulty,
  options,
  onDifficultyChange,
  onRestart,
  onNext,
  status,
}: GameHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div className="flex-1">
        <div className="flex flex-col gap-1">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Mini Sudoku
          </p>
          <h2 className="text-2xl font-semibold text-foreground">{puzzleLabel}</h2>
        </div>
        <p className="mt-1 max-w-md text-xs text-muted-foreground">
          Tap or click to select a cell, use 1–6 to fill digits, toggle notes with{' '}
          <kbd>N</kbd>, erase with Backspace/Delete, and undo/redo with ⌘/Ctrl+Z or
          ⌘/Ctrl+Shift+Z.
        </p>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
        <div className="flex flex-col text-left">
          <span className="text-xs uppercase tracking-wide">Timer</span>
          <span className="font-mono text-lg font-semibold tabular-nums text-foreground">
            {timerLabel}
          </span>
          {elapsedLabel ? (
            <span className="text-xs text-muted-foreground">{elapsedLabel}</span>
          ) : null}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs uppercase tracking-wide">Mistakes</span>
          <span className="text-lg font-semibold text-destructive">{mistakes}</span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs uppercase tracking-wide">Hints</span>
          <span className="text-lg font-semibold text-primary">
            {hintsUsed}/{maxHints}
          </span>
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs uppercase tracking-wide">Hints Remaining</span>
          <span className="text-lg font-semibold text-primary">{remainingHints}</span>
        </div>
        <DifficultyPicker
          value={difficulty}
          options={options}
          onChange={onDifficultyChange}
          disabled={status === 'loading'}
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onRestart}
            disabled={status === 'loading'}
          >
            <RotateCcw className="h-4 w-4" />
            Restart
          </button>
          <NextPuzzleButton onNext={onNext} disabled={status === 'loading'} />
        </div>
      </div>
    </div>
  );
}
