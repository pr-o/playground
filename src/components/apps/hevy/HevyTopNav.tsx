'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { HEVY_NAV_ITEMS, type HevyTabId } from './nav-data';

type HevyTopNavProps = {
  value: HevyTabId;
  onValueChange: (value: HevyTabId) => void;
};

export function HevyTopNav({ value, onValueChange }: HevyTopNavProps) {
  return (
    <div className="flex justify-center">
      <div className="hevy-shell">
        <div className="mx-auto w-full max-w-4xl rounded-[28px] border border-white/10 bg-black/30 p-2 backdrop-blur-2xl">
          <Tabs
            value={value}
            onValueChange={(val) => onValueChange(val as HevyTabId)}
            className="w-full"
          >
            <TabsList className="grid h-auto w-full grid-cols-5 gap-1 rounded-[20px] border border-white/5 bg-transparent p-1">
              {HEVY_NAV_ITEMS.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-[16px] border border-transparent bg-transparent p-2 text-[11px] font-medium uppercase tracking-wide text-white/70 transition',
                    'data-[state=active]:border-white/10 data-[state=active]:bg-white/10 data-[state=active]:text-white',
                  )}
                >
                  <item.icon
                    className="size-5"
                    strokeWidth={item.id === 'workouts' ? 2.7 : 2.2}
                  />
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
