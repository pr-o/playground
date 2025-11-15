'use client';

import { BellRing, Flame } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { HEVY_USER_ICON, type HevyNavItem } from './nav-data';

type HevyTopBarProps = {
  item: HevyNavItem;
};

export function HevyTopBar({ item }: HevyTopBarProps) {
  const ProfileIcon = HEVY_USER_ICON;

  return (
    <div className="border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-xl">
      <div className="hevy-shell flex flex-col gap-4 py-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
            <span className="inline-flex items-center rounded-full border border-white/10 px-3 py-1 text-[10px] text-white/70">
              Hevy
            </span>
            <span className="text-white/60">Performance</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
              {item.label}
            </h1>
            <p className="text-sm text-white/70">{item.description}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-white/60">
            <Badge
              variant="outline"
              className="border-white/20 bg-white/5 text-xs text-white/80 backdrop-blur"
            >
              Week 6 · PPL
            </Badge>
            <div className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.15em] text-white/60">
              <Flame className="size-3 text-orange-300" />
              12 Day Streak
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="hidden h-10 rounded-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 px-6 text-sm font-semibold text-slate-950 shadow-[0_8px_30px_rgba(14,165,233,0.35)] transition hover:scale-[1.01] hover:brightness-110 lg:inline-flex">
            {item.ctaLabel}
          </Button>
          {item.secondaryCta ? (
            <Button className="hidden h-10 rounded-full border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10 lg:inline-flex">
              {item.secondaryCta}
            </Button>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <BellRing className="size-5" />
          </Button>
          <Button
            size="icon"
            className={cn(
              'rounded-full border border-white/10 bg-gradient-to-br from-white/90 to-white/70 text-slate-800 hover:brightness-110',
            )}
          >
            <ProfileIcon className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
