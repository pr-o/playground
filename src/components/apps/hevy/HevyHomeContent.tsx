'use client';

import * as React from 'react';
import { CheckCircle2, ChevronRight, Flame, Target } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { cn } from '@/lib/utils';
import { HevyProgress } from './primitives';
import { useHevyDashboard } from '@/store/hevy/hooks';

export function HevyHomeContent() {
  const { readiness, nextWorkout, quickStats, trainingFocus } = useHevyDashboard();
  const [range, setRange] = React.useState<'today' | 'week' | 'month'>('today');

  if (!readiness) {
    return null;
  }

  const readinessMetrics = readiness.metrics ?? [];
  const fatigue = readiness.fatigue ?? { label: 'Fatigue', value: '--' };
  const focus = readiness.focus ?? { label: 'Goal focus', value: '--' };

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
                <span className="text-5xl font-semibold text-white">
                  {readiness.score}%
                </span>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
                  {readiness.badgeLabel}
                </div>
              </div>
              <p className="text-sm text-white/70">{readiness.summary}</p>
            </div>
            <ToggleGroup
              type="single"
              value={range}
              onValueChange={(value) => value && setRange(value as typeof range)}
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
            {readinessMetrics.map((detail) => (
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
                <span>
                  {fatigue.label} · {fatigue.value}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Target className="size-4 text-sky-300" />
                <span>
                  {focus.label} · {focus.value}
                </span>
              </div>
            </div>
            <HevyProgress value={readiness.score} className="mt-3" />
          </div>
        </div>
        <div className="hevy-surface col-span-12 flex flex-col gap-4 rounded-3xl p-6 lg:col-span-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Next workout
              </p>
              <p className="text-lg font-semibold">
                {nextWorkout ? nextWorkout.name : 'No workout scheduled'}
              </p>
              <p className="text-sm text-white/60">
                {nextWorkout ? (
                  <>
                    {nextWorkout.dayLabel} · {nextWorkout.durationMinutes} min
                  </>
                ) : (
                  'Add a routine to schedule your next session.'
                )}
              </p>
            </div>
            {nextWorkout ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                <p className="text-xs text-white/60">Focus</p>
                <p className="text-sm text-white">{nextWorkout.focus}</p>
              </div>
            ) : null}
          </div>
          <div className="space-y-3">
            {nextWorkout ? (
              nextWorkout.exercises.map((exercise) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{exercise.name}</p>
                    <p className="text-xs text-white/60">{exercise.scheme}</p>
                  </div>
                  <CheckCircle2 className="size-5 text-emerald-300" />
                </div>
              ))
            ) : (
              <p className="text-sm text-white/60">
                Create a workout template to see the breakdown here.
              </p>
            )}
          </div>
          <Button className="mt-auto w-full rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950">
            {nextWorkout ? 'Preview workout' : 'Schedule workout'}
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => (
          <div
            key={stat.id}
            className="hevy-surface rounded-3xl p-5 text-white shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
          >
            <p className="text-xs uppercase tracking-[0.3em] text-white/60">
              {stat.label}
            </p>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{stat.value}</span>
              <span className="text-sm text-emerald-300">{stat.delta}</span>
            </div>
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
              key={block.id}
              className={cn(
                'rounded-2xl border border-white/10 bg-white/5 p-4',
                block.completion === 100 && 'border-emerald-400/50 bg-emerald-400/10',
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{block.label}</p>
                <span className="text-xs text-white/60">{block.completion}%</span>
              </div>
              <HevyProgress value={block.completion} className="mt-3 h-2" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
