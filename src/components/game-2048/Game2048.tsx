'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import {
  Award,
  Crown,
  Gem,
  Medal,
  Sparkles,
  Sprout,
  Star,
  Trophy,
  Undo2,
  type LucideIcon,
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { AchievementShelf } from '@/components/game-2048/AchievementShelf';
import { BOARD_SIZE } from '@/lib/game-2048';
import type { MoveDirection } from '@/lib/game-2048';
import { cn } from '@/lib/utils';
import { useGame2048Store, type Game2048Store } from '@/store/game-2048';

const selectGrid = (state: Game2048Store) => state.grid;
const selectScore = (state: Game2048Store) => state.score;
const selectBestScore = (state: Game2048Store) => state.bestScore;
const selectMoveCount = (state: Game2048Store) => state.moveCount;
const selectHasWon = (state: Game2048Store) => state.hasWon;
const selectIsOver = (state: Game2048Store) => state.isOver;
const selectHistoryLength = (state: Game2048Store) => state.history.length;
const selectNewGame = (state: Game2048Store) => state.newGame;
const selectUndo = (state: Game2048Store) => state.undo;
const selectIsHydrated = (state: Game2048Store) => state.isHydrated;
const selectMove = (state: Game2048Store) => state.move;
const selectAchievements = (state: Game2048Store) => state.achievements;
const selectResetAchievements = (state: Game2048Store) => state.resetAchievements;
import { useGamePersistence } from '@/hooks/game-2048/useGamePersistence';
import { useGameInput } from '@/hooks/game-2048/useGameInput';

const integerFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

/**
 * Animation timings to stage: slide → merge pop → new tile spawn.
 */
const TILE_MOVE_DURATION_MS = 140;
const MERGE_BOUNCE_DURATION_MS = 440;
const NEW_TILE_DELAY_MS = 220;
const NEW_TILE_POP_DURATION_MS = 200;

const MOVE_EASE = [0.22, 1, 0.36, 1] as const;
const POP_EASE = [0.16, 1, 0.3, 1] as const;

const achievementIconMap: Record<string, LucideIcon> = {
  star: Star,
  sparkles: Sparkles,
  sprout: Sprout,
  crown: Crown,
  gem: Gem,
  medal: Medal,
  trophy: Trophy,
  undo: Undo2,
  award: Award,
};

const ACHIEVEMENT_TOAST_FALLBACK = 'Achievement unlocked — keep the streak going!';

