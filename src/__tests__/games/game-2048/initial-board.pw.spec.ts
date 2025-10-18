import { expect, test } from '@playwright/test';

test.describe('2048 initial board render', () => {
  test('matches landing layout', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
    });

    await page.goto('/2048');
    await page.waitForLoadState('networkidle');

    const board = page.getByTestId('board');
    await board.waitFor({ state: 'visible' });
    await page.waitForTimeout(400);

    await expect(page).toHaveScreenshot('game-2048/initial.png', {
      fullPage: true,
    });
  });
});
