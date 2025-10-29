'use client';

import { memo, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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

const computeGhostOffsets = (board: Board, active: ActivePiece) => {
  if (!active) return null;
  if (board.length === 0 || board[0].length === 0) {
    return [];
  }

  let offset = 0;

  outer: while (true) {
    for (const { row, col } of active.shape) {
      const nextRow = active.position.row + row + offset + 1;
      const nextCol = active.position.col + col;

      if (nextCol < 0 || nextCol >= board[0].length) {
        break outer;
      }

      if (nextRow >= board.length) {
        break outer;
      }

      if (nextRow >= 0 && board[nextRow][nextCol] !== null) {
        break outer;
      }
    }

    offset += 1;
  }

  if (offset === 0) {
    return active.shape.map(({ row, col }) => ({
      row: active.position.row + row,
      col: active.position.col + col,
    }));
  }

  return active.shape.map(({ row, col }) => ({
    row: active.position.row + row + offset,
    col: active.position.col + col,
  }));
};

const ActiveCells = ({ active }: { active: ActivePiece }) => {
  const previousRowRef = useRef(active.position.row);
  const previousRotationRef = useRef(active.rotation);
  const previousIdRef = useRef(active.id);
  const firstRenderRef = useRef(true);

  const dropDistance = active.position.row - previousRowRef.current;
  const isHardDrop = dropDistance > 1;
  const rotationChanged = active.rotation !== previousRotationRef.current;
  const isNewPiece = previousIdRef.current !== active.id;
  const shouldAnimateEntrance =
    firstRenderRef.current || isNewPiece || rotationChanged || isHardDrop;

  useEffect(() => {
    firstRenderRef.current = false;
    previousRowRef.current = active.position.row;
    previousRotationRef.current = active.rotation;
    previousIdRef.current = active.id;
  }, [active.position.row, active.rotation, active.id]);

  const cellTransition = isHardDrop
    ? { duration: 0.08, ease: 'easeOut' }
    : { type: 'spring', stiffness: 360, damping: rotationChanged ? 18 : 24, mass: 0.38 };

  return (
    <motion.div
      className="absolute inset-0"
      initial={shouldAnimateEntrance ? { opacity: 0, scale: 0.95 } : false}
      animate={{ opacity: 1, scale: rotationChanged ? 1.04 : 1 }}
      transition={{ duration: rotationChanged ? 0.18 : 0.14, ease: 'easeOut' }}
    >
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
              'shadow-[0_0_10px_rgba(255,255,255,0.28)]',
            )}
            style={{ width: CELL_SIZE, height: CELL_SIZE, top, left }}
            initial={
              shouldAnimateEntrance
                ? { opacity: 0, scale: isHardDrop ? 0.9 : 0.85, top, left }
                : false
            }
            animate={{ opacity: 1, scale: 1, top, left }}
            transition={cellTransition}
          />
        );
      })}
    </motion.div>
  );
};

const GhostCells = ({
  cells,
  id,
}: {
  cells: Array<{ row: number; col: number }>;
  id: TetrominoId;
}) => (
  <>
    {cells.map(({ row, col }, index) => {
      if (row < 0) return null;
      const top = getCellCoordinate(row);
      const left = getCellCoordinate(col);
      return (
        <motion.div
          key={`ghost-${index}`}
          className={cn('absolute rounded-sm border', TETROMINO_COLORS[id])}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            opacity: 0.22,
          }}
          initial={{ opacity: 0, scale: 0.9, top, left }}
          animate={{ opacity: 0.22, scale: 1, top, left }}
          transition={{ duration: 0.12, ease: 'easeOut' }}
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
  const ghostCells = useMemo(
    () => (active ? (computeGhostOffsets(board, active) ?? []) : []),
    [board, active],
  );

  return (
    <div
      className="relative flex-shrink-0 overflow-hidden rounded-lg border border-border bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 shadow-inner"
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
        <AnimatePresence initial={false}>
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
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            />
          ))}
        </AnimatePresence>
      </div>

      {active && (
        <>
          <GhostCells cells={ghostCells} id={active.id} />
          <ActiveCells active={active} />
        </>
      )}
    </div>
  );
});
