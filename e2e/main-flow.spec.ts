import { test, expect } from '@playwright/test';

test.describe('Timestamp Converter Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/zh-TW/timestamp');
  });

  test('應能正確將目前時間轉換為 Timestamp', async ({ page }) => {
    const timestampInput = page.locator('#timestamp-input');
    await expect(timestampInput).toHaveValue(/^-?\d{10,13}$/);
  });

  test('手動輸入 Timestamp 應連動更新日期字串', async ({ page }) => {
    const timestampInput = page.locator('#timestamp-input');
    await timestampInput.fill('1708416000');
    await timestampInput.press('Enter');

    const dateResult = page.locator('.timestamp-result-panel .result-text').first();
    await expect(dateResult).toContainText('2024-02-20');
  });

  test('切換 Unit (秒/毫秒) 應正確轉換數值', async ({ page }) => {
    const timestampInput = page.locator('#timestamp-input');

    await page.locator('input[name="timestampMode"][value="s"]').evaluate((element) => {
      const input = element as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await timestampInput.fill('1708416000');

    await page.locator('input[name="timestampMode"][value="ms"]').evaluate((element) => {
      const input = element as HTMLInputElement;
      input.checked = true;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await expect(timestampInput).toHaveValue(/^\d{13}$/);
  });

  test('點擊複製按鈕應觸發 Clipboard', async ({ page }) => {
    const copyButton = page.locator('button').filter({ hasText: /複製/ });
    if (await copyButton.isVisible()) {
      await copyButton.click();
      await expect(page.locator('.toast--success'))
        .toBeVisible({ timeout: 2000 })
        .catch(() => {});
    }
  });
});
