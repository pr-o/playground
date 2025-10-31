'use client';

import { useEffect, useRef, useState } from 'react';
import type { GameState, SlitherApp, SlitherRenderer } from '@/lib/slither';
import {
  createGameState,
  createSlitherApp,
  createSlitherConfig,
  createSlitherRenderer,
} from '@/lib/slither';

export const SlitherClient = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<SlitherApp | null>(null);
  const stateRef = useRef<GameState | null>(null);
  const rendererRef = useRef<SlitherRenderer | null>(null);
  const [isReady, setIsReady] = useState(false);
  const configRef = useRef(createSlitherConfig());

  useEffect(() => {
    let cancelled = false;

    const mount = async () => {
      if (!containerRef.current) return;

      const app = await createSlitherApp({
        resizeTo: containerRef.current,
      });

      if (cancelled) {
        app.destroy(true);
        return;
      }

      const state = createGameState({
        config: configRef.current,
      });

      stateRef.current = state;
      const renderer = createSlitherRenderer(app, state);

      if (cancelled) {
        renderer.destroy();
        app.destroy(true);
        return;
      }

      appRef.current = app;
      rendererRef.current = renderer;

      containerRef.current.appendChild(app.canvas);
      setIsReady(true);
    };

    void mount();

    return () => {
      cancelled = true;
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }

      if (appRef.current) {
        appRef.current.destroy(true);
        appRef.current = null;
      }

      stateRef.current = null;
      setIsReady(false);
    };
  }, []);

  const pelletCount =
    stateRef.current?.pellets.length ?? configRef.current.pellet.initialCount;
  const worldRadius = configRef.current.worldRadius;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
      <div ref={containerRef} className="relative h-full w-full" />
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-1 text-[10px] uppercase tracking-[0.1em] text-cyan-300/30">
        <span>Pixi Canvas Ready: {isReady ? 'Yes' : 'No'}</span>
        <span>World Radius: {worldRadius}</span>
        <span>Pellets Seeded: {pelletCount}</span>
      </div>
      {!isReady && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-slate-950/40 via-slate-950/10 to-slate-950/60">
          <span className="text-xs uppercase tracking-[0.3em] text-cyan-400/70">
            Prototype
          </span>
          <p className="max-w-sm text-center text-sm text-slate-200">
            Slither engine bootstrapping in progress. PixiJS canvas initialized with
            config{' '}
            <code className="rounded bg-slate-900/70 px-2 py-0.5 text-xs text-cyan-300">
              worldRadius = {worldRadius}
            </code>
            .
          </p>
          <p className="text-xs text-slate-400">Preparing rendering surface…</p>
        </div>
      )}
    </div>
  );
};
