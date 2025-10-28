'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';

type ScorePanelProps = {
  score: number;
  lines: number;
  level: number;
  className?: string;
};

export const ScorePanel = memo(function ScorePanel({
  score,
  lines,
  level,
  className,
}: ScorePanelProps) {
  const formatter = useMemo(() => new Intl.NumberFormat('en-US'), []);

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border gap-3 p-4 border-border bg-muted/30',
        className,
      )}
    >
      <header className="flex items-center justify-between text-sm uppercase tracking-wide text-muted-foreground">
        <span className="font-semibold">Score</span>
        <span className="text-xs text-muted-foreground/70">Level {level}</span>
      </header>
      <p className="text-3xl font-bold text-primary">
        {formatter.format(score).padStart(1, '0')}
      </p>
      <div className="grid grid-cols-2 gap-3 text-xs uppercase text-muted-foreground">
        <div className="space-y-1">
          <p className="font-medium">Lines</p>
          <p className="text-base text-foreground">{formatter.format(lines)}</p>
        </div>
        <div className="space-y-1">
          <p className="font-medium">Level</p>
          <p className="text-base text-foreground">{formatter.format(level)}</p>
        </div>
      </div>
    </div>
  );
});
