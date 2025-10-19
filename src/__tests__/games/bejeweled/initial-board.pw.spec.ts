import { expect, test, type TestInfo } from '@playwright/test';
import { promises as fs } from 'node:fs';
import { dirname } from 'node:path';

declare global {
  interface Window {
    __BEJEWELED_DEBUG__?: () => { rows: number; cols: number; tileCount: number };
  }
}

test.describe('Bejeweled initial board render', () => {
  test('matches initial board state snapshot', async ({ page }) => {
    await page.goto('/games/bejeweled');

    const host = page.getByTestId('bejeweled-host');
    await host.waitFor({ state: 'visible' });
    const wrapper = page.getByTestId('bejeweled-wrapper');

    await page.waitForFunction(() => typeof window.__BEJEWELED_DEBUG__ === 'function');

    const boardState = await page.evaluate(() => window.__BEJEWELED_DEBUG__?.());

    expect(boardState).toBeTruthy();
    await matchJsonSnapshot(boardState, 'initial-board-state.json', test.info());

    await page.waitForTimeout(200);
    await expect(wrapper).toHaveScreenshot('bejeweled/initial-board.png', {
      animations: 'disabled',
    });
  });
});

async function matchJsonSnapshot(data: unknown, snapshotName: string, info: TestInfo) {
  if (!data) {
    throw new Error('Received falsy data for snapshot comparison');
  }

  const snapshotPath = info.snapshotPath(snapshotName);

  if (
    info.config.updateSnapshots === 'all' ||
    info.config.updateSnapshots === 'missing'
  ) {
    await fs.mkdir(dirname(snapshotPath), { recursive: true });
    await fs.writeFile(snapshotPath, JSON.stringify(data, null, 2));
    return;
  }

  const raw = await fs.readFile(snapshotPath, 'utf-8');
  const parsed = JSON.parse(raw);
  expect(data).toEqual(parsed);
}
