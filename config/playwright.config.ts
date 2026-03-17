import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const reporter = process.env.PLAYWRIGHT_JSON_OUTPUT_NAME
  ? [['list'], ['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT_NAME }]]
  : [['html', { outputFolder: 'playwright-report' }]];

export default defineConfig({
  testDir: '../e2e',
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
    url: 'http://localhost:5173',
    reuseExistingServer: !isCI
  }
});
