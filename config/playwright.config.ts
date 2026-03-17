import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

const isCI = !!process.env.CI;
const projectRoot = resolve(import.meta.dirname, '..');
const reporter = process.env.PLAYWRIGHT_JSON_OUTPUT_NAME
  ? [['list'], ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME }]]
  : [['html', { outputFolder: resolve(projectRoot, 'playwright-report') }]];

export default defineConfig({
  testDir: resolve(projectRoot, 'e2e'),
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    timezoneId: 'Asia/Taipei',
    locale: 'zh-TW'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  webServer: {
    command: 'pnpm run dev',
    cwd: projectRoot,
    url: 'http://localhost:5173',
    reuseExistingServer: !isCI
  }
});