const ScoreCard = ({ label, value }: { label: string; value: number }) => {
  const slug = label.toLowerCase().replace(/\s+/g, '-');
  return (
    <div
      className="flex w-full min-w-[120px] flex-col rounded-2xl bg-gradient-to-br from-muted to-muted/60 px-4 py-3 text-left shadow-sm"
      data-testid={`score-card-${slug}`}
    >
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
          data-testid={`score-card-${slug}-value`}
        >
          {integerFormatter.format(value)}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

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
    'min-w-[120px] rounded-full px-4 py-6 text-md font-semibold transition cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';
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
  className,
}: {
  onMove: (direction: MoveDirection) => void;
  disabled: boolean;
  className?: string;
}) {
  const padButtonClasses =
    'flex h-12 w-12 items-center justify-center rounded-xl cursor-pointer border border-border/80 bg-gradient-to-br from-background via-card to-muted text-xl font-semibold text-foreground shadow-[inset_0_2px_2px_rgba(255,255,255,0.35),0_6px_12px_-4px_rgba(15,23,42,0.45)] transition hover:translate-y-[-1px] hover:shadow-[inset_0_2px_3px_rgba(255,255,255,0.45),0_14px_22px_-12px_rgba(15,23,42,0.55)] active:translate-y-[1px] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.35),0_6px_10px_-6px_rgba(15,23,42,0.6)] disabled:cursor-not-allowed disabled:opacity-60';

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
    <div className={cn('flex justify-center', className)}>
      <div className="rounded-[28px] border border-border/60 bg-gradient-to-br from-muted/70 via-card to-background p-4 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.6)]">
        <div className="grid grid-cols-3 gap-3">
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

  const grid = useGame2048Store(selectGrid);
  const score = useGame2048Store(selectScore);
  const bestScore = useGame2048Store(selectBestScore);
  const moveCount = useGame2048Store(selectMoveCount);
  const hasWon = useGame2048Store(selectHasWon);
  const isOver = useGame2048Store(selectIsOver);
  const historyLength = useGame2048Store(selectHistoryLength);
  const newGame = useGame2048Store(selectNewGame);
  const undo = useGame2048Store(selectUndo);
  const isHydrated = useGame2048Store(selectIsHydrated);
  const move = useGame2048Store(selectMove);
  const achievements = useGame2048Store(selectAchievements);
  const resetAchievements = useGame2048Store(selectResetAchievements);

  const hasTiles = useMemo(
    () => grid.some((row) => row.some((cell) => cell !== null)),
    [grid],
  );

  const previousTileIdsRef = useRef<Set<string>>(new Set());
  const unlockedAchievementIdsRef = useRef<Set<string>>(new Set());
  const hasInitializedAchievementUnlocksRef = useRef(false);

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

    const freshTiles = tiles.filter((tile) => !previousIds.has(tile.id));
    const hadExistingTiles = previousIds.size > 0;

    if (freshTiles.length) {
      freshTiles.forEach((tile) => {
        const isSpawnedTile = hadExistingTiles && !tile.mergedFrom;
        const delay = isSpawnedTile ? NEW_TILE_DELAY_MS : 0;

        // Delay newly spawned tiles so merge animations finish before they appear.
        const scheduleActivation = () => {
          setSpawnReadyIds((prev) =>
            prev.includes(tile.id) ? prev : [...prev, tile.id],
          );
          if (isSpawnedTile) {
            setActiveSpawnIds((prev) =>
              prev.includes(tile.id) ? prev : [...prev, tile.id],
            );
          }
        };

        if (delay <= 0) {
          scheduleActivation();
          return;
        }

        const timer = window.setTimeout(scheduleActivation, delay);
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

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const unlockedNow = achievements.filter((achievement) =>
      Boolean(achievement.unlockedAt),
    );
    const unlockedIds = new Set(unlockedNow.map((achievement) => achievement.id));

    if (!hasInitializedAchievementUnlocksRef.current) {
      unlockedAchievementIdsRef.current = unlockedIds;
      hasInitializedAchievementUnlocksRef.current = true;
      return;
    }

    if (!unlockedNow.length) {
      unlockedAchievementIdsRef.current.clear();
      return;
    }

    const newlyUnlocked = unlockedNow.filter(
      (achievement) => !unlockedAchievementIdsRef.current.has(achievement.id),
    );

    if (!newlyUnlocked.length) {
      return;
    }

    newlyUnlocked.forEach((achievement) => {
      const Icon = achievementIconMap[achievement.icon] ?? Award;
      toast.success(achievement.label, {
        description: achievement.description ?? ACHIEVEMENT_TOAST_FALLBACK,
        icon: <Icon className="h-5 w-5" />,
      });
      unlockedAchievementIdsRef.current.add(achievement.id);
    });
  }, [achievements, isHydrated]);

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
          <div className="grid w-full gap-3 sm:grid-cols-3">
            <ScoreCard label="Score" value={score} />
            <ScoreCard label="Best" value={bestScore} />
            <ScoreCard label="Moves" value={moveCount} />
          </div>
        </div>
        <div className="flex flex-shrink-0 gap-3 self-start sm:self-auto">
          <ControlButton onClick={() => newGame()}>New Game</ControlButton>
          <ControlButton
            onClick={() => undo()}
            disabled={!canUndo}
            variant="ghost"
            data-testid="undo-button"
          >
            Undo
          </ControlButton>
        </div>
      </div>

      <AchievementShelf achievements={achievements} onReset={resetAchievements} />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="relative w-full max-w-xl lg:mx-auto">
          <div
            ref={boardRef}
            data-testid="board"
            data-game-hydrated={isHydrated ? 'true' : 'false'}
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
                          ? { scale: 1.18, opacity: 0.92 }
                          : isNew
                            ? { scale: 0.25, opacity: 0 }
                            : { scale: 0.94, opacity: 0.85 }
                      }
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.5, opacity: 0 }}
                      transition={{
                        layout: {
                          duration: TILE_MOVE_DURATION_MS / 1000,
                          ease: MOVE_EASE,
                        },
                        scale: isMerged
                          ? {
                              duration: MERGE_BOUNCE_DURATION_MS / 1000,
                              ease: POP_EASE,
                            }
                          : isNew
                            ? {
                                duration: NEW_TILE_POP_DURATION_MS / 1000,
                                ease: POP_EASE,
                              }
                            : {
                                duration: TILE_MOVE_DURATION_MS / 1000,
                                ease: MOVE_EASE,
                              },
                        opacity: {
                          duration: 0.14,
                          ease: 'easeOut',
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
              <div
                className="absolute inset-5 z-10 flex flex-col items-center justify-center gap-4 rounded-[28px] bg-background/90 text-center shadow-xl"
                data-testid="game-over-overlay"
              >
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

        <aside className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-card/50 p-6 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">How to play</h3>
              <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li>
                  <strong className="text-foreground">1.</strong> Merge tiles with arrow
                  keys, WASD, on-screen controls, or touch swipes to double their value.
                </li>
                <li>
                  <strong className="text-foreground">2.</strong> Every move spawns a new
                  tile— plan ahead to avoid filling the board.
                </li>
                <li>
                  <strong className="text-foreground">3.</strong> Reach the 2048 tile to
                  win, then keep going to push your best score.
                </li>
              </ol>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-foreground">Controls</h3>
              <p className="mt-2 text-xs text-muted-foreground">
                Use arrow keys or WASD on desktop. On touch devices, swipe directly on the
                board.
              </p>
              <DirectionPad
                className="mt-4"
                onMove={(direction) => {
                  if (canInteract) {
                    move(direction);
                  }
                }}
                disabled={!canInteract}
              />
              <p className="mt-8 text-xs text-muted-foreground">
                * Moves are throttled slightly to keep animations smooth and readable.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
