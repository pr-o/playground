'use client';

import { useEffect, useMemo, useState } from 'react';
import { GameBoard } from './GameBoard';
import { HoldSlot } from './HoldSlot';
import { NextQueue } from './NextQueue';
import { ScorePanel } from './ScorePanel';
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
        <aside className="flex w-full flex-col gap-4 md:max-w-[240px]">
          <ScorePanel
            score={state.stats.score}
            lines={state.stats.lines}
            level={state.stats.level}
          />
          <NextQueue queue={queuePreview} slots={3} isReady={isMounted} />
          <HoldSlot piece={state.hold} canHold={state.canHold} />
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
