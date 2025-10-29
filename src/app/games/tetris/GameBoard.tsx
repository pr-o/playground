'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ActivePiece, Board, TetrominoId } from '@/lib/tetris';
import { cn } from '@/lib/utils';
import { TETROMINO_COLORS } from './pieceColors';

type GameBoardProps = {
  board: Board;
  active: ActivePiece | null;
};

const CELL_SIZE = 28;
const BOARD_PADDING = 16; // matches Tailwind p-4 (1rem)
const GRID_PADDING = 8; // matches Tailwind p-2 (0.5rem)
const GRID_GAP = 2; // matches Tailwind gap-[2px]

const getCellCoordinate = (index: number) =>
  BOARD_PADDING + GRID_PADDING + index * (CELL_SIZE + GRID_GAP);

const ActiveCells = ({ active }: { active: ActivePiece }) => (
  <>
    {active.shape.map(({ row, col }, index) => {
      const targetRow = active.position.row + row;
      const targetCol = active.position.col + col;
      const top = getCellCoordinate(targetRow);
      const left = getCellCoordinate(targetCol);

      return (
        <motion.div
          key={`active-${index}`}
          className={cn(
            'absolute rounded-sm border',
            TETROMINO_COLORS[active.id],
            'shadow-[0_0_8px_rgba(255,255,255,0.25)]',
          )}
          style={{ width: CELL_SIZE, height: CELL_SIZE, top, left }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1, top, left }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        />
      );
    })}
  </>
);

export const GameBoard = memo(function GameBoard({ board, active }: GameBoardProps) {
  const cells = useMemo(() => {
    const rendered: Array<{ key: string; id: TetrominoId; row: number; col: number }> =
      [];
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          rendered.push({
            key: `${rowIndex}-${colIndex}`,
            id: cell,
            row: rowIndex,
            col: colIndex,
          });
        }
      });
    });
    return rendered;
  }, [board]);

  const columns = board[0]?.length ?? 0;
  const rows = board.length;
  const gridWidth =
    columns * CELL_SIZE + Math.max(0, columns - 1) * GRID_GAP + GRID_PADDING * 2;
  const gridHeight =
    rows * CELL_SIZE + Math.max(0, rows - 1) * GRID_GAP + GRID_PADDING * 2;
  const containerWidth = gridWidth + BOARD_PADDING * 2;
  const containerHeight = gridHeight + BOARD_PADDING * 2;

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-inner"
      style={{
        width: containerWidth,
        height: containerHeight,
      }}
    >
      <div
        className="grid gap-[2px] bg-slate-800/60 p-2"
        style={{
          gridTemplateColumns: `repeat(${columns}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${rows}, ${CELL_SIZE}px)`,
          width: gridWidth,
          height: gridHeight,
        }}
      >
        {Array.from({ length: rows * columns }).map((_, index) => (
          <div key={`bg-${index}`} className="rounded-sm bg-slate-900/70" />
        ))}
        {cells.map(({ key, id, row, col }) => (
          <motion.div
            key={key}
            className={cn(
              'rounded-sm border',
              TETROMINO_COLORS[id],
              'shadow-[0_0_6px_rgba(255,255,255,0.18)]',
            )}
            style={{
              gridColumn: `${col + 1} / span 1`,
              gridRow: `${row + 1} / span 1`,
              width: CELL_SIZE,
              height: CELL_SIZE,
              opacity: 0.6,
            }}
            layoutId={key}
          />
        ))}
      </div>

      {active && <ActiveCells active={active} />}
    </div>
  );
});
