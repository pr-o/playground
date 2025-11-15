'use client';

type HintButtonProps = {
  remaining: number;
  max: number;
  onHint: () => void;
  disabled?: boolean;
};

export function HintButton({ remaining, max, onHint, disabled }: HintButtonProps) {
  const exhausted = remaining <= 0;
  return (
    <button
      type="button"
      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        exhausted
          ? 'border-border bg-muted text-muted-foreground'
          : 'border-amber-400 bg-amber-50 text-amber-900'
      } disabled:cursor-not-allowed disabled:opacity-60`}
      onClick={onHint}
      disabled={disabled || exhausted}
    >
      Hint ({remaining}/{max})
    </button>
  );
}
