'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { BOARD_SIZE } from '@/lib/game-2048';
import { useGame2048Store } from '@/store/game-2048';
import { useGamePersistence } from '@/hooks/game-2048/useGamePersistence';

const ScoreCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex w-full min-w-[120px] flex-col rounded-2xl bg-gradient-to-br from-muted to-muted/60 px-4 py-3 text-left shadow-sm">
    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
      {label}
    </span>
    <span className="mt-1 text-2xl font-semibold text-foreground tabular-nums">
      {value}
    </span>
  </div>
);

const ControlButton = ({
  onClick,
  children,
  disabled,
  variant = 'default',
}: {
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'ghost';
}) => {
  const base =
    'min-w-[120px] rounded-full px-5 py-2 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
  const styles =
    variant === 'ghost'
      ? 'border border-border bg-background/40 text-foreground hover:bg-background/70 disabled:text-muted-foreground'
      : 'bg-foreground text-background hover:bg-foreground/90 disabled:bg-muted disabled:text-muted-foreground';
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${styles}`}
    >
      {children}
    </button>
  );
};

export function Game2048() {
  useGamePersistence();

  const grid = useGame2048Store((state) => state.grid);
  const score = useGame2048Store((state) => state.score);
  const bestScore = useGame2048Store((state) => state.bestScore);
  const moveCount = useGame2048Store((state) => state.moveCount);
  const hasMoves = useGame2048Store((state) => state.hasMoves);
  const hasWon = useGame2048Store((state) => state.hasWon);
  const isOver = useGame2048Store((state) => state.isOver);
  const historyLength = useGame2048Store((state) => state.history.length);
  const newGame = useGame2048Store((state) => state.newGame);
  const undo = useGame2048Store((state) => state.undo);
  const isHydrated = useGame2048Store((state) => state.isHydrated);

  const hasTiles = useMemo(
    () => grid.some((row) => row.some((cell) => cell !== null)),
    [grid],
  );

  useEffect(() => {
    if (isHydrated && !hasTiles) {
      newGame();
    }
  }, [isHydrated, hasTiles, newGame]);

  const statusMessage = useMemo(() => {
    if (isOver && !hasWon) {
      return "No moves left — tap 'New Game' to try again.";
    }
    if (hasWon && !isOver) {
      return 'You reached 2048! Keep going for a higher score.';
    }
    if (!hasMoves && !isOver) {
      return 'Moves unavailable. Try a different direction.';
    }
    return 'Merge tiles with arrow keys, WASD, or touch swipes (coming soon).';
  }, [hasWon, isOver, hasMoves]);

  const canUndo = historyLength > 0;
  const overlayState = {
    hasWon,
    isOver,
    canContinue: hasWon && !isOver,
  };

  return (
    <section className="flex w-full max-w-5xl flex-col items-stretch gap-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Merge the tiles
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{statusMessage}</p>
          </div>
          <div className="grid w-full gap-3 sm:grid-cols-3">
            <ScoreCard label="Score" value={score} />
            <ScoreCard label="Best" value={bestScore} />
            <ScoreCard label="Moves" value={moveCount} />
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-3 self-start sm:self-auto">
          <ControlButton onClick={() => newGame()}>New Game</ControlButton>
          <ControlButton onClick={() => undo()} disabled={!canUndo} variant="ghost">
            Undo
          </ControlButton>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="relative mx-auto w-full max-w-xl">
          <div className="relative aspect-square w-full rounded-[32px] bg-gradient-to-br from-muted/80 via-muted to-muted/60 p-5 shadow-xl">
            <div
              className="grid h-full w-full gap-3"
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((cell, columnIndex) => (
                  <div
                    key={`${rowIndex}-${columnIndex}`}
                    className="flex h-full w-full items-center justify-center rounded-2xl bg-background/70 text-lg font-semibold text-foreground/70 shadow-inner"
                  >
                    {cell?.value ?? ''}
                  </div>
                )),
              )}
            </div>

            {overlayState.isOver && (
              <div className="absolute inset-5 z-10 flex flex-col items-center justify-center gap-4 rounded-[28px] bg-background/90 text-center shadow-xl">
                <h3 className="text-3xl font-bold">
                  {overlayState.hasWon ? 'You did it!' : 'Game over'}
                </h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {overlayState.hasWon
                    ? 'Take a victory lap or start fresh to chase an even higher score.'
                    : 'No valid moves remain. Start a new game to keep the streak alive.'}
                </p>
                <ControlButton onClick={() => newGame()}>Start Over</ControlButton>
              </div>
            )}
          </div>
        </div>

        <aside className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur">
          <h3 className="text-lg font-semibold text-foreground">How to play</h3>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">1.</strong> Combine matching tiles to
              double their value.
            </li>
            <li>
              <strong className="text-foreground">2.</strong> Every move spawns a new
              tile— plan ahead to avoid filling the board.
            </li>
            <li>
              <strong className="text-foreground">3.</strong> Reach the 2048 tile to win,
              then keep going to push your best score.
            </li>
          </ol>
          <div className="rounded-2xl bg-muted/30 p-4 text-xs text-muted-foreground">
            <p className="font-semibold uppercase tracking-[0.3em] text-muted-foreground/80">
              Coming soon
            </p>
            <ul className="mt-2 space-y-1">
              <li>• Animated tiles with smooth slide & merge transitions</li>
              <li>• Keyboard & touch input with move preview</li>
              <li>• Achievement shelf and celebratory toasts</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}
