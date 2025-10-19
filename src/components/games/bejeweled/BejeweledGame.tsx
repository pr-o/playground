'use client';

import { useEffect, useRef, useState } from 'react';
import { initMatch3Pixi, type Match3PixiContext } from '@/lib/match3/pixi';

type InitStatus = 'loading' | 'ready' | 'error';

export function BejeweledGame() {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const pixiContextRef = useRef<Match3PixiContext | null>(null);
  const [status, setStatus] = useState<InitStatus>('loading');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    let disposed = false;

    const boot = async () => {
      setStatus('loading');
      try {
        const context = await initMatch3Pixi(host);

        if (disposed) {
          context.app.destroy(true, { children: true });
          return;
        }

        pixiContextRef.current = context;
        setStatus('ready');
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
