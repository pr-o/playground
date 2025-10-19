import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import layouts from './debug-layouts.json';

type TileId = 'red' | 'blue' | 'green' | 'yellow' | 'orange' | 'pink';
type ClusterSummary = {
  directions: Array<'row' | 'col'>;
  tiles: Array<{ row: number; col: number }>;
};

declare global {
  interface Window {
    __BEJEWELED_DEBUG_SET_LAYOUT__?: (layout: string[][]) => ClusterSummary[];
    __BEJEWELED_DEBUG_HIGHLIGHT__?: () => ClusterSummary[];
    __BEJEWELED_DEBUG_CLEAR__?: () => void;
  }
}

const cloneLayout = (layout: TileId[][]): TileId[][] =>
  layout.map((row) => row.slice() as TileId[]);

async function applyLayout(page: Page, layout: TileId[][]): Promise<ClusterSummary[]> {
  return page.evaluate((layout) => {
    const setter = window.__BEJEWELED_DEBUG_SET_LAYOUT__;
    if (!setter) {
      throw new Error('Debug layout setter is not available');
    }
    return setter(layout);
  }, layout);
}

test.describe('Bejeweled debug overlay', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/bejeweled');
    await page.waitForFunction(
      () =>
        typeof window.__BEJEWELED_DEBUG_SET_LAYOUT__ === 'function' &&
        typeof window.__BEJEWELED_DEBUG_HIGHLIGHT__ === 'function',
    );
  });

  test.afterEach(async ({ page }) => {
    await page.evaluate(() => {
      window.__BEJEWELED_DEBUG_CLEAR__?.();
    });
  });

  test('highlights a horizontal match', async ({ page }) => {
    const wrapper = page.getByTestId('bejeweled-wrapper');
    await wrapper.waitFor({ state: 'visible' });

    const layout = cloneLayout(layouts.horizontal as TileId[][]);

    const clusters = await applyLayout(page, layout);

    expect(
      clusters.some(
        (cluster) =>
          cluster.directions.includes('row') && !cluster.directions.includes('col'),
      ),
    ).toBeTruthy();

    await page.waitForTimeout(100);
    await expect(wrapper).toHaveScreenshot('bejeweled/debug-horizontal.png', {
      animations: 'disabled',
    });
  });

  test('highlights a vertical match', async ({ page }) => {
    const wrapper = page.getByTestId('bejeweled-wrapper');
    await wrapper.waitFor({ state: 'visible' });

    const layout = cloneLayout(layouts.vertical as TileId[][]);

    const clusters = await applyLayout(page, layout);

    expect(
      clusters.some(
        (cluster) =>
          cluster.directions.includes('col') && !cluster.directions.includes('row'),
      ),
    ).toBeTruthy();

    await page.waitForTimeout(100);
    await expect(wrapper).toHaveScreenshot('bejeweled/debug-vertical.png', {
      animations: 'disabled',
    });
  });

  test('highlights both horizontal and vertical matches', async ({ page }) => {
    const wrapper = page.getByTestId('bejeweled-wrapper');
    await wrapper.waitFor({ state: 'visible' });

    const layout = cloneLayout(layouts.cross as TileId[][]);

    const clusters = await applyLayout(page, layout);
    const directions = new Set(clusters.flatMap((cluster) => cluster.directions));

    expect(directions.has('row')).toBeTruthy();
    expect(directions.has('col')).toBeTruthy();

    await page.waitForTimeout(100);
    await expect(wrapper).toHaveScreenshot('bejeweled/debug-cross.png', {
      animations: 'disabled',
    });
  });

  test('highlights overlapping L and T shaped matches', async ({ page }) => {
    const wrapper = page.getByTestId('bejeweled-wrapper');
    await wrapper.waitFor({ state: 'visible' });

    const layout = cloneLayout(layouts.lAndT as TileId[][]);

    const clusters = await applyLayout(page, layout);

    expect(
      clusters.some(
        (cluster) => cluster.directions.length > 1 && cluster.tiles.length >= 5,
      ),
    ).toBeTruthy();

    await page.waitForTimeout(100);
    await expect(wrapper).toHaveScreenshot('bejeweled/debug-l-and-t.png', {
      animations: 'disabled',
    });
  });
});
