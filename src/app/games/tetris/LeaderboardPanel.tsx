'use client';

import { memo, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { LeaderboardEntry } from './useLocalLeaderboard';

type LeaderboardPanelProps = {
  entries: LeaderboardEntry[];
  isReady: boolean;
  className?: string;
};

export const LeaderboardPanel = memo(function LeaderboardPanel({
  entries,
  isReady,
  className,
}: LeaderboardPanelProps) {
  const formatter = useMemo(() => new Intl.NumberFormat('en-US'), []);
  const topEntries = entries.slice(0, 5);

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground',
        className,
      )}
    >
      <header className="mb-3 flex items-center justify-between text-xs uppercase tracking-wide">
        <span className="font-semibold text-foreground/90">Personal Bests</span>
        <span className="text-[10px] text-muted-foreground/70">Top 5</span>
      </header>
      {!isReady ? (
        <p className="text-xs text-muted-foreground/70">Loading leaderboard…</p>
      ) : topEntries.length === 0 ? (
        <p className="text-xs text-muted-foreground/70">
          Finish a run to record your first score.
        </p>
      ) : (
        <ul className="space-y-2 text-xs">
          {topEntries.map((entry, index) => (
            <li
              key={entry.id}
              className={cn(
                'flex items-baseline justify-between rounded border border-transparent bg-background/40 px-3 py-2 text-foreground transition',
                index === 0 ? 'border-primary/40 bg-primary/10' : '',
              )}
            >
              <span className="font-semibold text-muted-foreground/80">#{index + 1}</span>
              <span className="flex flex-col text-right">
                <span className="font-semibold text-foreground">
                  {formatter.format(entry.score)}
                </span>
                <span className="text-[11px] text-muted-foreground/70">
                  {formatter.format(entry.lines)} lines · Lv{' '}
                  {formatter.format(entry.level)}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
