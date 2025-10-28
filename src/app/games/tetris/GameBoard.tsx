'use client';

import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ActivePiece, Board, TetrominoId } from '@/lib/tetris';
import { cn } from '@/lib/utils';

type GameBoardProps = {
  board: Board;
  active: ActivePiece | null;
};

const COLORS: Record<TetrominoId, string> = {
  I: 'bg-cyan-400 border-cyan-300',
  O: 'bg-amber-300 border-amber-200',
  T: 'bg-purple-400 border-purple-300',
  S: 'bg-emerald-400 border-emerald-300',
  Z: 'bg-rose-400 border-rose-300',
  J: 'bg-blue-400 border-blue-300',
  L: 'bg-orange-400 border-orange-300',
};

const CELL_SIZE = 28;

const ActiveCells = ({ active }: { active: ActivePiece }) => {
  return (
    <>
      {active.shape.map(({ row, col }, index) => {
        const top = (active.position.row + row) * CELL_SIZE;
        const left = (active.position.col + col) * CELL_SIZE;

        return (
          <motion.div
            key={`active-${index}`}
            className={cn(
              'absolute rounded-sm border',
              COLORS[active.id],
              'shadow-[0_0_8px_rgba(255,255,255,0.25)]',
            )}
            style={{ width: CELL_SIZE, height: CELL_SIZE }}
            initial={{ opacity: 0, scale: 0.9, top, left }}
            animate={{ opacity: 1, scale: 1, top, left }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          />
        );
      })}
    </>
  );
};

export const GameBoard = memo(function GameBoard({ board, active }: GameBoardProps) {
  const cells = useMemo(() => {
    const rendered: Array<{ key: string; id: TetrominoId }> = [];
    board.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell) {
          rendered.push({
            key: `${rowIndex}-${colIndex}`,
            id: cell,
          });
        }
      });
    });
    return rendered;
  }, [board]);

  return (
    <div
      className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-inner"
      style={{
        width: CELL_SIZE * board[0].length + 32,
        height: CELL_SIZE * board.length + 32,
      }}
    >
      <div
        className="grid gap-[2px] bg-slate-800/60 p-2"
        style={{
          gridTemplateColumns: `repeat(${board[0].length}, ${CELL_SIZE}px)`,
          gridTemplateRows: `repeat(${board.length}, ${CELL_SIZE}px)`,
          width: CELL_SIZE * board[0].length,
          height: CELL_SIZE * board.length,
        }}
      >
        {Array.from({ length: board.length * board[0].length }).map((_, index) => (
          <div key={index} className="rounded-sm bg-slate-900/70" />
        ))}
        {cells.map(({ key, id }) => (
          <motion.div
            key={key}
            className={cn(
              'rounded-sm border',
              COLORS[id],
              'shadow-[0_0_6px_rgba(255,255,255,0.18)]',
            )}
            layoutId={key}
          />
        ))}
      </div>

      {active && <ActiveCells active={active} />}
    </div>
  );
});
