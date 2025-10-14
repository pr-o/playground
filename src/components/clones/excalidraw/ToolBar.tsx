'use client';

import clsx from 'clsx';
import {
  ArrowUpRight,
  Circle,
  Hand,
  ImageIcon,
  Lock,
  MousePointer,
  Pen,
  Square,
  Type,
  Unlock,
  Diamond,
  LineChart,
} from 'lucide-react';
import { shallow } from 'zustand/shallow';

import { useElementsStore } from '@/store/excalidraw/elements-store';
import { ToolMode } from '@/types/excalidraw/elements';

type ToolConfig = {
  name: string;
  tool: ToolMode;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
};

const TOOL_CONFIG: ToolConfig[] = [
  { name: 'Select', tool: 'selection', icon: MousePointer, shortcut: 'V' },
  { name: 'Hand', tool: 'hand', icon: Hand, shortcut: 'H' },
  { name: 'Rectangle', tool: 'rectangle', icon: Square, shortcut: 'R' },
  { name: 'Ellipse', tool: 'ellipse', icon: Circle, shortcut: 'E' },
  { name: 'Diamond', tool: 'diamond', icon: Diamond, shortcut: 'D' },
  { name: 'Arrow', tool: 'arrow', icon: ArrowUpRight, shortcut: 'A' },
  { name: 'Line', tool: 'line', icon: LineChart, shortcut: 'L' },
  { name: 'Draw', tool: 'draw', icon: Pen, shortcut: 'P' },
  { name: 'Text', tool: 'text', icon: Type, shortcut: 'T' },
  { name: 'Image', tool: 'image', icon: ImageIcon, shortcut: 'I' },
];

export function ToolBar() {
  const { activeTool, isLocked, setTool, setToolLock } = useElementsStore(
    (state) => ({
      activeTool: state.tool,
      isLocked: state.isToolLocked,
      setTool: state.actions.setTool,
      setToolLock: state.actions.setToolLock,
    }),
    shallow,
  );

  return (
    <div className="flex items-center gap-2 rounded-full border border-border/70 bg-white/95 px-4 py-2 shadow-xl backdrop-blur">
      <div className="flex items-center gap-1">
        {TOOL_CONFIG.map(({ name, tool, icon: Icon, shortcut }) => {
          const isActive = activeTool === tool;
          return (
            <button
              key={tool}
              type="button"
              onClick={() => setTool(tool)}
              className={clsx(
                'group flex h-10 w-10 items-center justify-center rounded-full border border-transparent text-muted-foreground transition',
                isActive
                  ? 'border-primary/50 bg-primary/10 text-primary shadow-inner'
                  : 'hover:border-border hover:bg-muted hover:text-foreground',
              )}
              aria-pressed={isActive}
              aria-label={`${name}${shortcut ? ` (${shortcut})` : ''}`}
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </div>
      <div className="ml-2 h-6 w-px bg-border/70" />
      <button
        type="button"
        onClick={() => setToolLock(!isLocked)}
        className={clsx(
          'flex h-10 items-center gap-2 rounded-full border border-transparent px-3 text-xs font-semibold uppercase tracking-wide transition',
          isLocked
            ? 'bg-primary/90 text-white shadow-lg'
            : 'bg-muted/60 text-muted-foreground hover:bg-muted',
        )}
      >
        {isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        <span>{isLocked ? 'Locked' : 'Lock tool'}</span>
      </button>
    </div>
  );
}
