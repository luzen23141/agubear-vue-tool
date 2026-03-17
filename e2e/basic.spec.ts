import { test, expect, type Page } from '@playwright/test';

const runVisualSnapshots = process.env.PLAYWRIGHT_VISUAL_SNAPSHOTS === 'true';

test.describe('AguBear Tools E2E', () => {
  test('應能成功載入首頁並檢查標題', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AguBear Tools/);
  });

  test('視覺回歸測試：首頁截圖比對', async ({ page }: { page: Page }) => {
    test.skip(!runVisualSnapshots, '僅在明確啟用視覺快照時執行');
    await page.goto('/');
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixelRatio: 0.1
    });
  });

  test('功能測試：切換分頁', async ({ page }: { page: Page }) => {
    await page.goto('/');
    const hashTab = page.getByRole('button', { name: /md5/i, exact: true });
    await hashTab.click();
    await expect(hashTab).toHaveClass(/active/);
  });

  test('視覺回歸測試：手機版面配置', async ({ page }: { page: Page }) => {
    test.skip(!runVisualSnapshots, '僅在明確啟用視覺快照時執行');
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('mobile-layout.png', {
      maxDiffPixelRatio: 0.1
    });
  });
});
