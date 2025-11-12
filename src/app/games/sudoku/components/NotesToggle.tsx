'use client';

type NotesToggleProps = {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
};

export function NotesToggle({ enabled, onToggle, disabled }: NotesToggleProps) {
  return (
    <button
      type="button"
      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        enabled
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border bg-background text-foreground'
      } disabled:cursor-not-allowed disabled:opacity-60`}
      onClick={onToggle}
      disabled={disabled}
    >
      Notes {enabled ? 'On' : 'Off'}
    </button>
  );
}
