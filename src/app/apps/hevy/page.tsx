import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Clock3 } from 'lucide-react';

import { HevyShell } from '@/components/apps/hevy/HevyShell';
import { HevyHomeContent } from '@/components/apps/hevy/HevyHomeContent';
import { HEVY_NAV_ITEMS, type HevyTabId } from '@/components/apps/hevy/nav-data';

export const metadata: Metadata = {
  title: 'Hevy Fitness Performance Dashboard',
  description:
    'Recreation of the Hevy workout logging experience with responsive layout, radial gradients, and Radix-driven UI patterns.',
};

export const revalidate = 120;

const NAV_DESCRIPTIONS = HEVY_NAV_ITEMS.reduce(
  (map, item) => {
    map[item.id] = item.description;
    return map;
  },
  {} as Record<HevyTabId, string>,
);

export default function HevyAppPage() {
  const sections: Partial<Record<HevyTabId, ReactNode>> = {
    home: <HevyHomeContent />,
    workouts: (
      <HevyTabPlaceholder tab="workouts" description={NAV_DESCRIPTIONS.workouts} />
    ),
    plans: <HevyTabPlaceholder tab="plans" description={NAV_DESCRIPTIONS.plans} />,
    progress: (
      <HevyTabPlaceholder tab="progress" description={NAV_DESCRIPTIONS.progress} />
    ),
    settings: (
      <HevyTabPlaceholder tab="settings" description={NAV_DESCRIPTIONS.settings} />
    ),
  };

  return <HevyShell sections={sections} />;
}

function HevyTabPlaceholder({
  tab,
  description,
}: {
  tab: HevyTabId;
  description: string;
}) {
  return (
    <div className="hevy-surface flex min-h-[360px] flex-col items-center justify-center gap-4 rounded-3xl p-10 text-center text-white">
      <Clock3 className="size-10 text-white/40" />
      <div>
        <p className="text-2xl font-semibold capitalize">{tab} workspace</p>
        <p className="text-sm text-white/60">{description}</p>
      </div>
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">
        Full feature set coming in later milestones
      </p>
    </div>
  );
}
