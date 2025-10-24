'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Board } from '@/lib/bejeweled/board';
import { CombinationManager } from '@/lib/bejeweled/combination-manager';
import { BEJEWELED_CONFIG, type BejeweledTileId } from '@/lib/bejeweled/config';
import { initBejeweledPixi, type BejeweledPixiContext } from '@/lib/bejeweled/pixi';
import {
  BEJEWELED_STAGE_LIST,
  BEJEWELED_STAGES,
  type BejeweledStageKey,
} from '@/lib/bejeweled/stages';
import type { Tile } from '@/lib/bejeweled/tile';

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
  const combinationManagerRef = useRef<CombinationManager | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);
  const resolvingRef = useRef(false);
  const buildingRef = useRef(false);
  const [status, setStatus] = useState<InitStatus>('loading');
  const [stageKey, setStageKey] = useState<BejeweledStageKey>('default');
  const debugOverlayDefault = process.env.NODE_ENV !== 'production';

  const updateDebugApis = useCallback(() => {
    const board = boardRef.current;
    const combinationManager = combinationManagerRef.current;
    if (!board || !combinationManager) {
      assignDebugApis(undefined);
      return;
    }

    const formatClusters = (clusters: ReturnType<CombinationManager['findMatches']>) =>
      clusters.map((cluster) => ({
        directions: cluster.directions,
        tiles: cluster.tiles
          .map((matchTile) => {
            const field = matchTile.field;
            return field ? { row: field.row, col: field.col } : null;
          })
          .filter((coords): coords is { row: number; col: number } => coords !== null),
      }));

    assignDebugApis({
      summary: () => ({
        rows: board.fields.length,
        cols: board.fields.reduce((max, row) => {
          const active = row.reduce((count, field) => (field ? count + 1 : count), 0);
          return Math.max(max, active);
        }, 0),
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
  }, []);

  const bootstrapInitialBoard = useCallback(async () => {
    const board = boardRef.current;
    const combinationManager = combinationManagerRef.current;
    if (!board || !combinationManager) {
      return;
    }

    let clusters = combinationManager.findMatches();
    while (clusters.length > 0) {
      board.removeMatches(clusters);
      await board.dropTiles({ animate: false });
      await board.spawnNewTiles({ animate: false });
      clusters = combinationManager.findMatches();
    }

    updateDebugApis();
  }, [updateDebugApis]);

  const resolveSwap = useCallback(
    async (from: Tile, to: Tile) => {
      const board = boardRef.current;
      const combinationManager = combinationManagerRef.current;
      if (!board || !combinationManager || resolvingRef.current) {
        return;
      }

      resolvingRef.current = true;
      try {
        await board.swapTiles(from, to);
        let clusters = combinationManager.findMatches();
        if (clusters.length === 0) {
          await board.swapTiles(from, to, { reverse: true });
          combinationManager.findMatches();
          updateDebugApis();
          return;
        }

        while (clusters.length > 0) {
          board.removeMatches(clusters);
          await board.dropTiles();
          await board.spawnNewTiles();
          clusters = combinationManager.findMatches();
        }

        updateDebugApis();
      } finally {
        resolvingRef.current = false;
      }
    },
    [updateDebugApis],
  );

  const buildBoard = useCallback(
    async (key: BejeweledStageKey) => {
      const context = pixiContextRef.current;
      if (!context || buildingRef.current) {
        return;
      }

      const definition = BEJEWELED_STAGES[key];
      if (!definition) {
        return;
      }

      buildingRef.current = true;
      setStatus('loading');
      assignDebugApis(undefined);

      const existingBoard = boardRef.current;
      if (existingBoard) {
        existingBoard.clearDebugMatches();
        existingBoard.destroy();
        boardRef.current = null;
      }
      combinationManagerRef.current = null;

      try {
        const board = new Board({
          stage: context.app.stage,
          viewportWidth: context.app.renderer.width,
          viewportHeight: context.app.renderer.height,
          ticker: context.app.ticker,
          enableDebugOverlay: debugOverlayDefault,
          shape: definition.mask,
        });

        board.setDebugOverlay(debugOverlayDefault);
        board.onSwapRequest = (from, to) => {
          void resolveSwap(from, to);
        };
        board.onInvalidSwap = (tiles) => board.flashInvalidSwap(tiles);

        boardRef.current = board;
        combinationManagerRef.current = new CombinationManager(board);

        const targetWidth = context.app.renderer.width;
        const targetHeight = context.app.renderer.height;
        board.resize(targetWidth, targetHeight);

        await bootstrapInitialBoard();
        setStageKey(key);
        setStatus('ready');
      } catch (error) {
        console.error('Failed to build Bejeweled stage', error);
        setStatus('error');
        assignDebugApis(undefined);
      } finally {
        buildingRef.current = false;
      }
    },
    [bootstrapInitialBoard, debugOverlayDefault, resolveSwap],
  );

  useEffect(() => {
    const host = hostRef.current;
    if (!host) {
      return;
    }

    let disposed = false;

    const boot = async () => {
      setStatus('loading');
      try {
        const context = await initBejeweledPixi(host);
        if (disposed) {
          context.app.destroy(true, { children: true });
          return;
        }

        pixiContextRef.current = context;

        const resize = () => {
          if (disposed) {
            return;
          }
          const targetWidth = host.clientWidth || context.app.renderer.width;
          const targetHeight = host.clientHeight || context.app.renderer.height;

          context.app.renderer.resize(targetWidth, targetHeight);
          const board = boardRef.current;
          if (board) {
            board.resize(targetWidth, targetHeight);
          }
        };

        resize();
        window.addEventListener('resize', resize);
        resizeCleanupRef.current = () => window.removeEventListener('resize', resize);

        await buildBoard('default');
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

      const removeResize = resizeCleanupRef.current;
      if (removeResize) {
        removeResize();
        resizeCleanupRef.current = null;
      }

      const board = boardRef.current;
      if (board) {
        board.clearDebugMatches();
        board.destroy();
        boardRef.current = null;
      }
      combinationManagerRef.current = null;

      const context = pixiContextRef.current;
      if (context) {
        context.app.destroy(true, { children: true });
        pixiContextRef.current = null;
      }

      assignDebugApis(undefined);
      if (host) {
        host.replaceChildren();
      }
    };
  }, [buildBoard]);

  const handleStageSelect = useCallback(
    (key: BejeweledStageKey) => {
      if (buildingRef.current) {
        return;
      }
      void buildBoard(key);
    },
    [buildBoard],
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-2">
        {BEJEWELED_STAGE_LIST.map((stage) => {
          const isActive = stageKey === stage.key;
          const disabled = status === 'loading' || !pixiContextRef.current;
          const baseClasses =
            'rounded-md border px-3 py-1.5 text-sm font-medium transition';
          const palette = isActive
            ? 'border-primary/70 bg-primary text-primary-foreground shadow'
            : 'border-border bg-background text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground';
          const cursorClass = disabled ? 'cursor-not-allowed' : 'cursor-pointer';
          const disabledClasses = disabled ? 'opacity-60' : '';
          return (
            <button
              key={stage.key}
              type="button"
              aria-pressed={isActive}
              disabled={disabled}
              onClick={() => handleStageSelect(stage.key)}
              className={[baseClasses, palette, cursorClass, disabledClasses]
                .filter(Boolean)
                .join(' ')}
            >
              {stage.label}
            </button>
          );
        })}
      </div>
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
    </div>
  );
}
