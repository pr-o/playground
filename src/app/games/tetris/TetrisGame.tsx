'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { GameBoard } from './GameBoard';
import { HoldSlot } from './HoldSlot';
import { NextQueue } from './NextQueue';
import { ScorePanel } from './ScorePanel';
import { TouchControls } from './TouchControls';
import { useGameLoop } from './useGameLoop';
import { useInput } from './useInput';
import { useTetrisState } from './useTetrisState';
import { useTouchControls } from './useTouchControls';

enum GameStatus {
  Idle = 'idle',
  Running = 'running',
  Paused = 'paused',
  GameOver = 'gameOver',
}

export function TetrisGame() {
  const { state, queuePreview, spawnNext, reset, move, rotate, tick, hardDrop, hold } =
    useTetrisState();

  const [status, setStatus] = useState<GameStatus>(GameStatus.Idle);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const {
    setSoftDrop,
    start: startLoop,
    pause: pauseLoop,
    resume: resumeLoop,
    reset: resetLoop,
  } = useGameLoop({
    level: state.stats.level,
    onTick: tick,
    autoStart: false,
    paused: status !== GameStatus.Running,
  });
  const previousStatusRef = useRef<GameStatus>(GameStatus.Idle);

  useEffect(() => {
    if (!state.active && !state.isGameOver) {
      spawnNext();
    }
  }, [state.active, state.isGameOver, spawnNext]);

  useEffect(() => {
    if (state.isGameOver && status !== GameStatus.GameOver) {
      setStatus(GameStatus.GameOver);
    }
  }, [state.isGameOver, status]);

  useEffect(() => {
    const previous = previousStatusRef.current;

    if (status === GameStatus.Running) {
      if (previous === GameStatus.Paused) {
        resumeLoop();
      } else {
        resetLoop();
        startLoop();
      }
    } else {
      pauseLoop();
      setSoftDrop(false);
    }

    previousStatusRef.current = status;
  }, [status, pauseLoop, resumeLoop, startLoop, resetLoop, setSoftDrop]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const startNewGame = useCallback(() => {
    reset();
    setSoftDrop(false);
    resetLoop();
    setStatus((current) => {
      if (current === GameStatus.Running) {
        startLoop();
        return current;
      }
      return GameStatus.Running;
    });
  }, [reset, setSoftDrop, resetLoop, startLoop]);

  const resetToIdle = useCallback(() => {
    reset();
    setSoftDrop(false);
    resetLoop();
    setStatus(GameStatus.Idle);
  }, [reset, setSoftDrop, resetLoop]);

  const inputHandlers = useMemo(() => {
    return {
      onLeft: () => {
        if (status !== GameStatus.Running) return;
        move({ row: 0, col: -1 });
      },
      onRight: () => {
        if (status !== GameStatus.Running) return;
        move({ row: 0, col: 1 });
      },
      onSoftDrop: (active: boolean) => {
        if (status !== GameStatus.Running) return;
        setSoftDrop(active);
        if (active) {
          move({ row: 1, col: 0 });
        }
      },
      onHardDrop: () => {
        if (status !== GameStatus.Running) return;
        hardDrop();
      },
      onRotateCW: () => {
        if (status !== GameStatus.Running) return;
        rotate('cw');
      },
      onRotateCCW: () => {
        if (status !== GameStatus.Running) return;
        rotate('ccw');
      },
      onHold: () => {
        if (status !== GameStatus.Running) return;
        hold();
      },
      onPauseToggle: () => {
        if (status === GameStatus.Running) {
          setStatus(GameStatus.Paused);
          return;
        }
        if (status === GameStatus.Paused) {
          setStatus(GameStatus.Running);
          return;
        }
        startNewGame();
      },
      onRestart: () => {
        startNewGame();
      },
    };
  }, [status, move, setSoftDrop, hardDrop, rotate, hold, startNewGame]);

  useInput(inputHandlers);
  useTouchControls({
    ref: containerRef,
    actions: inputHandlers,
    disabled: status !== GameStatus.Running,
  });

  const overlayButtonClass =
    'rounded-md border border-border bg-background px-4 py-2 text-sm font-semibold uppercase tracking-wide text-foreground shadow-sm transition hover:bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary/40';

  return (
    <section
      ref={containerRef}
      className="relative flex flex-1 flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-start md:justify-center md:gap-6">
        <aside className="flex w-full flex-col gap-4 md:max-w-[220px]">
          <ScorePanel
            score={state.stats.score}
            lines={state.stats.lines}
            level={state.stats.level}
          />
          <div className="rounded-lg border border-border bg-muted/10 p-4 text-sm text-muted-foreground">
            <p>
              Controls: ←/→ to move, ↑ rotate CW, Z/Ctrl rotate CCW, ↓ soft drop, Space
              hard drop, Shift hold, P pause, R restart.
            </p>
            <p className="mt-2">
              Touch: swipe to move, tap to rotate, swipe down to soft drop, long-press to
              hold.
            </p>
          </div>
        </aside>
        <GameBoard board={state.board} active={state.active} />
        <aside className="flex w-full flex-col gap-4 md:max-w-[220px]">
          <NextQueue queue={queuePreview} slots={3} isReady={isMounted} />
          <HoldSlot piece={state.hold} canHold={state.canHold} />
        </aside>
      </div>
      <TouchControls actions={inputHandlers} disabled={status !== GameStatus.Running} />
      <AnimatePresence>
        {status !== GameStatus.Running && (
          <motion.div
            key={status}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="mx-auto flex w-full max-w-sm flex-col gap-4 rounded-lg border border-border bg-card/95 p-6 text-center shadow-lg"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            >
              {status === GameStatus.Idle && (
                <>
                  <h2 className="text-lg font-semibold text-foreground">
                    Ready to Stack?
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Press Start to begin. Swipe or tap on mobile, or use the keyboard
                    controls listed alongside the board.
                  </p>
                  <button
                    type="button"
                    className={overlayButtonClass}
                    onClick={startNewGame}
                  >
                    Start Game
                  </button>
                </>
              )}
              {status === GameStatus.Paused && (
                <>
                  <h2 className="text-lg font-semibold text-foreground">Paused</h2>
                  <p className="text-sm text-muted-foreground">
                    Take a quick breather. Resume to keep playing or restart to chase a
                    new high score.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className={overlayButtonClass}
                      onClick={() => setStatus(GameStatus.Running)}
                    >
                      Resume
                    </button>
                    <button
                      type="button"
                      className={overlayButtonClass}
                      onClick={startNewGame}
                    >
                      Restart
                    </button>
                    <button
                      type="button"
                      className={overlayButtonClass}
                      onClick={resetToIdle}
                    >
                      Quit to Menu
                    </button>
                  </div>
                </>
              )}
              {status === GameStatus.GameOver && (
                <>
                  <h2 className="text-lg font-semibold text-destructive">Game Over</h2>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      Score:{' '}
                      <span className="font-semibold text-foreground">
                        {state.stats.score}
                      </span>
                    </p>
                    <p>
                      Lines:{' '}
                      <span className="font-semibold text-foreground">
                        {state.stats.lines}
                      </span>
                    </p>
                    <p>
                      Level:{' '}
                      <span className="font-semibold text-foreground">
                        {state.stats.level}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      className={overlayButtonClass}
                      onClick={startNewGame}
                    >
                      Play Again
                    </button>
                    <button
                      type="button"
                      className={overlayButtonClass}
                      onClick={resetToIdle}
                    >
                      Back to Menu
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
