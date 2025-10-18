import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/__tests__',
  testMatch: /.*\.pw\.spec\.(js|ts)/,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    },
  },
  use: {
    baseURL: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://127.0.0.1:3001',
    viewport: { width: 1280, height: 720 },
    browserName: 'chromium',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'off',
  },
  reporter: [['list']],
  webServer: {
    command:
      process.env.PLAYWRIGHT_TEST_WEB_SERVER_CMD ??
      'npm run start -- --hostname 127.0.0.1 --port 3001',
    url: process.env.PLAYWRIGHT_TEST_BASE_URL ?? 'http://127.0.0.1:3001',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
});
