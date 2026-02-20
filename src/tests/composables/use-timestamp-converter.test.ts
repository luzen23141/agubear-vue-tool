/**
 * UseTimestampConverter Composable 擴展測試
 * 覆蓋 watch 行為、utcOffset、useMilliseconds、timestampLength、邊界案例
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { nextTick } from 'vue';
import { UseTimestampConverter } from '../../composables/use-timestamp-converter';

const addToHistoryMock = vi.fn();

describe('UseTimestampConverter (extended)', () => {
  beforeEach(() => {
    addToHistoryMock.mockClear();
  });

  // --- timestampLength ---
  describe('timestampLength', () => {
    it('應正確計算 10 位時間戳的位數', () => {
      const { timestampInput, timestampLength } = UseTimestampConverter(addToHistoryMock);
      timestampInput.value = '1700000000';
      expect(timestampLength.value).toBe(10);
    });

    it('應正確計算 13 位時間戳的位數', () => {
      const { timestampInput, timestampLength } = UseTimestampConverter(addToHistoryMock);
      timestampInput.value = '1700000000000';
      expect(timestampLength.value).toBe(13);
    });

    it('空值應回傳 0', () => {
      const { timestampInput, timestampLength } = UseTimestampConverter(addToHistoryMock);
      timestampInput.value = '';
      expect(timestampLength.value).toBe(0);
    });
  });

  // --- utcOffset ---
  describe('utcOffset', () => {
    it('預設應為 UTC+8', () => {
      const { utcOffset } = UseTimestampConverter(addToHistoryMock);
      expect(utcOffset.value).toBe(8);
    });

    it('修改 utcOffset 應影響轉換結果', () => {
      const { timestampInput, dateResult, convertToDate, utcOffset } =
        UseTimestampConverter(addToHistoryMock);

      timestampInput.value = '0';
      utcOffset.value = 0;
      convertToDate();
      expect(dateResult.value).toContain('1970-01-01 00:00:00');

      utcOffset.value = 8;
      convertToDate();
      expect(dateResult.value).toContain('1970-01-01 08:00:00');
    });
  });

  // --- useMilliseconds ---
  describe('useMilliseconds', () => {
    it('預設應為 false (秒)', () => {
      const { useMilliseconds } = UseTimestampConverter(addToHistoryMock);
      expect(useMilliseconds.value).toBe(false);
    });

    it('開啟毫秒模式應產生 13 位時間戳', () => {
      const { dateInput, timestampResult, convertToTimestamp, useMilliseconds } =
        UseTimestampConverter(addToHistoryMock);

      dateInput.value = '2023-11-15 06:13:20';
      useMilliseconds.value = true;
      convertToTimestamp();

      expect(timestampResult.value).toBe(1_700_000_000_000);
    });

    it('關閉毫秒模式應產生 10 位時間戳', () => {
      const { dateInput, timestampResult, convertToTimestamp, useMilliseconds } =
        UseTimestampConverter(addToHistoryMock);

      dateInput.value = '2023-11-15 06:13:20';
      useMilliseconds.value = false;
      convertToTimestamp();

      expect(timestampResult.value).toBe(1_700_000_000);
    });
  });

  // --- timestampMode ---
  describe('timestampMode', () => {
    it('預設應為 auto', () => {
      const { timestampMode } = UseTimestampConverter(addToHistoryMock);
      expect(timestampMode.value).toBe('auto');
    });
  });

  // --- convertToDate edge cases ---
  describe('convertToDate 邊界案例', () => {
    it('無效輸入不應呼叫 addToHistory', () => {
      const { timestampInput, convertToDate } = UseTimestampConverter(addToHistoryMock);
      timestampInput.value = 'abc';
      convertToDate();
      expect(addToHistoryMock).not.toHaveBeenCalled();
    });

    it('空輸入應產生錯誤訊息', () => {
      const { timestampInput, dateResult, convertToDate } = UseTimestampConverter(addToHistoryMock);
      timestampInput.value = '';
      convertToDate();
      expect(dateResult.value).toContain('無效');
    });

    it('負數時間戳應正確轉換', () => {
      const { timestampInput, dateResult, convertToDate, utcOffset } =
        UseTimestampConverter(addToHistoryMock);
      timestampInput.value = '-86400';
      utcOffset.value = 8;
      convertToDate();
      expect(dateResult.value).toContain('1969');
      expect(addToHistoryMock).toHaveBeenCalled();
    });
  });

  // --- convertToTimestamp edge cases ---
  describe('convertToTimestamp 邊界案例', () => {
    it('無效日期不應呼叫 addToHistory', () => {
      const { dateInput, convertToTimestamp } = UseTimestampConverter(addToHistoryMock);
      dateInput.value = 'invalid-date';
      convertToTimestamp();
      expect(addToHistoryMock).not.toHaveBeenCalled();
    });

    it('無效日期應產生錯誤訊息', () => {
      const { dateInput, timestampResult, convertToTimestamp } =
        UseTimestampConverter(addToHistoryMock);
      dateInput.value = 'not-a-date';
      convertToTimestamp();
      expect(timestampResult.value).toContain('無效');
    });

    it('輸入非數字字元應被過濾', async () => {
      const { timestampInput } = UseTimestampConverter(addToHistoryMock);
      timestampInput.value = '123abc456';
      await nextTick();
      expect(timestampInput.value).toBe('123456');
    });

    it('輸入長度超過 15 位應被截斷', async () => {
      const { timestampInput } = UseTimestampConverter(addToHistoryMock);
      timestampInput.value = '12345678901234567890';
      await nextTick();
      expect(timestampInput.value).toBe('123456789012345');
      expect(timestampInput.value.length).toBe(15);
    });
  });

  // --- No addToHistory callback ---
  describe('無 addToHistory 回呼', () => {
    it('不傳 addToHistory 也不應報錯', () => {
      const { timestampInput, convertToDate } = UseTimestampConverter();
      timestampInput.value = '1700000000';
      expect(() => convertToDate()).not.toThrow();
    });

    it('convertToTimestamp 不傳 addToHistory 也不應報錯', () => {
      const { dateInput, convertToTimestamp } = UseTimestampConverter();
      dateInput.value = '2023-11-15 06:13:20';
      expect(() => convertToTimestamp()).not.toThrow();
    });
  });

  // --- Watch behavior ---
  describe('watch 自動重新計算', () => {
    it('修改 utcOffset 應自動更新 dateResult', async () => {
      const { timestampInput, dateResult, utcOffset, convertToDate } =
        UseTimestampConverter(addToHistoryMock);

      timestampInput.value = '1700000000';
      convertToDate();
      const result1 = dateResult.value;

      utcOffset.value = 0;
      await nextTick();

      // dateResult should have been updated by watchEffect
      expect(dateResult.value).not.toBe(result1);
    });

    it('修改 useMilliseconds 應自動更新 timestampResult', async () => {
      const { dateInput, timestampResult, useMilliseconds, convertToTimestamp } =
        UseTimestampConverter(addToHistoryMock);

      dateInput.value = '2023-11-15 06:13:20';
      useMilliseconds.value = false;
      convertToTimestamp();
      const result1 = timestampResult.value;

      useMilliseconds.value = true;
      await nextTick();

      // timestampResult should have been recalculated
      expect(timestampResult.value).not.toBe(result1);
    });
  });

  // --- 初始化 ---
  describe('初始化', () => {
    it('timestampInput 應初始化為當前秒級時間戳', () => {
      const before = Math.floor(Date.now() / 1000);
      const { timestampInput } = UseTimestampConverter(addToHistoryMock);
      const after = Math.floor(Date.now() / 1000);
      const ts = Number(timestampInput.value);
      expect(ts).toBeGreaterThanOrEqual(before);
      expect(ts).toBeLessThanOrEqual(after);
    });

    it('dateInput 應初始化為當前日期時間格式', () => {
      const { dateInput } = UseTimestampConverter(addToHistoryMock);
      // Format: yyyy-MM-dd HH:mm:ss
      expect(dateInput.value).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    });

    it('dateResult 和 timestampResult 應初始化為空字串', () => {
      const { dateResult, timestampResult } = UseTimestampConverter(addToHistoryMock);
      expect(dateResult.value).toBe('');
      expect(timestampResult.value).toBe('');
    });
  });
});
