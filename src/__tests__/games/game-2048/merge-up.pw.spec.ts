import { expect, test } from '@playwright/test';

const STORAGE_KEYS = {
  state: '2048_clone/state',
  bestScore: '2048_clone/best_score',
  achievements: '2048_clone/achievements',
} as const;

const fixtureState = {
  grid: [
    [{ id: 'tile-a', value: 2, mergedFrom: null }, null, null, null],
    [{ id: 'tile-b', value: 2, mergedFrom: null }, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ],
  score: 0,
  moveCount: 0,
  maxTile: 2,
  hasWon: false,
  isOver: false,
  history: [],
  metrics: {
    totalMoves: 0,
    totalFours: 0,
    gamesStarted: 0,
    maxTile: 2,
    undoUses: 0,
  },
  rngSeed: 1234,
  savedAt: 0,
};

test.describe('2048 merge move', () => {
  test('merges upward tiles and bumps score', async ({ page }) => {
    await page.addInitScript(
      ({ state, keys, rngValues }) => {
        window.localStorage.clear();
        window.localStorage.setItem(keys.state, JSON.stringify(state.persisted));
        window.localStorage.setItem(keys.bestScore, JSON.stringify(state.bestScore));
        window.localStorage.removeItem(keys.achievements);

        const sequence = Array.isArray(rngValues) ? [...rngValues] : [];
        let index = 0;
        const originalRandom = Math.random.bind(Math);
        Math.random = () => {
          if (index < sequence.length) {
            const value = sequence[index];
            index += 1;
            return value;
          }
          return originalRandom();
        };
      },
      {
        state: { persisted: fixtureState, bestScore: 0 },
        keys: STORAGE_KEYS,
        rngValues: [0, 0],
      },
    );

    await page.goto('/games/game-2048');

    const board = page.getByTestId('board');
    await board.waitFor({ state: 'visible' });
    await expect(board).toHaveAttribute('data-game-hydrated', 'true');

    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(600);

    const scoreValue = page.getByTestId('score-card-score-value');
    await expect(scoreValue).toHaveText('4');

    await expect(board).toHaveScreenshot('game-2048/merge-up.png');
  });
});
