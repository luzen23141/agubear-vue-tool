/**
 * 時間戳轉換函式測試
 * 使用 data-driven 格式，方便新增測試案例
 */
import { describe, it, expect } from 'vitest';
import { timestampToDate, dateToTimestamp } from '../../utils/converter';

// ============================================
// timestampToDate 測試資料
// ============================================

const timestampToDateSuccessCases = [
  // Auto 模式 (依賴系統時區 Asia/Taipei / UTC+8)
  { input: 1700000000, mode: 'auto', expected: '2023-11-15 06:13:20', desc: '10位秒級時間戳' },
  {
    input: 1700000000123,
    mode: 'auto',
    expected: '2023-11-15 06:13:20.123',
    desc: '13位毫秒時間戳'
  },
  { input: 0, mode: 'auto', expected: '1970-01-01 08:00:00', desc: '時間戳 0 (Unix 紀元)' },
  { input: -100, mode: 'auto', expected: '1970-01-01 07:58:20', desc: '負數時間戳 (1970年前)' },

  // s 模式 (依賴系統時區 Asia/Taipei / UTC+8)
  { input: 1700000000, mode: 's', expected: '2023-11-15 06:13:20', desc: '[秒模式] 10位時間戳' },

  // ms 模式 (依賴系統時區 Asia/Taipei / UTC+8)
  {
    input: 1700000000123,
    mode: 'ms',
    expected: '2023-11-15 06:13:20.123',
    desc: '[毫秒模式] 13位時間戳'
  },
  // 極端日期 (改用 UTC+0 測試以確保環境一致性)
  {
    input: 253402300799,
    mode: 's',
    offset: 0,
    expected: '9999-12-31 23:59:59',
    desc: '極端未來 (9999年) UTC'
  },
  {
    input: -62135596800,
    mode: 's',
    offset: 0,
    expected: '0001-01-01 00:00:00',
    desc: '極端過去 (0001年) UTC'
  },
  // 閏年/平年 (改用 UTC+0 確保精確)
  {
    input: 951782400,
    mode: 's',
    offset: 0,
    expected: '2000-02-29 00:00:00',
    desc: '閏年 (2000) UTC'
  },
  {
    input: 4107456000,
    mode: 's',
    offset: 0,
    expected: '2100-02-28 00:00:00',
    desc: '平年 (2100) UTC'
  },
  {
    input: 1709164800,
    mode: 's',
    offset: 0,
    expected: '2024-02-29 00:00:00',
    desc: '一般閏年 (2024) UTC'
  }
];

const timestampToDateErrorCases = [
  { input: 'abc', mode: 'auto', desc: '非數字字串' },
  { input: 'not a number', mode: 'auto', desc: '一般文字' },
  { input: NaN, mode: 'auto', desc: 'NaN' },
  { input: undefined, mode: 'auto', desc: 'undefined' },
  { input: Symbol('test'), mode: 'auto', desc: 'Symbol (trigger catch)' },
  { input: 8640000000000001, mode: 'ms', desc: '超出 Date 範圍 (8.64e15)' }
];

// ============================================
// timestampToDate + utcOffset 測試
// ============================================

const timestampToDateTimezoneCases = [
  { input: 0, mode: 'auto', offset: 0, expected: '1970-01-01 00:00:00', desc: 'UTC+0 時間戳 0' },
  { input: 0, mode: 'auto', offset: 8, expected: '1970-01-01 08:00:00', desc: 'UTC+8 時間戳 0' },
  { input: 0, mode: 'auto', offset: -5, expected: '1969-12-31 19:00:00', desc: 'UTC-5 時間戳 0' },
  {
    input: 0,
    mode: 'auto',
    offset: 9,
    expected: '1970-01-01 09:00:00',
    desc: 'UTC+9 (東京) 時間戳 0'
  },
  {
    input: 1700000000,
    mode: 'auto',
    offset: 0,
    expected: '2023-11-14 22:13:20',
    desc: 'UTC+0 一般時間戳'
  },
  {
    input: 1700000000,
    mode: 'auto',
    offset: 8,
    expected: '2023-11-15 06:13:20',
    desc: 'UTC+8 一般時間戳'
  },
  {
    input: 1700000000,
    mode: 'auto',
    offset: 5.5,
    expected: '2023-11-15 03:43:20',
    desc: 'UTC+5:30 (印度) 一般時間戳'
  }
];

// ============================================
// dateToTimestamp 測試資料
// ============================================

