import { useMemo } from 'react';
import { getCandidateDigits } from '@/lib/sudoku-mini/helpers';
import type { MiniSudokuBoard } from '@/lib/sudoku-mini';

type UseAutoNotesOptions = {
  enabled: boolean;
  board: MiniSudokuBoard;
};

export function useAutoNotes({ enabled, board }: UseAutoNotesOptions) {
  return useMemo(() => {
    if (!enabled) {
      return board;
    }

    return board.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        if (cell.value !== null || cell.given) {
          return cell;
        }
        const candidates = getCandidateDigits(
          board.map((r) => r.map((c) => c.value)),
          rowIndex,
          colIndex,
        );
        if (!candidates.length) {
          return cell;
        }
        return {
          ...cell,
          notes: candidates,
        };
      }),
    );
  }, [board, enabled]);
}
