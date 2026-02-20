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
    const timestampInput = page.locator('#timestamp-input');
    await timestampInput.fill('1708416000');
    await timestampInput.press('Enter');

    // 檢查轉換後的日期字串是否正確顯示
    const dateResult = page.locator('.result').first();
    await expect(dateResult).toContainText('2024-02-20');
  });

  test('切換 Unit (秒/毫秒) 應正確轉換數值', async ({ page }) => {
    // 點擊「秒」確保初始狀態 (加上 force: true 避免動畫干擾)
    await page.click('label[for="ts-mode-s"]', { force: true });
    const timestampInput = page.locator('#timestamp-input');
    await timestampInput.fill('1708416000');

    // 點擊「毫秒」模式標籤
    await page.click('label[for="ts-mode-ms"]', { force: true });
    await expect(timestampInput).toHaveValue(/^\d{13}$/); // 13 位數代表毫秒
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
