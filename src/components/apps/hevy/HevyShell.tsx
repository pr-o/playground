'use client';

import * as React from 'react';
import type { ReactNode } from 'react';

import { HevyTopNav } from './HevyTopNav';
import { HevyTopBar } from './HevyTopBar';
import { HEVY_NAV_ITEMS, type HevyTabId } from './nav-data';

type HevyShellProps = {
  sections: Partial<Record<HevyTabId, ReactNode>>;
};

export function HevyShell({ sections }: HevyShellProps) {
  const [activeTab, setActiveTab] = React.useState<HevyTabId>('home');
  const activeItem = React.useMemo(
    () => HEVY_NAV_ITEMS.find((item) => item.id === activeTab) ?? HEVY_NAV_ITEMS[0],
    [activeTab],
  );
  const activeContent = sections[activeTab] ?? null;

  return (
    <div className="hevy-theme min-h-dvh w-full">
      <div className="relative flex min-h-dvh flex-col pb-8">
        <div className="absolute inset-x-0 top-0 -z-10 h-64 w-full bg-gradient-to-b from-white/10 via-white/5 to-transparent blur-3xl" />
        <div className="py-2">
          <HevyTopNav value={activeTab} onValueChange={setActiveTab} />
        </div>
        <HevyTopBar item={activeItem} />
        <main className="flex-1 pb-6 pt-4">
          <div className="hevy-shell hevy-shell-bounds w-full">{activeContent}</div>
        </main>
      </div>
    </div>
  );
}
