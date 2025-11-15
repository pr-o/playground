import { useEffect } from 'react';

type SelectionNavigationOptions = {
  disabled?: boolean;
  onMove: (rowDelta: number, colDelta: number) => void;
  onInput: (value: number) => void;
  onErase: () => void;
  onToggleNotes: () => void;
  onUndo: (withRedo?: boolean) => void;
  onRedo: () => void;
  onHint: () => void;
};

const DIGIT_REGEX = /^[1-6]$/;

export function useSelectionNavigation({
  disabled,
  onMove,
  onInput,
  onErase,
  onToggleNotes,
  onUndo,
  onRedo,
  onHint,
}: SelectionNavigationOptions) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const tagName = (event.target as HTMLElement | null)?.tagName;
      if (tagName && ['INPUT', 'TEXTAREA'].includes(tagName)) {
        return;
      }

      if (event.key.startsWith('Arrow')) {
        event.preventDefault();
        if (event.key === 'ArrowUp') onMove(-1, 0);
        if (event.key === 'ArrowDown') onMove(1, 0);
        if (event.key === 'ArrowLeft') onMove(0, -1);
        if (event.key === 'ArrowRight') onMove(0, 1);
        return;
      }

      if (DIGIT_REGEX.test(event.key)) {
        event.preventDefault();
        onInput(Number(event.key));
        return;
      }

      if (event.key === 'Backspace' || event.key === 'Delete') {
        event.preventDefault();
        onErase();
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        onUndo(event.shiftKey);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'y') {
        event.preventDefault();
        onRedo();
        return;
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        onToggleNotes();
        return;
      }

      if (event.key.toLowerCase() === 'h') {
        event.preventDefault();
        onHint();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onErase, onHint, onInput, onMove, onRedo, onToggleNotes, onUndo]);
}
