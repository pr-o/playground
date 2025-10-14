'use client';

import { shallow } from 'zustand/shallow';

import { CanvasStage } from '@/components/clones/excalidraw/CanvasStage';
import { useElementsStore } from '@/store/excalidraw/elements-store';
import { ToolMode } from '@/types/excalidraw/elements';

const sidebarItems = [
  'Open...',
  'Save to...',
  'Export image',
  'Live collaboration',
  'Command palette',
  'Canvas background',
  'Help & shortcuts',
];

const topActions = ['Share', 'Library'];

const toolLabels: Record<ToolMode, string> = {
  selection: 'Selection',
  hand: 'Hand / Pan',
  rectangle: 'Rectangle',
  ellipse: 'Ellipse',
  diamond: 'Diamond',
  arrow: 'Arrow',
  line: 'Line',
  draw: 'Free Draw',
  text: 'Text',
  image: 'Image',
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export function ExcalidrawApp() {
  const { tool, camera, isLocked, setTool, setCamera, setCanvasLocked } =
    useElementsStore(
      (state) => ({
        tool: state.tool,
        camera: state.camera,
        isLocked: state.isCanvasLocked,
        setTool: state.actions.setTool,
        setCamera: state.actions.setCamera,
        setCanvasLocked: state.actions.setCanvasLocked,
      }),
      shallow,
    );

  const zoomPercentage = Math.round(camera.zoom * 100);

  const toggleLock = () => setCanvasLocked(!isLocked);

  const handleZoom = (direction: 'in' | 'out') => {
    const multiplier = direction === 'in' ? 1.1 : 1 / 1.1;
    const next = clamp(Number((camera.zoom * multiplier).toFixed(3)), 0.25, 3);
    setCamera({ zoom: next });
  };

  const handleResetView = () => {
    setCamera({ zoom: 1, offset: { x: 0, y: 0 } });
  };

  return (
    <div className="relative flex h-[calc(100vh-6rem)] min-h-[680px] w-full overflow-hidden rounded-3xl border border-border bg-[#FDFCF8] shadow-2xl">
      <aside className="flex w-64 flex-col border-r border-border/60 bg-white/70 p-6 backdrop-blur">
        <div className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Command Menu
          </h2>
        </div>
        <nav className="space-y-2 text-sm text-muted-foreground">
          {sidebarItems.map((item) => (
            <button
              key={item}
              type="button"
              className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left font-medium text-foreground transition hover:bg-muted"
            >
              <span>{item}</span>
              <span className="text-xs text-muted-foreground/70">⌘K</span>
            </button>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-dashed border-border/70 bg-muted/50 p-4 text-xs text-muted-foreground">
          Future live collaboration controls appear here.
        </div>
      </aside>

      <div className="relative flex flex-1 flex-col bg-transparent">
        <CanvasStage />

        <div className="pointer-events-none absolute left-1/2 top-6 z-20 flex -translate-x-1/2 gap-2">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/70 bg-white/90 px-4 py-2 shadow-lg backdrop-blur">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Selected tool
            </span>
            <span className="text-sm font-semibold text-foreground">
              {toolLabels[tool]}
            </span>
          </div>
          <div className="pointer-events-auto hidden items-center gap-2 rounded-full border border-border/70 bg-white/90 px-3 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur md:flex">
            <span>Change tool:</span>
            <div className="flex items-center gap-1">
              {Object.entries(toolLabels)
                .slice(0, 4)
                .map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setTool(key as ToolMode)}
                    className={`rounded-full px-2 py-1 transition ${
                      tool === key
                        ? 'bg-primary/10 text-primary'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute right-6 top-6 z-20 flex gap-3">
          {topActions.map((action) => (
            <button
              key={action}
              type="button"
              className="pointer-events-auto rounded-full border border-border/70 bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg transition hover:bg-white"
            >
              {action}
            </button>
          ))}
        </div>

        <div className="pointer-events-none absolute bottom-6 left-6 z-20">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border/70 bg-white/95 px-4 py-2 text-sm shadow-lg">
            <button
              type="button"
              onClick={() => handleZoom('out')}
              className="rounded-full border border-border bg-white px-2 py-1 text-xs transition hover:bg-muted"
            >
              −
            </button>
            <span className="font-semibold text-foreground">{zoomPercentage}%</span>
            <button
              type="button"
              onClick={() => handleZoom('in')}
              className="rounded-full border border-border bg-white px-2 py-1 text-xs transition hover:bg-muted"
            >
              ＋
            </button>
            <div className="flex items-center gap-2 pl-3 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={handleResetView}
                className="rounded-full border border-transparent px-2 py-1 transition hover:border-border"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setCamera({ offset: { x: 0, y: 0 } })}
                className="rounded-full border border-transparent px-2 py-1 transition hover:border-border"
              >
                Center
              </button>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute bottom-6 right-6 z-20">
          <button
            type="button"
            onClick={toggleLock}
            className={`pointer-events-auto rounded-full border border-border/70 px-4 py-2 text-xs font-medium uppercase tracking-wide shadow-lg transition ${
              isLocked
                ? 'bg-primary/90 text-white'
                : 'bg-white/90 text-muted-foreground hover:bg-white'
            }`}
          >
            {isLocked ? 'Canvas locked' : 'Canvas unlocked'}
          </button>
        </div>
      </div>
    </div>
  );
}
