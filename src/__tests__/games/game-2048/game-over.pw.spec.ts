import { expect, test } from '@playwright/test';

const STORAGE_KEYS = {
  state: '2048_clone/state',
  bestScore: '2048_clone/best_score',
  achievements: '2048_clone/achievements',
} as const;

const gameOverFixture = {
  grid: [
    [
      { id: 'tile-a', value: 2, mergedFrom: null },
      { id: 'tile-b', value: 4, mergedFrom: null },
      { id: 'tile-c', value: 8, mergedFrom: null },
      { id: 'tile-d', value: 16, mergedFrom: null },
    ],
    [
      { id: 'tile-e', value: 2, mergedFrom: null },
      { id: 'tile-f', value: 32, mergedFrom: null },
      { id: 'tile-g', value: 64, mergedFrom: null },
      { id: 'tile-h', value: 128, mergedFrom: null },
    ],
    [
      { id: 'tile-i', value: 8, mergedFrom: null },
      { id: 'tile-j', value: 16, mergedFrom: null },
      { id: 'tile-k', value: 32, mergedFrom: null },
      { id: 'tile-l', value: 64, mergedFrom: null },
    ],
    [
      { id: 'tile-m', value: 16, mergedFrom: null },
      { id: 'tile-n', value: 128, mergedFrom: null },
      { id: 'tile-o', value: 256, mergedFrom: null },
      { id: 'tile-p', value: 512, mergedFrom: null },
    ],
  ],
  score: 0,
  moveCount: 0,
  maxTile: 512,
  hasWon: false,
  isOver: false,
  history: [],
  metrics: {
    totalMoves: 0,
    totalFours: 0,
    gamesStarted: 1,
    maxTile: 512,
    undoUses: 0,
  },
  rngSeed: 1357,
  savedAt: 0,
};

test.describe('2048 game over overlay', () => {
  test('surfaces modal when no moves remain', async ({ page }) => {
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
        state: { persisted: gameOverFixture, bestScore: 0 },
        keys: STORAGE_KEYS,
        rngValues: [0, 0.1],
      },
    );

    await page.goto('/games/game-2048');

    const board = page.getByTestId('board');
    await board.waitFor({ state: 'visible' });
    await expect(board).toHaveAttribute('data-game-hydrated', 'true');

    await page.waitForFunction(() => Boolean(window.__game2048Store));

    await page.evaluate(() => {
      const store = window.__game2048Store;
      if (!store) return;
      store.setState((state) => ({
        ...state,
        isOver: true,
        hasWon: false,
        hasMoves: false,
      }));
    });

    const overlay = page.getByTestId('game-over-overlay');
    await overlay.waitFor({ state: 'visible' });

    await expect(overlay).toHaveText(/Game over/i);
    await expect(overlay).toHaveScreenshot('game-2048/game-over.png');
  });
});
