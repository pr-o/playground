import { expect, test } from '@playwright/test';

const STORAGE_KEYS = {
  state: '2048_clone/state',
  bestScore: '2048_clone/best_score',
  achievements: '2048_clone/achievements',
} as const;

const undoFixture = {
  grid: [
    [
      { id: 'tile-a', value: 2, mergedFrom: null },
      { id: 'tile-b', value: 2, mergedFrom: null },
      null,
      null,
    ],
    [{ id: 'tile-c', value: 4, mergedFrom: null }, null, null, null],
    [null, null, null, null],
    [null, null, null, null],
  ],
  score: 0,
  moveCount: 0,
  maxTile: 4,
  hasWon: false,
  isOver: false,
  history: [],
  metrics: {
    totalMoves: 0,
    totalFours: 0,
    gamesStarted: 1,
    maxTile: 4,
    undoUses: 0,
  },
  rngSeed: 2468,
  savedAt: 0,
};

test.describe('2048 undo interactions', () => {
  test('restores board and metrics after undo', async ({ page }) => {
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
        state: { persisted: undoFixture, bestScore: 0 },
        keys: STORAGE_KEYS,
        rngValues: [0.25, 0.3],
      },
    );

    await page.goto('/games/game-2048');

    const board = page.getByTestId('board');
    await board.waitFor({ state: 'visible' });
    await expect(board).toHaveAttribute('data-game-hydrated', 'true');

    await page.waitForFunction(() => Boolean(window.__game2048Store));

    await page.waitForFunction(() => Boolean(window.__game2048Store));

    await page.evaluate(() => {
      window.__game2048Store?.getState().move('right');
    });

    await page.waitForFunction(() => {
      const state = window.__game2048Store?.getState();
      return state?.score === 4 && state.grid[0]?.[3]?.value === 4;
    });

    const scoreValue = page.getByTestId('score-card-score-value').last();
    await expect(scoreValue).toHaveText('4');

    await page.evaluate(() => {
      window.__game2048Store?.getState().undo();
    });

    await page.waitForFunction(() => {
      const state = window.__game2048Store?.getState();
      return state?.score === 0 && state.grid[0]?.[0]?.value === 2;
    });

    await expect(scoreValue).toHaveText('0');

    await expect(board).toHaveScreenshot('game-2048/undo.png');
  });
});
