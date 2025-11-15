import type { Difficulty } from '@/lib/sudoku-mini';

type DifficultyPickerProps = {
  value: Difficulty;
  options: { id: Difficulty; label: string }[];
  onChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
};

export function DifficultyPicker({
  value,
  options,
  onChange,
  disabled,
}: DifficultyPickerProps) {
  return (
    <select
      className="w-36 rounded-md border border-border bg-background/80 px-2 py-1 text-sm font-semibold text-foreground shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
      value={value}
      onChange={(event) => onChange(event.target.value as Difficulty)}
      disabled={disabled}
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
