'use client';

import { HEVY_NAV_ITEMS, type HevyTabId } from './nav-data';
import { HevyTabs, HevyTabsList, HevyTabsTrigger } from './primitives';

type HevyTopNavProps = {
  value: HevyTabId;
  onValueChange: (value: HevyTabId) => void;
};

export function HevyTopNav({ value, onValueChange }: HevyTopNavProps) {
  return (
    <div className="flex justify-center">
      <div className="hevy-shell">
        <div className="mx-auto w-full max-w-4xl rounded-[28px] border border-white/10 bg-black/30 p-2 backdrop-blur-2xl">
          <HevyTabs
            value={value}
            onValueChange={(val) => onValueChange(val as HevyTabId)}
            className="w-full"
          >
            <HevyTabsList className="grid h-auto w-full grid-cols-5 gap-1">
              {HEVY_NAV_ITEMS.map((item) => (
                <HevyTabsTrigger
                  key={item.id}
                  value={item.id}
                  className="flex flex-col items-center gap-1 text-[11px]"
                >
                  <item.icon
                    className="size-5"
                    strokeWidth={item.id === 'workouts' ? 2.7 : 2.2}
                  />
                  {item.label}
                </HevyTabsTrigger>
              ))}
            </HevyTabsList>
          </HevyTabs>
        </div>
      </div>
    </div>
  );
}
