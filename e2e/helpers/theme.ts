import { expect, type Page } from '@playwright/test';

export const THEMES = ['light', 'dark', 'high-contrast'] as const;

export type Theme = (typeof THEMES)[number];

export const setTheme = async (page: Page, theme: Theme) => {
  await page.goto('/');
  await page.evaluate((nextTheme: Theme) => {
    localStorage.setItem('agubear-theme', nextTheme);
  }, theme);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
};

export const gotoAndExpectTheme = async (
  page: Page,
  path: string,
  theme: Theme,
  options?: { waitForNetworkIdle?: boolean }
) => {
  await page.goto(path);
  if (options?.waitForNetworkIdle) {
    await page.waitForLoadState('networkidle');
  }
  await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
};
