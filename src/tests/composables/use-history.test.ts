/**
 * UseHistory Composable 測試
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { UseHistory } from '@/composables/use-history';

describe('UseHistory', () => {
  let history, addToHistory, clearHistory, removeFromHistory;

  beforeEach(() => {
    ({ history, addToHistory, clearHistory, removeFromHistory } = UseHistory());
  });

  describe('addToHistory', () => {
    it('應成功新增紀錄', () => {
      addToHistory('ts2date', '1700000000', '2023-11-15 06:13:20');

      expect(history.value).toHaveLength(1);
      expect(history.value[0]).toMatchObject({
        type: 'ts2date',
        input: '1700000000',
        output: '2023-11-15 06:13:20'
      });
    });

    it('應在開頭新增 (最新在前)', () => {
      addToHistory('ts2date', 'first', 'result1');
      addToHistory('ts2date', 'second', 'result2');

      expect(history.value[0].input).toBe('second');
      expect(history.value[1].input).toBe('first');
    });

    it('應限制最多 10 筆紀錄', () => {
      for (let index = 0; index < 15; index++) {
        addToHistory('ts2date', `input${index}`, `output${index}`);
      }

      expect(history.value).toHaveLength(10);
      expect(history.value[0].input).toBe('input14'); // 最新
      expect(history.value[9].input).toBe('input5'); // 最舊
    });

    it('不應新增無效的紀錄 (含 INVALID_ 前綴)', () => {
      addToHistory('ts2date', '123', 'INVALID_TIMESTAMP');
      expect(history.value).toHaveLength(0);
    });

    it('不應新增空輸入的紀錄', () => {
      addToHistory('ts2date', '', 'result');
      expect(history.value).toHaveLength(0);
    });

    it('應正確處理數字類型的 output (date2ts)', () => {
      addToHistory('date2ts', '2023-11-15', 1_700_000_000);
      expect(history.value).toHaveLength(1);
      expect(history.value[0].output).toBe(1_700_000_000);
    });

    it('應正確記錄 md5 類型', () => {
      addToHistory('md5', 'hello', '5d41402abc4b2a76b9719d911017c592');
      expect(history.value).toHaveLength(1);
      expect(history.value[0].type).toBe('md5');
    });

    it('每筆紀錄應包含 timestamp 欄位', () => {
      addToHistory('ts2date', 'test', 'result');
      expect(history.value[0].timestamp).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });

    it('每筆紀錄應有 id 欄位', () => {
      addToHistory('ts2date', 'a', 'b');
      expect(history.value[0]).toHaveProperty('id');
      expect(typeof history.value[0].id).toBe('number');
    });
  });

  describe('removeFromHistory', () => {
    it('應成功刪除指定紀錄', () => {
      addToHistory('ts2date', 'item1', 'result1');
      addToHistory('ts2date', 'item2', 'result2');

      const idToRemove = history.value[0].id;
      removeFromHistory(idToRemove);

      expect(history.value).toHaveLength(1);
      expect(history.value[0].input).toBe('item1');
    });

    it('刪除不存在的 ID 應無影響', () => {
      addToHistory('ts2date', 'item1', 'result1');

      removeFromHistory(99_999);

      expect(history.value).toHaveLength(1);
    });
  });

  describe('clearHistory', () => {
    it('應清除所有紀錄', () => {
      addToHistory('ts2date', 'item1', 'result1');
      addToHistory('ts2date', 'item2', 'result2');

      clearHistory();

      expect(history.value).toHaveLength(0);
    });
  });
});
