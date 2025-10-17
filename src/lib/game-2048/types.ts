export type MoveDirection = 'up' | 'down' | 'left' | 'right';

export interface Cell {
  id: string;
  value: number;
  mergedFrom?: [string, string] | null;
}

export type Grid = (Cell | null)[][];

export interface GameMetrics {
  totalMoves: number;
  totalFours: number;
  gamesStarted: number;
  maxTile: number;
  undoUses: number;
}

export interface Achievement {
  id: string;
  label: string;
  description?: string;
  icon: string;
  unlockedAt: number | null;
  progress: number;
  target: number;
}

export interface AchievementDefinition
  extends Omit<Achievement, 'progress' | 'unlockedAt'> {
  trackKey: keyof GameMetrics;
}

export interface GameSnapshot {
  grid: Grid;
  score: number;
  moveCount: number;
  maxTile: number;
  timestamp: number;
}

export interface GameState {
  grid: Grid;
  score: number;
  bestScore: number;
  hasWon: boolean;
  isOver: boolean;
  moveCount: number;
  maxTile: number;
  metrics: GameMetrics;
  achievements: Achievement[];
  history: GameSnapshot[];
  rngSeed?: number;
}
