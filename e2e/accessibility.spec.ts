import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Analysis', () => {
  test('should not have any automatically detectable accessibility issues on the home page', async ({
    page
  }) => {
    await page.goto('/');

    // Wait for the page to be stable
    await page.waitForLoadState('networkidle');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .disableRules(['color-contrast'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  const tools = ['timestamp', 'hash', 'base64', 'url', 'json', 'qrcode'];

  for (const tool of tools) {
    test(`should not have any accessibility issues on the ${tool} tool page`, async ({ page }) => {
      await page.goto(`/zh-TW/${tool}`);
      await page.waitForLoadState('networkidle');

      const accessibilityScanResults = await new AxeBuilder({ page })
        .disableRules(['color-contrast'])
        .analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });
  }
});
