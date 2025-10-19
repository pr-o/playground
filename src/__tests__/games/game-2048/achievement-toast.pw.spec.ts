import { expect, test } from '@playwright/test';

const STORAGE_KEYS = {
  state: '2048_clone/state',
  bestScore: '2048_clone/best_score',
  achievements: '2048_clone/achievements',
} as const;

const toastSetupState = {
  grid: [
    [{ id: 'tile-a', value: 16, mergedFrom: null }, null, null, null],
    [{ id: 'tile-b', value: 16, mergedFrom: null }, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ],
  score: 0,
  moveCount: 0,
  maxTile: 16,
  hasWon: false,
  isOver: false,
  history: [],
  metrics: {
    totalMoves: 0,
    totalFours: 0,
    gamesStarted: 1,
    maxTile: 16,
    undoUses: 0,
  },
  rngSeed: 777,
  savedAt: 0,
};

test.describe('2048 achievement toast', () => {
  test('shows toast after unlocking new milestone', async ({ page }) => {
    await page.addInitScript(
      ({ state, keys, rngValues }) => {
        window.localStorage.clear();
        window.localStorage.setItem(keys.state, JSON.stringify(state.persisted));
        window.localStorage.setItem(keys.bestScore, JSON.stringify(state.bestScore));
        window.localStorage.removeItem(keys.achievements);

        const sequence = Array.isArray(rngValues) ? [...rngValues] : [];
        let index = 0;
        // temporarily stub `Math.random` to deterministic values because toast timing will vary
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
        state: { persisted: toastSetupState, bestScore: 0 },
        keys: STORAGE_KEYS,
        rngValues: [0.1, 0.05],
      },
    );

    await page.goto('/games/game-2048');

    const board = page.getByTestId('board');
    await board.waitFor({ state: 'visible' });
    await expect(board).toHaveAttribute('data-game-hydrated', 'true');

    await page.keyboard.press('ArrowUp');
    await page.waitForTimeout(800);

    await expect(page.getByTestId('score-card-score-value')).toHaveText('32');

    const toast = page.locator('[data-sonner-toast]').first();
    await toast.waitFor({ state: 'visible' });

    await expect(toast).toHaveScreenshot('game-2048/achievement-toast.png');
  });
});
