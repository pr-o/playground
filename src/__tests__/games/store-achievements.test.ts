import { ACHIEVEMENT_DEFINITIONS } from '@/lib/game-2048/achievements';
import { DEFAULT_GAME_METRICS } from '@/lib/game-2048/constants';
import { createEmptyGrid } from '@/lib/game-2048/logic';
import type { Achievement, GameSnapshot } from '@/lib/game-2048/types';
import { useGame2048Store } from '@/store/game-2048';

const definitionById = Object.fromEntries(
  ACHIEVEMENT_DEFINITIONS.map((definition) => [definition.id, definition]),
);

const buildAchievement = (
  id: Achievement['id'],
  progress: number,
  unlocked: boolean = false,
): Achievement => {
  const base = definitionById[id];
  if (!base) {
    throw new Error(`Unknown achievement id: ${id}`);
  }
  return {
    ...base,
    progress,
    unlockedAt: unlocked ? Date.now() : null,
  };
};

const resetStore = () => {
  useGame2048Store.getState().hydrate(null);
};

describe('achievement ordering and progress', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  it('sorts achievements by completion ratio and moves completed ones to the back', () => {
    const metrics = {
      ...DEFAULT_GAME_METRICS,
      totalMoves: 24,
      undoUses: 5,
    };

    useGame2048Store.getState().hydrate({ metrics, grid: createEmptyGrid() });
    const sortedIds = useGame2048Store
      .getState()
      .achievements.map((achievement) => achievement.id);

    expect(sortedIds.slice(0, 3)).toEqual(['25_moves', '50_moves', '100_moves']);
    expect(sortedIds.at(-1)).toBe('undo_5');
  });

  it('increments undo achievement progress and reorders after undo action', () => {
    const metrics = { ...DEFAULT_GAME_METRICS, undoUses: 4, totalMoves: 12 };

    const historyEntry: GameSnapshot = {
      grid: createEmptyGrid(),
      score: 0,
      moveCount: 0,
      maxTile: 0,
      timestamp: Date.now(),
    };

    useGame2048Store.getState().hydrate({
      metrics,
      grid: createEmptyGrid(),
      history: [historyEntry],
      isOver: false,
      hasWon: false,
    });

    const undoResult = useGame2048Store.getState().undo();
    expect(undoResult).toBe(true);

    const state = useGame2048Store.getState();
    const undoAchievement = state.achievements.find(
      (achievement) => achievement.id === 'undo_5',
    );

    expect(undoAchievement?.progress).toBe(5);
    expect(undoAchievement?.unlockedAt).not.toBeNull();
    expect(state.achievements.at(-1)?.id).toBe('undo_5');
  });
});