const dateToTimestampSuccessCases = [
  // 成功轉換案例 (預設使用系統本地時區)
  { input: '2023-11-15T06:13:20', useMs: false, expected: 1700000000, desc: 'ISO 格式 (T分隔)' },
  { input: '2023-11-15 06:13:20', useMs: false, expected: 1700000000, desc: '空格分隔格式' },
  { input: '2023/11/15 06:13:20', useMs: false, expected: 1700000000, desc: '斜線分隔 (/)' },
  { input: '2023.11.15 06:13:20', useMs: false, expected: 1700000000, desc: '點分隔 (.)' },

  // 毫秒輸出
  { input: '2023-11-15 06:13:20', useMs: true, expected: 1700000000000, desc: '13位毫秒輸出' },

  // 帶毫秒的輸入
  { input: '2023-11-15 06:13:20.123', useMs: true, expectedMs: 123, desc: '帶毫秒輸入 (空格分隔)' },
  { input: '2023-11-15T06:13:20.456', useMs: true, expectedMs: 456, desc: '帶毫秒輸入 (ISO T分隔)' }
];

const dateToTimestampErrorCases = [
  { input: 'not-a-date', desc: '無效日期字串' },
  { input: '2023-13-45', desc: '超出範圍的月日' },
  { input: '', desc: '空字串' },
  { input: Symbol('test'), desc: 'Symbol (trigger catch)' }
];

// ============================================
// dateToTimestamp + utcOffset 測試
// ============================================

const dateToTimestampTimezoneCases = [
  { input: '1970-01-01 08:00:00', useMs: false, offset: 8, expected: 0, desc: 'UTC+8 → 時間戳 0' },
  { input: '1970-01-01 00:00:00', useMs: false, offset: 0, expected: 0, desc: 'UTC+0 → 時間戳 0' },
  {
    input: '2023-11-15 06:13:20',
    useMs: false,
    offset: 8,
    expected: 1700000000,
    desc: 'UTC+8 → 一般時間戳'
  },
  {
    input: '2023-11-14 22:13:20',
    useMs: false,
    offset: 0,
    expected: 1700000000,
    desc: 'UTC+0 → 一般時間戳'
  }
];

// ============================================
// 測試執行
// ============================================

describe('timestampToDate', () => {
  describe('成功轉換', () => {
    it.each(timestampToDateSuccessCases)('$desc', ({ input, mode, offset, expected }) => {
      const result = timestampToDate(input, mode, offset);
      expect(result.success).toBe(true);
      expect(result.value).toBe(expected);
    });
  });

  describe('錯誤處理', () => {
    it.each(timestampToDateErrorCases)('$desc: 應回傳失敗', ({ input, mode }) => {
      const result = timestampToDate(input, mode);
      expect(result.success).toBe(false);
      expect(result.value).toContain('無效');
    });
  });

  describe('特殊模式行為', () => {
    it('秒模式: 13位數值應視為秒 (產生遙遠未來)', () => {
      const result = timestampToDate(1700000000000, 's');
      expect(result.success).toBe(true);
      expect(result.value).toMatch(/^558\d{2}-/);
    });

    it('毫秒模式: 10位數值應視為毫秒 (產生1970年附近)', () => {
      const result = timestampToDate(1700000000, 'ms');
      expect(result.success).toBe(true);
      expect(result.value).toMatch(/^1970-01-2\d/);
    });

    it('應能處理科學記號字串', () => {
      const result = timestampToDate('1.7e9', 's', 0);
      expect(result.success).toBe(true);
      expect(result.value).toBe('2023-11-14 22:13:20');
    });
  });

  describe('時區轉換 (utcOffset)', () => {
    it.each(timestampToDateTimezoneCases)('$desc', ({ input, mode, offset, expected }) => {
      const result = timestampToDate(input, mode, offset);
      expect(result.success).toBe(true);
      expect(result.value).toBe(expected);
    });
  });
});

describe('dateToTimestamp', () => {
  describe('成功轉換', () => {
    it.each(dateToTimestampSuccessCases.filter((c) => c.expected !== undefined))(
      '$desc: $input',
      ({ input, useMs, expected }) => {
        const result = dateToTimestamp(input, useMs);
        expect(result.success).toBe(true);
        expect(result.value).toBe(expected);
      }
    );
  });

  describe('毫秒保留', () => {
    it.each(dateToTimestampSuccessCases.filter((c) => c.expectedMs !== undefined))(
      '$desc: 應保留毫秒 $expectedMs',
      ({ input, useMs, expectedMs }) => {
        const result = dateToTimestamp(input, useMs);
        expect(result.success).toBe(true);

        const date = new Date(result.value);
        expect(date.getMilliseconds()).toBe(expectedMs);
      }
    );
  });

  describe('錯誤處理', () => {
    it.each(dateToTimestampErrorCases)('$desc: 應回傳失敗', ({ input }) => {
      const result = dateToTimestamp(input);
      expect(result.success).toBe(false);
      expect(result.value).toContain('無效');
    });
  });

  describe('時區轉換 (utcOffset)', () => {
    it.each(dateToTimestampTimezoneCases)('$desc', ({ input, useMs, offset, expected }) => {
      const result = dateToTimestamp(input, useMs, offset);
      expect(result.success).toBe(true);
      expect(result.value).toBe(expected);
    });
  });
});
