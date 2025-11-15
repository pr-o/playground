import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Clock3,
  Flame,
  Target,
  TrendingUp,
} from 'lucide-react';

import { HevyShell } from '@/components/apps/hevy/HevyShell';
import { HEVY_NAV_ITEMS, type HevyTabId } from '@/components/apps/hevy/nav-data';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Hevy Fitness Performance Dashboard',
  description:
    'Recreation of the Hevy workout logging experience with responsive layout, bottom nav, and Radix-driven UI patterns.',
};

const readinessDetails = [
  {
    label: 'Sleep',
    value: '7h 42m',
    trend: '+36m vs avg',
  },
  {
    label: 'Recovery',
    value: 'HRV · 112',
    trend: 'Neutral',
  },
  {
    label: 'Stress',
    value: 'Low',
    trend: 'Breath score · 86',
  },
];

const quickStats = [
  {
    label: 'Weekly volume',
    value: '42,180 lb',
    delta: '+8%',
  },
  {
    label: 'Sessions',
    value: '4 / 5',
    delta: 'One left',
  },
  {
    label: 'Avg intensity',
    value: 'RPE 8.2',
    delta: 'Heavy push',
  },
  {
    label: 'Streak',
    value: '12 days',
    delta: 'Keep it going',
  },
];

const nextWorkout = {
  name: 'Pull · Week 3',
  day: 'Today · 6:00 PM',
  duration: '70 min',
  focus: 'Back & Posterior Chain',
  exercises: [
    { name: 'Conventional Deadlift', scheme: '4 × 5 · 315 lb' },
    { name: 'Weighted Pull-ups', scheme: '4 × 8 · +45 lb' },
    { name: 'Single-arm Row', scheme: '3 × 10 · 80 lb' },
  ],
};

const trainingFocus = [
  { label: 'Push', completion: 60 },
  { label: 'Pull', completion: 40 },
  { label: 'Legs', completion: 100 },
  { label: 'Core', completion: 80 },
];

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

function HevyHomeContent() {
  return (
    <div className="space-y-6 pb-10">
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="hevy-surface col-span-12 flex flex-col gap-6 rounded-3xl p-6 lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Daily readiness
              </p>
              <div className="mt-3 flex items-baseline gap-4">
                <span className="text-5xl font-semibold text-white">82%</span>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                  Primed
                </div>
              </div>
              <p className="text-sm text-white/70">
                Solid sleep + low stress. Heavy pulls encouraged.
              </p>
            </div>
            <ToggleGroup
              type="single"
              defaultValue="today"
              className="rounded-full border border-white/10 bg-white/5 p-1 text-xs text-white/75"
            >
              {['today', 'week', 'month'].map((id) => (
                <ToggleGroupItem
                  key={id}
                  value={id}
                  className="rounded-full px-4 py-1.5 capitalize text-white/70 data-[state=on]:bg-white data-[state=on]:text-slate-900"
                >
                  {id}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {readinessDetails.map((detail) => (
              <div
                key={detail.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-white/60">
                  {detail.label}
                </p>
                <p className="mt-2 text-lg font-semibold">{detail.value}</p>
                <p className="text-sm text-white/60">{detail.trend}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-transparent p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <Flame className="size-4 text-orange-300" />
                <span>Fatigue · 28%</span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="size-4 text-sky-300" />
                <span>Goal focus · Pull emphasis</span>
              </div>
            </div>
            <Progress
              value={72}
              className="mt-3 h-3 overflow-hidden rounded-full border border-white/5 bg-white/10"
            />
          </div>
        </div>
        <div className="hevy-surface col-span-12 flex flex-col gap-4 rounded-3xl p-6 lg:col-span-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Next workout
              </p>
              <p className="text-lg font-semibold">{nextWorkout.name}</p>
              <p className="text-sm text-white/60">
                {nextWorkout.day} · {nextWorkout.duration}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
              <p className="text-xs text-white/60">Focus</p>
              <p className="text-sm text-white">{nextWorkout.focus}</p>
            </div>
          </div>
          <div className="space-y-3">
            {nextWorkout.exercises.map((exercise) => (
              <div
                key={exercise.name}
                className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-white">{exercise.name}</p>
                  <p className="text-xs text-white/60">{exercise.scheme}</p>
                </div>
                <CheckCircle2 className="size-5 text-emerald-300" />
              </div>
            ))}
          </div>
          <Button className="mt-auto w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950">
            Preview workout
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <div
            key={stat.label}
            className="hevy-surface rounded-3xl p-5 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              {stat.label}
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{stat.value}</span>
              <span className="text-sm text-emerald-300">{stat.delta}</span>
            </div>
            <TrendingUp className="mt-4 size-5 text-white/30" />
          </div>
        ))}
      </section>

      <section className="hevy-surface rounded-3xl p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              Training focus
            </p>
            <p className="text-lg font-semibold">Split coverage</p>
          </div>
          <Button variant="ghost" className="text-white/70 hover:text-white">
            View planner
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {trainingFocus.map((block) => (
            <div
              key={block.label}
              className={cn(
                'rounded-2xl border border-white/10 bg-white/5 p-4',
                block.completion === 100 && 'border-emerald-400/50 bg-emerald-400/10',
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{block.label}</p>
                <span className="text-xs text-white/60">{block.completion}%</span>
              </div>
              <Progress
                value={block.completion}
                className="mt-3 h-2 overflow-hidden rounded-full border border-white/5 bg-white/10"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
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
