'use client';

import { useEffect, useRef, useState } from 'react';
import { Board } from '@/lib/bejeweled/board';
import { initBejeweledPixi, type BejeweledPixiContext } from '@/lib/bejeweled/pixi';

type InitStatus = 'loading' | 'ready' | 'error';

export function BejeweledGame() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pixiContextRef = useRef<BejeweledPixiContext | null>(null);
  const boardRef = useRef<Board | null>(null);
  const [status, setStatus] = useState<InitStatus>('loading');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    let disposed = false;
    let removeResizeListener: (() => void) | null = null;

    const boot = async () => {
      setStatus('loading');
      try {
        const context = await initBejeweledPixi(host);
        const { app } = context;

        if (disposed) {
          app.destroy(true, { children: true });
          return;
        }

        const board = new Board({
          stage: app.stage,
          viewportWidth: app.renderer.width,
          viewportHeight: app.renderer.height,
        });

        const resize = () => {
          const targetWidth = host.clientWidth || app.renderer.width;
          const targetHeight = host.clientHeight || app.renderer.height;

          app.renderer.resize(targetWidth, targetHeight);
          board.resize(targetWidth, targetHeight);
        };

        resize();
        window.addEventListener('resize', resize);
        removeResizeListener = () => window.removeEventListener('resize', resize);

        pixiContextRef.current = context;
        boardRef.current = board;
        setStatus('ready');

        return () => {
          window.removeEventListener('resize', resize);
        };
      } catch (error) {
        console.error('Failed to initialize Bejeweled Pixi scene', error);
        if (!disposed) {
          setStatus('error');
        }
      }
    };

    void boot();

    return () => {
      disposed = true;
      const board = boardRef.current;
      if (board) {
        board.destroy();
        boardRef.current = null;
      }
      if (removeResizeListener) {
        removeResizeListener();
        removeResizeListener = null;
      }
      if (pixiContextRef.current) {
        pixiContextRef.current.app.destroy(true, { children: true });
        pixiContextRef.current = null;
      }
      host.replaceChildren();
    };
  }, []);

  return (
    <div className="relative flex h-[480px] w-[480px] items-center justify-center overflow-hidden rounded-3xl border border-border/60 bg-background/60 shadow-lg">
      <div ref={hostRef} className="h-full w-full" />
      {status !== 'ready' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80 text-sm text-muted-foreground">
          {status === 'loading' ? 'Loading board…' : 'Unable to load assets'}
        </div>
      )}
    </div>
  );
}
