'use client';

type NextPuzzleButtonProps = {
  onNext: () => void;
  disabled?: boolean;
};

export function NextPuzzleButton({ onNext, disabled }: NextPuzzleButtonProps) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground shadow-sm transition hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
      onClick={onNext}
      disabled={disabled}
    >
      Next Puzzle
    </button>
  );
}
