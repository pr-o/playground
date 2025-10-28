'use client';

import { memo, useMemo } from 'react';
import type { TetrominoId } from '@/lib/tetris';
import { getTetrominoShape } from '@/lib/tetris';
import { cn } from '@/lib/utils';
import { TETROMINO_COLORS } from './pieceColors';

type TetrominoPreviewProps = {
  id: TetrominoId | null;
  className?: string;
};

const GRID_SIZE = 4;
const CELL_SIZE = 18;

export const TetrominoPreview = memo(function TetrominoPreview({
  id,
  className,
}: TetrominoPreviewProps) {
  const cells = useMemo(() => {
    if (!id) return [];

    const shape = getTetrominoShape(id, 0);
    const rows = shape.map((cell) => cell.row);
    const cols = shape.map((cell) => cell.col);
    const minRow = Math.min(...rows);
    const maxRow = Math.max(...rows);
    const minCol = Math.min(...cols);
    const maxCol = Math.max(...cols);
    const height = maxRow - minRow + 1;
    const width = maxCol - minCol + 1;

    const offsetRow = Math.floor((GRID_SIZE - height) / 2);
    const offsetCol = Math.floor((GRID_SIZE - width) / 2);

    return shape.map(({ row, col }) => ({
      row: row - minRow + offsetRow,
      col: col - minCol + offsetCol,
    }));
  }, [id]);

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-md border px-2 py-3 border-border/60 bg-background/70',
        className,
      )}
    >
      <div
        className="relative grid bg-slate-900/50"
        style={{
          width: GRID_SIZE * CELL_SIZE,
          height: GRID_SIZE * CELL_SIZE,
          gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
          gap: 2,
          padding: 4,
          borderRadius: 8,
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => (
          <div
            key={index}
            className="rounded-sm border border-border/10 bg-slate-950/50"
          />
        ))}
        {cells.map(({ row, col }, index) => (
          <div
            key={`${id}-${index}`}
            className={cn(
              'absolute rounded-sm border shadow-[0_0_6px_rgba(255,255,255,0.2)]',
              id ? TETROMINO_COLORS[id] : '',
            )}
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              transform: `translate(${col * (CELL_SIZE + 2) + 4}px, ${
                row * (CELL_SIZE + 2) + 4
              }px)`,
            }}
          />
        ))}
      </div>
    </div>
  );
});
