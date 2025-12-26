/**
 * 時間戳轉換工具函式
 */
import { format } from 'date-fns';

export interface TimestampResult {
  success: boolean;
  value: string;
}

export interface DateResult {
  success: boolean;
  value: number | string;
}

/**
 * 將 Unix 時間戳轉換為格式化的日期字串
 * @param {number|string} timestamp - Unix 時間戳 (秒或毫秒)
 * @param {string} mode - 輸入模式: 'auto' (自動判斷), 's' (10位秒), 'ms' (13位毫秒)
 * @param {number} utcOffset - UTC 偏移量 (小時), 例如 8 表示 UTC+8
 * @returns {TimestampResult} 轉換結果
 */
export function timestampToDate(
  timestamp: number | string,
  mode: 'auto' | 's' | 'ms' = 'auto',
  utcOffset: number | null = null
): TimestampResult {
  try {
    const parsed = parseTimestampInput(timestamp, mode);
    if (!parsed) return { success: false, value: '無效的時間戳' };

    const { ts, isMs } = parsed;
    const date = new Date(ts);
    if (Number.isNaN(date.getTime())) return { success: false, value: '無效的時間戳' };

    const fmt = isMs ? 'yyyy-MM-dd HH:mm:ss.SSS' : 'yyyy-MM-dd HH:mm:ss';
    const val = utcOffset === null ? format(date, fmt) : formatWithUtcOffset(date, utcOffset, fmt);
    return { success: true, value: val };
  } catch (e) {
    if (typeof process === 'undefined' || !process.env.VITEST) {
      console.error('timestampToDate error:', e);
    }
    return { success: false, value: '無效的時間戳' };
  }
}

/**
 * 私有輔助函式：解析並校驗時間戳輸入
 */
function parseTimestampInput(
  timestamp: number | string,
  mode: 'auto' | 's' | 'ms'
): { ts: number; isMs: boolean } | null {
  const tsValue = Number(timestamp);
  if (timestamp === '' || timestamp === null || timestamp === undefined || Number.isNaN(tsValue)) {
    return null;
  }

  let ts = tsValue;
  const isMs = mode === 'ms' || (mode === 'auto' && Math.abs(ts) >= 1e12);
  if (!isMs) ts *= 1000;
  return { ts, isMs };
}

/**
 * 私有輔助函式：處理時區偏移格式化
 */
function formatWithUtcOffset(date: Date, utcOffset: number, formatStr: string): string {
  const utcMs = date.getTime() + date.getTimezoneOffset() * 60000;
  const targetDate = new Date(utcMs + utcOffset * 3600000);
  return format(targetDate, formatStr);
}

/**
 * 將日期字串轉換為 Unix 時間戳
 * @param {string} dateString - 日期字串 (支援 -, /, . 分隔)
 * @param {boolean} useMilliseconds - 是否使用毫秒 (13 位), 預設為 false (10 位秒)
 * @param {number} utcOffset - UTC 偏移量 (小時), 例如 8 表示 UTC+8
 * @returns {DateResult} 轉換結果
 */
export function dateToTimestamp(
  dateString: string,
  useMilliseconds = false,
  utcOffset: number | null = null
): DateResult {
  try {
    const finalDateString = normalizeDateInput(dateString);
    const date = new Date(finalDateString);

    if (Number.isNaN(date.getTime())) {
      return { success: false, value: '無效的日期' };
    }

    let ms;
    if (utcOffset === null) {
      ms = date.getTime();
    } else {
      // 修正時區差值
      const localTzMs = -date.getTimezoneOffset() * 60000;
      const targetTzMs = utcOffset * 3600000;
      ms = date.getTime() + (localTzMs - targetTzMs);
    }

    return {
      success: true,
      value: useMilliseconds ? ms : Math.floor(ms / 1000)
    };
  } catch (e) {
    if (typeof process === 'undefined' || !process.env.VITEST) {
      console.error('dateToTimestamp error:', e);
    }
    return { success: false, value: '無效的日期' };
  }
}

/**
 * 私有輔助函式：標準化日期輸入字串
 */
function normalizeDateInput(dateString: string): string {
  const trimmed = dateString.trim();
  let datePart = trimmed;
  let timePart = '';

  if (trimmed.includes('T')) {
    const parts = trimmed.split('T');
    datePart = parts[0] || trimmed;
    timePart = `T${parts.slice(1).join('T')}`;
  } else if (trimmed.includes(' ')) {
    const parts = trimmed.split(' ');
    datePart = parts[0] || trimmed;
    timePart = ` ${parts.slice(1).join(' ')}`;
  }

  return datePart.replaceAll(/[/.]/g, '-') + timePart;
}
