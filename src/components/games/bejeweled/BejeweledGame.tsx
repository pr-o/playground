'use client';

import { useEffect, useRef, useState } from 'react';
import { Board } from '@/lib/bejeweled/board';
import { CombinationManager } from '@/lib/bejeweled/combination-manager';
import { BEJEWELED_CONFIG, type BejeweledTileId } from '@/lib/bejeweled/config';
import { initBejeweledPixi, type BejeweledPixiContext } from '@/lib/bejeweled/pixi';

type DebugSummary = { rows: number; cols: number; tileCount: number };
type DebugMatchSummary = {
  directions: Array<'row' | 'col'>;
  tiles: Array<{ row: number; col: number }>;
};
type DebugWindow = Window & {
  __BEJEWELED_DEBUG__?: () => DebugSummary;
  __BEJEWELED_DEBUG_HIGHLIGHT__?: () => DebugMatchSummary[];
  __BEJEWELED_DEBUG_CLEAR__?: () => void;
  __BEJEWELED_DEBUG_SET_LAYOUT__?: (layout: string[][]) => DebugMatchSummary[];
};

const assignDebugApis = (handlers?: {
  summary: () => DebugSummary;
  highlight: () => DebugMatchSummary[];
  clear: () => void;
  setLayout: (layout: string[][]) => DebugMatchSummary[];
}) => {
  if (typeof window === 'undefined') {
    return;
  }
  const target = window as DebugWindow;
  target.__BEJEWELED_DEBUG__ = handlers?.summary;
  target.__BEJEWELED_DEBUG_HIGHLIGHT__ = handlers?.highlight;
  target.__BEJEWELED_DEBUG_CLEAR__ = handlers?.clear;
  target.__BEJEWELED_DEBUG_SET_LAYOUT__ = handlers?.setLayout;
};

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

        const debugOverlayDefault = process.env.NODE_ENV !== 'production';
        const board = new Board({
          stage: app.stage,
          viewportWidth: app.renderer.width,
          viewportHeight: app.renderer.height,
          ticker: app.ticker,
          enableDebugOverlay: debugOverlayDefault,
        });

        board.setDebugOverlay(debugOverlayDefault);

        const combinationManager = new CombinationManager(board);
        const matches = combinationManager.findMatches();
        if (matches.length === 0) {
          board.clearDebugMatches();
        }

        const formatClusters = (
          clusters: ReturnType<CombinationManager['findMatches']>,
        ) =>
          clusters.map((cluster) => ({
            directions: cluster.directions,
            tiles: cluster.tiles
              .map((matchTile) => {
                const field = matchTile.field;
                return field ? { row: field.row, col: field.col } : null;
              })
              .filter(
                (coords): coords is { row: number; col: number } => coords !== null,
              ),
          }));

        const updateDebugApis = () => {
          assignDebugApis({
            summary: () => ({
              rows: board.fields.length,
              cols: board.fields[0]?.length ?? 0,
              tileCount: board.tiles.length,
            }),
            highlight: () => {
              board.setDebugOverlay(true);
              const clusters = combinationManager.findMatches();
              if (clusters.length === 0) {
                board.clearDebugMatches();
              }
              return formatClusters(clusters);
            },
            clear: () => board.clearDebugMatches(),
            setLayout: (layout) => {
              board.setDebugOverlay(true);
              board.debugApplyLayout(layout as BejeweledTileId[][]);
              const clusters = combinationManager.findMatches();
              if (clusters.length === 0) {
                board.clearDebugMatches();
              }
              return formatClusters(clusters);
            },
          });
        };

        const resize = () => {
          const targetWidth = host.clientWidth || app.renderer.width;
          const targetHeight = host.clientHeight || app.renderer.height;

          app.renderer.resize(targetWidth, targetHeight);
          board.resize(targetWidth, targetHeight);
        };

        resize();
        window.addEventListener('resize', resize);
        removeResizeListener = () => window.removeEventListener('resize', resize);
        updateDebugApis();

        board.onSwapRequest = (from, to) => {
          void board.swapTiles(from, to);
        };

        board.onSwapComplete = () => {
          combinationManager.findMatches();
          updateDebugApis();
          // Phase 3+ will hook combo detection here.
        };

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
        board.clearDebugMatches();
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
      assignDebugApis(undefined);
      host.replaceChildren();
    };
  }, []);

  return (
    <div
      data-testid="bejeweled-wrapper"
      className="relative flex items-center justify-center overflow-hidden rounded-xl border border-border/60 bg-background/60 shadow-lg"
      style={{
        width:
          BEJEWELED_CONFIG.cols * BEJEWELED_CONFIG.tileSize +
          (BEJEWELED_CONFIG.cols - 1) * BEJEWELED_CONFIG.tileSpacing +
          BEJEWELED_CONFIG.boardPadding * 2,
        height:
          BEJEWELED_CONFIG.rows * BEJEWELED_CONFIG.tileSize +
          (BEJEWELED_CONFIG.rows - 1) * BEJEWELED_CONFIG.tileSpacing +
          BEJEWELED_CONFIG.boardPadding * 2,
      }}
    >
      <div ref={hostRef} data-testid="bejeweled-host" className="h-full w-full" />
      {status !== 'ready' && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/80 text-sm text-muted-foreground">
          {status === 'loading' ? 'Loading board…' : 'Unable to load assets'}
        </div>
      )}
    </div>
  );
}
