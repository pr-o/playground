'use client';

import type { TetrominoId } from '@/lib/tetris';

export const TETROMINO_COLORS: Record<TetrominoId, string> = {
  I: 'bg-cyan-400 border-cyan-300',
  O: 'bg-amber-300 border-amber-200',
  T: 'bg-purple-400 border-purple-300',
  S: 'bg-emerald-400 border-emerald-300',
  Z: 'bg-rose-400 border-rose-300',
  J: 'bg-blue-400 border-blue-300',
  L: 'bg-orange-400 border-orange-300',
} as const;

export const getTetrominoTone = (id: TetrominoId): string => TETROMINO_COLORS[id];
