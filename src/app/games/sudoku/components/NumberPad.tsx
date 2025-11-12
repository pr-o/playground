'use client';

type NumberPadProps = {
  digits?: number[];
  onInput?: (value: number) => void;
  onErase?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  disabled?: boolean;
};

const baseButtonClass =
  'flex flex-1 min-w-[64px] items-center justify-center rounded-lg border border-border bg-background px-4 py-3 text-base font-semibold text-foreground shadow-sm transition-colors hover:bg-background/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60';

export function NumberPad({
  digits = [1, 2, 3, 4, 5, 6],
  onInput,
  onErase,
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = false,
  disabled = false,
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
            disabled={disabled}
          >
            {digit}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          className={baseButtonClass}
          onClick={onErase}
          disabled={disabled}
        >
          Erase
        </button>
        <button
          type="button"
          className={baseButtonClass}
          onClick={onUndo}
          disabled={disabled || !canUndo}
        >
          Undo
        </button>
        <button
          type="button"
          className={baseButtonClass}
          onClick={onRedo}
          disabled={disabled || !canRedo}
        >
          Redo
        </button>
      </div>
    </div>
  );
}
