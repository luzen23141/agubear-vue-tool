import { test, expect, type Page } from '@playwright/test';

test.describe('AguBear Tools E2E', () => {
  test('應能成功載入首頁並檢查標題', async ({ page }: { page: Page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AguBear Tools/);
  });

  test('視覺回歸測試：首頁截圖比對', async ({ page }: { page: Page }) => {
    await page.goto('/');
    // 第一次執行會產出基準圖，後續執行會進行比對
    await expect(page).toHaveScreenshot('homepage.png', {
      maxDiffPixelRatio: 0.1
    });
  });

  test('功能測試：切換分頁', async ({ page }: { page: Page }) => {
    await page.goto('/');
    const hashTab = page.getByRole('tab', { name: /MD5/i });
    await hashTab.click();
    await expect(hashTab).toHaveClass(/active/);
  });

  test('視覺回歸測試：手機版面配置', async ({ page }: { page: Page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page).toHaveScreenshot('mobile-layout.png', {
      maxDiffPixelRatio: 0.1
    });
  });
});
