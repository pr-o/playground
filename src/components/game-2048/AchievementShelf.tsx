import type { LucideIcon } from 'lucide-react';
import { Award, Crown, Gem, Sparkles, Sprout, Star } from 'lucide-react';
import type { Achievement } from '@/lib/game-2048';
import { cn } from '@/lib/utils';

const iconMap: Record<string, LucideIcon> = {
  star: Star,
  sparkles: Sparkles,
  sprout: Sprout,
  crown: Crown,
  gem: Gem,
};

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
});

const getProgressWidth = (ratio: number, isUnlocked: boolean) => {
  if (isUnlocked) {
    return 100;
  }
  if (ratio <= 0) {
    return 0;
  }
  const percent = Math.max(6, Math.min(100, Math.round(ratio * 100)));
  return percent;
};

function AchievementBadge({ achievement }: { achievement: Achievement }) {
  const Icon = iconMap[achievement.icon] ?? Award;
  const ratio =
    achievement.target > 0 ? Math.min(1, achievement.progress / achievement.target) : 0;
  const progressPercent = Math.round(ratio * 100);
  const isUnlocked = Boolean(achievement.unlockedAt);
  const progressLabel = isUnlocked
    ? 'Completed'
    : `${numberFormatter.format(achievement.progress)}/${numberFormatter.format(achievement.target)}`;
  const filledWidth = getProgressWidth(ratio, isUnlocked);

  return (
    <div
      className={cn(
        'flex min-h-[164px] flex-col gap-3 rounded-2xl border px-4 py-4 transition',
        isUnlocked
          ? 'border-emerald-400/50 bg-emerald-500/10 shadow-[0_8px_30px_-12px_rgb(16_185_129/0.45)]'
          : 'border-border/60 bg-background/60 backdrop-blur',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full border text-foreground transition',
            isUnlocked
              ? 'border-emerald-300/70 bg-emerald-500/20 text-emerald-900 dark:text-emerald-100'
              : 'border-border/80 bg-muted text-muted-foreground',
          )}
        >
          <Icon className={cn('h-5 w-5', isUnlocked ? 'opacity-100' : 'opacity-80')} />
        </div>
        <span
          className={cn(
            'rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]',
            isUnlocked
              ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-200'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {isUnlocked ? 'Unlocked' : `${progressPercent}%`}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <h4 className="text-sm font-semibold text-foreground">{achievement.label}</h4>
        {achievement.description ? (
          <p className="text-xs text-muted-foreground">{achievement.description}</p>
        ) : null}
      </div>
      <div className="mt-auto">
        <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
          <span>{progressLabel}</span>
          {!isUnlocked ? <span>{progressPercent}%</span> : null}
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              'h-full rounded-full transition-[width]',
              isUnlocked ? 'bg-emerald-500' : 'bg-foreground/60',
            )}
            style={{ width: `${filledWidth}%` }}
          />
        </div>
      </div>
    </div>
  );
}

type AchievementShelfProps = {
  achievements: Achievement[];
  onReset?: () => void;
};

export function AchievementShelf({ achievements, onReset }: AchievementShelfProps) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card/60 p-5 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-lg uppercase tracking-[0.1em] font-bold text-foreground">
            Achievements
          </p>
        </div>
        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-border bg-background/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground/40"
          >
            Reset progress
          </button>
        ) : null}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {achievements.map((achievement) => (
          <AchievementBadge key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  );
}
