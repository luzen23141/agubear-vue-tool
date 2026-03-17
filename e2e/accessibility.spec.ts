import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function gotoAndWaitForStablePage(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle');
  await expect(page.locator('body')).toBeVisible();

  if (path !== '/') {
    await expect.poll(() => new URL(page.url()).pathname).toBe(path);
  }
}

test.describe('Accessibility Analysis', () => {
  test('should not have any automatically detectable accessibility issues on the home page', async ({
    page
  }) => {
    await gotoAndWaitForStablePage(page, '/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  const tools = ['timestamp', 'hash', 'base64', 'url', 'json', 'qrcode'];

  for (const tool of tools) {
    test(`should not have any accessibility issues on the ${tool} tool page`, async ({ page }) => {
      await gotoAndWaitForStablePage(page, `/zh-TW/${tool}`);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .disableRules(['color-contrast'])
        .analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
