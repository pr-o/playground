import { expect, test, type Page } from '@playwright/test';

const RNG_SEQUENCE = [0.12, 0.42, 0.18, 0.68, 0.33, 0.77, 0.52, 0.91, 0.07];

const injectDeterministicRandom = async (page: Page) => {
  await page.addInitScript(
    ({ sequence }) => {
      const values = Array.isArray(sequence) ? [...sequence] : [];
      const originalRandom = Math.random.bind(Math);
      Math.random = () => {
        if (values.length > 0) {
          return values.shift()!;
        }
        return originalRandom();
      };
    },
    { sequence: RNG_SEQUENCE },
  );
};

test.describe('Tetris basic snapshots', () => {
  test('idle overlay renders on first load', async ({ page }) => {
    await page.goto('/games/tetris');

    const main = page.getByRole('main');
    const startButton = page.getByRole('button', { name: /start game/i });

    await startButton.waitFor({ state: 'visible' });
    await page.waitForTimeout(400);

    await expect(main).toHaveScreenshot('tetris/idle-screen.png', {
      animations: 'disabled',
    });
  });

  test('spawns first tetromino when starting the game', async ({ page }) => {
    await injectDeterministicRandom(page);

    await page.goto('/games/tetris');

    const main = page.getByRole('main');
    const startButton = page.getByRole('button', { name: /start game/i });

    await startButton.waitFor({ state: 'visible' });
    await startButton.click();

    await page.waitForSelector('text=Ready to Stack?', { state: 'detached' });
    await page.waitForTimeout(500);

    await expect(startButton).toHaveCount(0);
    await expect(main).toHaveScreenshot('tetris/game-start.png', {
      animations: 'disabled',
    });
  });
});
