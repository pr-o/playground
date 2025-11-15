import { expect, test, type Page } from '@playwright/test';

const ROUTE = '/games/sudoku';
const BOARD_SELECTOR = '[data-testid="mini-sudoku-cell-0-0"]';

const loadPuzzle = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
  });
  await page.goto(ROUTE);
  await page.waitForSelector(BOARD_SELECTOR, { state: 'visible' });
  // Allow initial layout animations to complete for stable snapshots.
  await page.waitForTimeout(200);
};

test.describe('Mini Sudoku (desktop)', () => {
  test('matches desktop snapshot', async ({ page }) => {
    await loadPuzzle(page);
    await expect(page.locator('body')).toHaveScreenshot('mini-sudoku-desktop.png');
  });
});

test.describe('Mini Sudoku (mobile)', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('matches mobile snapshot', async ({ page }) => {
    await loadPuzzle(page);
    await expect(page.locator('body')).toHaveScreenshot('mini-sudoku-mobile.png');
  });
});
