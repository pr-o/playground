import { expect, test, type Page } from '@playwright/test';

const RNG_SEQUENCE = [0.12, 0.42, 0.18, 0.68, 0.33, 0.77, 0.52, 0.91, 0.07];
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;

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

const enableTetrisTestHarness = async (page: Page) => {
  await page.addInitScript(() => {
    (window as unknown as { __TETRIS_TEST_ENABLED__?: boolean }).__TETRIS_TEST_ENABLED__ =
      true;
  });
};

const waitForTestController = async (page: Page) => {
  await page.waitForFunction(() => {
    return Boolean(
      (window as unknown as { __TETRIS_TEST_CONTROLLER__?: unknown })
        .__TETRIS_TEST_CONTROLLER__,
    );
  });
};

const setTetrisState = async (
  page: Page,
  nextState: Partial<{
    board: (string | null)[][];
    queue: string[];
    stats: { score: number; lines: number; level: number };
    active: null;
    hold: string | null;
    canHold: boolean;
    isGameOver: boolean;
  }>,
) => {
  await page.evaluate((state) => {
    const controller = (
      window as unknown as {
        __TETRIS_TEST_CONTROLLER__?: {
          setState: (
            update:
              | Record<string, unknown>
              | ((previous: Record<string, unknown>) => Record<string, unknown>),
          ) => void;
        };
      }
    ).__TETRIS_TEST_CONTROLLER__;

    if (!controller) {
      throw new Error('Missing Tetris test controller');
    }

    controller.setState((prev: Record<string, unknown>) => ({
      ...prev,
      ...state,
    }));
  }, nextState);
};

const waitForActivePiece = async (page: Page, pieceId: string) => {
  await page.waitForFunction((expectedId) => {
    const controller = (
      window as unknown as {
        __TETRIS_TEST_CONTROLLER__?: {
          getState: () => { active?: { id?: string } | null } | null;
        };
      }
    ).__TETRIS_TEST_CONTROLLER__;

    return controller?.getState()?.active?.id === expectedId;
  }, pieceId);
};

const createEmptyBoard = (): (string | null)[][] =>
  Array.from({ length: BOARD_HEIGHT }, () =>
    Array.from({ length: BOARD_WIDTH }, () => null as string | null),
  );

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

  test('shows pause overlay when toggled via keyboard', async ({ page }) => {
    await injectDeterministicRandom(page);

    await page.goto('/games/tetris');

    const main = page.getByRole('main');
    const startButton = page.getByRole('button', { name: /start game/i });

    await startButton.waitFor({ state: 'visible' });
    await startButton.click();

    await page.waitForSelector('text=Ready to Stack?', { state: 'detached' });

    await page.keyboard.press('KeyP');

    const pauseHeading = page.getByRole('heading', { name: /paused/i });
    await pauseHeading.waitFor({ state: 'visible' });
    await page.waitForTimeout(300);

    await expect(main).toHaveScreenshot('tetris/pause-overlay.png', {
      animations: 'disabled',
    });
  });

  test('captures single-line clear animation', async ({ page }) => {
    await enableTetrisTestHarness(page);
    await injectDeterministicRandom(page);
    await page.goto('/games/tetris');

    const main = page.getByRole('main');
    const startButton = page.getByRole('button', { name: /start game/i });

    await startButton.waitFor({ state: 'visible' });
    await startButton.click();
    await page.waitForSelector('text=Ready to Stack?', { state: 'detached' });
    await waitForTestController(page);

    const board = createEmptyBoard();
    board[19] = ['T', 'T', 'T', 'T', 'J', 'J', null, null, null, null];

    await setTetrisState(page, {
      board,
      queue: ['I', 'O', 'T', 'S'],
      active: null,
      hold: null,
      canHold: true,
      stats: { score: 0, lines: 0, level: 1 },
      isGameOver: false,
    });

    await waitForActivePiece(page, 'I');

    for (let i = 0; i < 3; i += 1) {
      await page.keyboard.press('ArrowRight');
    }

    await page.keyboard.press('Space');

    await page.waitForFunction(() => {
      const controller = (
        window as unknown as {
          __TETRIS_TEST_CONTROLLER__?: {
            getState: () => { stats?: { lines?: number } } | null;
          };
        }
      ).__TETRIS_TEST_CONTROLLER__;
      return controller?.getState()?.stats?.lines === 1;
    });

    await page.waitForTimeout(400);

    await expect(main).toHaveScreenshot('tetris/line-clear.png', {
      animations: 'disabled',
    });
  });

  test('shows game-over overlay with leaderboard prompt', async ({ page }) => {
    await enableTetrisTestHarness(page);
    await injectDeterministicRandom(page);
    await page.goto('/games/tetris');

    const main = page.getByRole('main');
    const startButton = page.getByRole('button', { name: /start game/i });

    await startButton.waitFor({ state: 'visible' });
    await startButton.click();
    await page.waitForSelector('text=Ready to Stack?', { state: 'detached' });
    await waitForTestController(page);

    const board = createEmptyBoard();
    // Fill the board with various blocks, including the spawn row to force a failure.
    for (let row = 0; row < BOARD_HEIGHT; row += 1) {
      for (let col = 0; col < BOARD_WIDTH; col += 1) {
        if (row <= 1 || row >= BOARD_HEIGHT - 5) {
          board[row][col] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'][(row + col) % 7];
        } else if (row % 2 === 0 && col % 3 === 0) {
          board[row][col] = 'L';
        }
      }
    }

    await setTetrisState(page, {
      board,
      queue: ['I', 'O', 'T', 'S'],
      active: null,
      hold: null,
      canHold: false,
      stats: { score: 8420, lines: 22, level: 3 },
      isGameOver: false,
    });

    await page.waitForFunction(() => {
      const controller = (
        window as unknown as {
          __TETRIS_TEST_CONTROLLER__?: {
            getState: () => { isGameOver?: boolean } | null;
          };
        }
      ).__TETRIS_TEST_CONTROLLER__;
      return controller?.getState()?.isGameOver === true;
    });

    const gameOverHeading = page.getByRole('heading', { name: /game over/i });
    await gameOverHeading.waitFor({ state: 'visible' });
    await page.waitForTimeout(400);

    await expect(main).toHaveScreenshot('tetris/game-over.png', {
      animations: 'disabled',
    });
  });
});
