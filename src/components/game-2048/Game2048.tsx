'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AchievementShelf } from '@/components/game-2048/AchievementShelf';
import { BOARD_SIZE } from '@/lib/game-2048';
import type { MoveDirection } from '@/lib/game-2048';
import { useGame2048Store } from '@/store/game-2048';
import { useGamePersistence } from '@/hooks/game-2048/useGamePersistence';
import { useGameInput } from '@/hooks/game-2048/useGameInput';

const integerFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const SPAWN_DELAY_MS = 160;

const ScoreCard = ({ label, value }: { label: string; value: number }) => (
  <div className="flex w-full min-w-[120px] flex-col rounded-2xl bg-gradient-to-br from-muted to-muted/60 px-4 py-3 text-left shadow-sm">
    <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
      {label}
    </span>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -8, opacity: 0 }}
        transition={{ duration: 0.12 }}
        className="mt-1 text-2xl font-semibold text-foreground tabular-nums"
      >
        {integerFormatter.format(value)}
      </motion.span>
    </AnimatePresence>
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

const directionLabels: Record<MoveDirection, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

function DirectionPad({
  onMove,
  disabled,
}: {
  onMove: (direction: MoveDirection) => void;
  disabled: boolean;
}) {
  const padButtonClasses =
    'flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-lg font-semibold text-foreground transition hover:bg-card/80 disabled:cursor-not-allowed disabled:text-muted-foreground';

  const renderButton = (direction: MoveDirection) => (
    <button
      key={direction}
      type="button"
      className={padButtonClasses}
      onClick={() => onMove(direction)}
      disabled={disabled}
      aria-label={`Move ${direction}`}
    >
      {directionLabels[direction]}
    </button>
  );

  return (
    <div className="mt-6 flex justify-center">
      <div className="grid grid-cols-3 gap-2">
        <span aria-hidden />
        {renderButton('up')}
        <span aria-hidden />
        {renderButton('left')}
        <span aria-hidden />
        {renderButton('right')}
        <span aria-hidden />
        {renderButton('down')}
        <span aria-hidden />
      </div>
    </div>
  );
}

type TileView = {
  id: string;
  value: number;
  row: number;
  column: number;
  mergedFrom?: [string, string] | null;
};

const getTileClasses = (value: number) => {
  if (value <= 2) return 'bg-amber-100 text-amber-900';
  if (value <= 4) return 'bg-amber-200 text-amber-900';
  if (value <= 8) return 'bg-orange-300 text-orange-900';
  if (value <= 16) return 'bg-orange-400 text-orange-950';
  if (value <= 32) return 'bg-orange-500 text-orange-50';
  if (value <= 64) return 'bg-orange-600 text-orange-50';
  if (value <= 128) return 'bg-amber-500 text-amber-950';
  if (value <= 256) return 'bg-yellow-500 text-yellow-950';
  if (value <= 512) return 'bg-lime-500 text-lime-900';
  if (value <= 1024) return 'bg-emerald-500 text-emerald-50';
  if (value <= 2048) return 'bg-teal-500 text-teal-50';
  if (value <= 4096) return 'bg-cyan-500 text-cyan-50';
  return 'bg-indigo-500 text-white';
};

