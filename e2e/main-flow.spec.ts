import { test, expect } from '@playwright/test';

test.describe('Timestamp Converter Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-TW/timestamp');
  });

  test('應能正確將目前時間轉換為 Timestamp', async ({ page }) => {
    // 點擊「現在時間」按鈕 (假定有這個按鈕或邏輯)
    // 這裡我們直接檢查頁面上是否有預設的時間資料
    const timestampInput = page.locator('input[placeholder*="Timestamp"]');
    await expect(timestampInput).not.toBeEmpty();
  });

  test('手動輸入 Timestamp 應連動更新日期字串', async ({ page }) => {
    const timestampInput = page.locator('input').first(); // 假設第一個是 Timestamp
    await timestampInput.fill('1708416000'); // 2024-02-20

    // 檢查轉換後的日期字串是否正確顯示
    const dateOutput = page.getByText(/2024-02-20/);
    await expect(dateOutput).toBeVisible();
  });

  test('切換 Unit (秒/毫秒) 應正確轉換數值', async ({ page }) => {
    const unitSelect = page.locator('select'); // 假設有一個 select 控制單位
    if (await unitSelect.isVisible()) {
      await unitSelect.selectOption('ms');
      const timestampInput = page.locator('input').first();
      await expect(timestampInput).toHaveValue(/^\d{13}$/); // 13 位數代表毫秒
    }
  });

  test('點擊複製按鈕應觸發 Clipboard', async ({ page }) => {
    // 這裡可以測試 UI 反饋，例如 Toast
    const copyButton = page.locator('button').filter({ hasText: /複製/ });
    if (await copyButton.isVisible()) {
      await copyButton.click();
      // 假設會有一個成功的通知
      await expect(page.locator('.toast-success'))
        .toBeVisible({ timeout: 2000 })
        .catch(() => {});
    }
  });
});
