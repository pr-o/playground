'use client';

import { useEffect, useMemo, useState } from 'react';
import { GameBoard } from './GameBoard';
import { useGameLoop } from './useGameLoop';
import { useInput } from './useInput';
import { useTetrisState } from './useTetrisState';

export function TetrisGame() {
  const { state, queuePreview, spawnNext, reset, move, rotate, tick, hardDrop, hold } =
    useTetrisState();

  const [paused, setPaused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { setSoftDrop, start, pause, resume } = useGameLoop({
    level: state.stats.level,
    onTick: tick,
    autoStart: true,
    paused,
  });

  useEffect(() => {
    if (!state.active && !state.isGameOver) {
      spawnNext();
    }
  }, [state.active, state.isGameOver, spawnNext]);

  useEffect(() => {
    if (state.isGameOver) {
      setPaused(true);
      pause();
    }
  }, [state.isGameOver, pause]);

  const inputHandlers = useMemo(
    () => ({
      onLeft: () => move({ row: 0, col: -1 }),
      onRight: () => move({ row: 0, col: 1 }),
      onSoftDrop: (active: boolean) => {
        setSoftDrop(active);
        if (active) {
          move({ row: 1, col: 0 });
        }
      },
      onHardDrop: () => hardDrop(),
      onRotateCW: () => rotate('cw'),
      onRotateCCW: () => rotate('ccw'),
      onHold: () => hold(),
      onPauseToggle: () => {
        setPaused((prev) => {
          const next = !prev;
          if (next) {
            pause();
          } else {
            resume();
          }
          return next;
        });
      },
      onRestart: () => {
        reset();
        setPaused(false);
        start();
      },
    }),
    [hardDrop, hold, move, pause, reset, resume, rotate, setSoftDrop, start],
  );

  useInput(inputHandlers);

  useEffect(() => {
    if (!paused && !state.isGameOver) {
      resume();
    }
  }, [paused, resume, state.isGameOver]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <section className="flex flex-1 flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-1 flex-col gap-4 md:flex-row">
        <GameBoard board={state.board} active={state.active} />
        <aside className="flex w-full flex-col gap-4 md:max-w-[220px]">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Score
            </h3>
            <p className="text-2xl font-bold text-primary">{state.stats.score}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <p className="font-medium uppercase">Lines</p>
                <p className="text-base text-foreground">{state.stats.lines}</p>
              </div>
              <div>
                <p className="font-medium uppercase">Level</p>
                <p className="text-base text-foreground">{state.stats.level}</p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Next
            </h3>
            <div className="mt-3 space-y-2">
              {(isMounted
                ? queuePreview
                : Array.from({ length: Math.max(queuePreview.length, 3) }, () => null)
              ).map((id, index) => (
                <div
                  key={id ? `${id}-${index}` : `placeholder-${index}`}
                  className="rounded-md border border-border/40 bg-background/60 px-3 py-2 text-sm capitalize text-muted-foreground"
                >
                  {id ? `${id} piece` : '...'}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-muted/10 p-4 text-sm text-muted-foreground">
            <p>
              Controls: ←/→ to move, ↑ rotate CW, Z/Ctrl rotate CCW, ↓ soft drop, Space
              hard drop, Shift hold, P pause, R restart.
            </p>
          </div>
        </aside>
      </div>
      {state.isGameOver && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-center text-sm text-destructive-foreground">
          Game over! Press R to restart.
        </div>
      )}
    </section>
  );
}