const getTileFontSize = (value: number) => {
  if (value >= 8192) return 'text-xl';
  if (value >= 4096) return 'text-2xl';
  if (value >= 1024) return 'text-3xl';
  return 'text-4xl';
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
  const move = useGame2048Store((state) => state.move);
  const achievements = useGame2048Store((state) => state.achievements);
  const resetAchievements = useGame2048Store((state) => state.resetAchievements);

  const hasTiles = useMemo(
    () => grid.some((row) => row.some((cell) => cell !== null)),
    [grid],
  );

  const previousTileIdsRef = useRef<Set<string>>(new Set());

  const tiles: TileView[] = useMemo(() => {
    const items: TileView[] = [];
    grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (!cell) return;
        items.push({
          id: cell.id,
          value: cell.value,
          row: rowIndex,
          column: columnIndex,
          mergedFrom: cell.mergedFrom ?? null,
        });
      });
    });
    return items;
  }, [grid]);

  const [spawnReadyIds, setSpawnReadyIds] = useState<string[]>(() =>
    tiles.map((tile) => tile.id),
  );
  const [activeSpawnIds, setActiveSpawnIds] = useState<string[]>([]);
  const spawnTimersRef = useRef<number[]>([]);
  const spawnReadySet = useMemo(() => new Set(spawnReadyIds), [spawnReadyIds]);
  const activeSpawnSet = useMemo(() => new Set(activeSpawnIds), [activeSpawnIds]);

  useEffect(() => {
    spawnTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    spawnTimersRef.current = [];

    const currentIds = new Set<string>();
    tiles.forEach((tile) => currentIds.add(tile.id));

    setSpawnReadyIds((prev) => prev.filter((id) => currentIds.has(id)));
    setActiveSpawnIds((prev) => prev.filter((id) => currentIds.has(id)));

    const previousIds = previousTileIdsRef.current;

    if (previousIds.size === 0 && currentIds.size > 0) {
      setSpawnReadyIds(Array.from(currentIds));
      previousTileIdsRef.current = currentIds;
      return () => undefined;
    }

    const freshIds: string[] = [];
    tiles.forEach((tile) => {
      if (!previousIds.has(tile.id)) {
        freshIds.push(tile.id);
      }
    });

    if (freshIds.length) {
      freshIds.forEach((id) => {
        const timer = window.setTimeout(() => {
          setSpawnReadyIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
          setActiveSpawnIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
        }, SPAWN_DELAY_MS);
        spawnTimersRef.current.push(timer);
      });
    }

    previousTileIdsRef.current = currentIds;

    return () => {
      spawnTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      spawnTimersRef.current = [];
    };
  }, [tiles]);

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
    return 'Merge tiles with arrow keys, WASD, on-screen controls, or touch swipes.';
  }, [hasWon, isOver, hasMoves]);

  const canUndo = historyLength > 0;
  const overlayState = {
    hasWon,
    isOver,
    canContinue: hasWon && !isOver,
  };

  const canInteract = isHydrated && !isOver;
  const boardRef = useRef<HTMLDivElement | null>(null);
  useGameInput(boardRef);

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

      <AchievementShelf achievements={achievements} onReset={resetAchievements} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="relative mx-auto w-full max-w-xl">
          <div
            ref={boardRef}
            className="relative aspect-square w-full touch-pan-y rounded-[32px] bg-gradient-to-br from-muted/80 via-muted to-muted/60 p-5 shadow-xl"
          >
            <div
              className="grid h-full w-full gap-3"
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              }}
            >
              {grid.map((row, rowIndex) =>
                row.map((_, columnIndex) => (
                  <div
                    key={`bg-${rowIndex}-${columnIndex}`}
                    className="rounded-2xl bg-background/60 shadow-inner"
                  />
                )),
              )}
            </div>

            <motion.div
              layout
              className="pointer-events-none absolute inset-5 grid h-[calc(100%-2.5rem)] w-[calc(100%-2.5rem)] gap-3"
              style={{
                gridTemplateColumns: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${BOARD_SIZE}, minmax(0, 1fr))`,
              }}
            >
              <AnimatePresence>
                {tiles.map((tile) => {
                  const isMerged = Boolean(tile.mergedFrom);
                  const isNew = activeSpawnSet.has(tile.id);
                  if (!spawnReadySet.has(tile.id)) {
                    return null;
                  }
                  return (
                    <motion.div
                      key={tile.id}
                      layout
                      layoutId={tile.id}
                      initial={
                        isMerged
                          ? { scale: 1.1, opacity: 0.95 }
                          : isNew
                            ? { scale: 0.4, opacity: 0 }
                            : { scale: 0.7, opacity: 0.6 }
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{
                        scale: isMerged
                          ? { type: 'spring', stiffness: 720, damping: 22 }
                          : {
                              type: 'spring',
                              stiffness: isNew ? 640 : 520,
                              damping: isNew ? 18 : 26,
                              mass: 0.4,
                              delay: isNew ? 0.04 : 0,
                            },
                        opacity: {
                          duration: isNew ? 0.08 : 0.06,
                          delay: isNew ? 0.04 : 0,
                        },
                      }}
                      onAnimationComplete={() => {
                        if (isNew) {
                          setActiveSpawnIds((prev) =>
                            prev.filter((id) => id !== tile.id),
                          );
                        }
                      }}
                      className={`pointer-events-none flex h-full w-full items-center justify-center rounded-2xl font-semibold shadow-lg ${getTileClasses(tile.value)} ${getTileFontSize(tile.value)}`}
                      style={{
                        gridRowStart: tile.row + 1,
                        gridColumnStart: tile.column + 1,
                      }}
                    >
                      {integerFormatter.format(tile.value)}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

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
              <li>• Particle effects for merges and spawns</li>
              <li>• Achievement unlock toasts and celebrations</li>
              <li>• Session insights and challenge modes</li>
            </ul>
          </div>
        </aside>
      </div>

      <DirectionPad
        onMove={(direction) => {
          if (canInteract) {
            move(direction);
          }
        }}
        disabled={!canInteract}
      />
    </section>
  );
}
