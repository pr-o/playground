'use client';

type NumberPadProps = {
  digits?: number[];
  onInput?: (value: number) => void;
  onErase?: () => void;
  notesEnabled?: boolean;
  onToggleNotes?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onHint?: () => void;
};

const baseButtonClass =
  'flex flex-1 min-w-[64px] items-center justify-center rounded-lg border border-border bg-background px-4 py-3 text-base font-semibold text-foreground shadow-sm hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40';

export function NumberPad({
  digits = [1, 2, 3, 4, 5, 6],
  onInput,
  onErase,
  notesEnabled,
  onToggleNotes,
  onUndo,
  onRedo,
  onHint,
}: NumberPadProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        {digits.map((digit) => (
          <button
            key={digit}
            type="button"
            className={baseButtonClass}
            onClick={() => onInput?.(digit)}
          >
            {digit}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button type="button" className={baseButtonClass} onClick={onErase}>
          Erase
        </button>
        <button
          type="button"
          className={`${baseButtonClass} ${notesEnabled ? 'border-primary text-primary' : ''}`}
          onClick={onToggleNotes}
        >
          Notes {notesEnabled ? 'On' : 'Off'}
        </button>
        <button type="button" className={baseButtonClass} onClick={onHint}>
          Hint
        </button>
        <button type="button" className={baseButtonClass} onClick={onUndo}>
          Undo
        </button>
        <button type="button" className={baseButtonClass} onClick={onRedo}>
          Redo
        </button>
      </div>
    </div>
  );
}
