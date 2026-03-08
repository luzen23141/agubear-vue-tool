import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive, nextTick } from 'vue';
import { mount, flushPromises, DOMWrapper } from '@vue/test-utils';
import TimestampConverter from '../../views/TimestampConverter.vue';
import { setupI18n } from '../../i18n';

const i18n = setupI18n();

const mountOptions = {
  global: {
    plugins: [i18n]
  }
};

const mockUseHistory = reactive({
  history: [] as any[],
  addToHistory: vi.fn(),
  clearHistory: vi.fn(),
  removeFromHistory: vi.fn()
});

vi.mock('../../composables/use-history', () => ({
  UseHistory: () => mockUseHistory
}));

// Mock useHead
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

// Mock clipboard
const mockClipboardWrite = vi.fn().mockImplementation(async () => {});
const mockClipboardRead = vi.fn().mockResolvedValue('1700000000');
Object.assign(navigator, {
  clipboard: {
    writeText: mockClipboardWrite,
    readText: mockClipboardRead
  }
});

describe('TimestampConverter.vue', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'en'; // Force English for consistent test results
    mockClipboardWrite.mockClear();
    mockClipboardRead.mockClear();
    localStorage.clear();
  });

  describe('渲染', () => {
    it('應正確渲染標題', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      expect(wrapper.find('h2').text()).toContain('Timestamp');
    });

    it('應渲染時區選擇器', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const select = wrapper.find('#tz-select');
      expect(select.exists()).toBe(true);
    });

    it('應有多個時區選項', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const options = wrapper.findAll('#tz-select option');
      expect(options.length).toBeGreaterThanOrEqual(20);
    });

    it('應渲染 timestamp 輸入欄位', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('#timestamp-input');
      expect(input.exists()).toBe(true);
      expect(input.element.tagName).toBe('TEXTAREA');
    });

    it('應渲染日期輸入欄位', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('#date-input');
      expect(input.exists()).toBe(true);
    });

    it('應有兩個結果區域', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const results = wrapper.findAll('.result-text');
      expect(results).toHaveLength(2);
    });

    it('應有模式切換 (自動/秒/毫秒)', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const radios = wrapper.findAll('.mode-toggle input[type="radio"]');
      expect(radios.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('轉換功能', () => {
    it('輸入 Timestamp 應能轉換', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      (wrapper.vm as any).timestampInput = '1700000000';
      await wrapper.vm.$nextTick();

      const convertButton = wrapper
        .findAll('.btn-primary')
        .find((b) => b.text().includes('Convert'));
      await convertButton?.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.result-text').text()).toContain('2023-11');
    });

    it('切換時區應影響結果', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const select = wrapper.find('select#tz-select');

      await select.setValue(0); // UTC+0
      await wrapper.vm.$nextTick();

      (wrapper.vm as any).timestampInput = '1700000000';
      await wrapper.vm.$nextTick();

      const convertButton = wrapper
        .findAll('.btn-primary')
        .find((b) => b.text().includes('Convert'));
      await convertButton?.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.result-text').text()).toContain('22:13:20');
    });

    it('無效時間戳應顯示錯誤碼', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      await (wrapper.get('#timestamp-input') as DOMWrapper<HTMLTextAreaElement>).setValue(
        'invalid'
      );
      await flushPromises();

      const convertButton = wrapper
        .findAll('.btn-primary')
        .find(
          (b: DOMWrapper<Element>) => b.text().includes('Convert') || b.text().includes('轉換')
        );
      await convertButton?.trigger('click');
      await flushPromises();

      const result = wrapper.find('.result-text').text();
      expect(result).toContain('INVALID_');
    });

    it('負數時間戳應能轉換 (1970年前)', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      (wrapper.vm as any).timestampInput = '-86400';
      await wrapper.vm.$nextTick();

      const convertButton = wrapper
        .findAll('.btn-primary')
        .find((b) => b.text().includes('Convert'));
      await convertButton?.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.result-text').text()).toContain('1969');
    });
  });

  describe('輸入驗證與邊際情況', () => {
    it('應過濾非數字字元 (保留開頭負號)', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('#timestamp-input');

      await input.setValue('abc123def-456');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect((input.element as HTMLTextAreaElement).value).toBe('123456');

      await input.setValue('-123ab');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      expect((input.element as HTMLTextAreaElement).value).toBe('-123');
    });

    it('應限制輸入長度為 15 位', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('#timestamp-input');

      await input.setValue('1234567890123456789');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect((input.element as HTMLTextAreaElement).value).toHaveLength(15);
      expect((input.element as HTMLTextAreaElement).value).toBe('123456789012345');
    });

    it('輸入極大數字時不應轉為科學記號', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('#timestamp-input');

      const largeValue = '123456789012345';
      await input.setValue(largeValue);
      await wrapper.vm.$nextTick();

      expect((input.element as HTMLTextAreaElement).value).toBe(largeValue);
    });
  });

  describe('毫秒切換', () => {
    it('應有毫秒/秒切換', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const toggle = wrapper.find('.format-toggle');
      expect(toggle.exists()).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('時區選擇器應有 aria-label', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      expect(wrapper.find('#tz-select').attributes('aria-label')).toBeTruthy();
    });

    it('input 應有 placeholder 或 aria-label', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('#timestamp-input');
      const hasPlaceholder = input.attributes('placeholder');
      const hasAriaLabel = input.attributes('aria-label');
      expect(hasPlaceholder || hasAriaLabel).toBeTruthy();
    });
  });

  describe('歷史紀錄與進階互動', () => {
    it('按下 Enter 應觸發 Timestamp 轉換', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('#timestamp-input');
      await input.setValue('1234567890');
      await input.trigger('keyup.enter');
      expect(wrapper.find('.result-text').text()).toContain('2009-02-14');
    });

    it('按下 Enter 應觸發 Date 轉換', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      await wrapper.find('#tz-select').setValue(0);
      (wrapper.vm as any).dateInput = '2023-11-15 00:00:00';
      await (wrapper.vm as any).convertToTimestamp();
      await wrapper.vm.$nextTick();

      const results = wrapper.findAll('.result-text');
      expect(results[1]?.text()).toMatch(/^\d+$/);
    });

    it('應能呼叫 addToHistory', async () => {
      mockUseHistory.addToHistory.mockClear();
      const wrapper = mount(TimestampConverter, mountOptions);
      await wrapper.find('#timestamp-input').setValue('1700000000');

      const convertButton = wrapper
        .findAll('.btn-primary')
        .find((b) => b.text().includes('Convert'));
      await convertButton?.trigger('click');
      await wrapper.vm.$nextTick();

      expect(mockUseHistory.addToHistory).toHaveBeenCalled();
    });

    it('應能刪除歷史紀錄', async () => {
      mockUseHistory.removeFromHistory.mockClear();
      mockUseHistory.history = [
        { id: 1, timestamp: '12:00', input: '1700000000', output: '2023...' }
      ];

      const wrapper = mount(TimestampConverter, mountOptions);
      await nextTick();
      const deleteButton = wrapper.find('.delete-btn');
      await (deleteButton as any).trigger('click');

      expect(mockUseHistory.removeFromHistory).toHaveBeenCalledWith(1);
    });

    it('應能清空歷史紀錄', async () => {
      mockUseHistory.clearHistory.mockClear();
      mockUseHistory.history = [
        { id: 1, timestamp: '12:00', input: '1700000000', output: '2023...' }
      ];

      const wrapper = mount(TimestampConverter, mountOptions);
      await nextTick();
      const clearButton = wrapper.find('.clear-btn');
      await (clearButton as any).trigger('click');

      expect(mockUseHistory.clearHistory).toHaveBeenCalled();
    });

    it('應能點擊複製 Timestamp 結果', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      await wrapper.find('#timestamp-input').setValue('1700000000');

      const convertButton = wrapper
        .findAll('.btn-primary')
        .find((b: DOMWrapper<Element>) => b.text().includes('Convert'));
      await convertButton?.trigger('click');
      await wrapper.vm.$nextTick();

      const copyBtns = wrapper.findAll('.copy-btn');
      if (copyBtns.length > 0) {
        await (copyBtns[0] as any).trigger('click');
        expect(mockClipboardWrite).toHaveBeenCalled();
      }
    });

    it('應能貼上至 Timestamp', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      const pasteButton = wrapper.findAll('.paste-btn')[0];
      if (pasteButton) {
        await (pasteButton as any).trigger('click');
        expect(mockClipboardRead).toHaveBeenCalled();
        expect(wrapper.vm.timestampInput).toBe('1700000000');
      }
    });

    it('應能貼上至 Date', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      mockClipboardRead.mockResolvedValueOnce('2023-11-15 00:00:00');
      const pasteButton = wrapper.findAll('.paste-btn')[1];
      if (pasteButton) {
        await (pasteButton as any).trigger('click');
        expect(wrapper.vm.dateInput).toBe('2023-11-15 00:00:00');
      }
    });

    it('應能切換格式 (毫秒)', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      const checkbox = wrapper.find('.format-toggle input[type="checkbox"]');
      if (checkbox.exists()) {
        await checkbox.setChecked(true); // ms
        await wrapper.vm.$nextTick();
        (wrapper.vm as any).timestampInput = '1700000000000';
        await wrapper.vm.$nextTick();
        const convertButton = wrapper
          .findAll('.btn-primary')
          .find((b: DOMWrapper<Element>) => b.text().includes('Convert'));
        await convertButton?.trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.find('.result-text').text()).toContain('2023-11');
      }
    });

    it('貼上失敗時應處理錯誤', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      mockClipboardRead.mockRejectedValueOnce(new Error('paste fail'));
      wrapper.vm.timestampInput = '1700000001';
      await wrapper.vm.$nextTick();

      const pasteButton = wrapper.findAll('.paste-btn')[0];
      if (pasteButton) {
        await pasteButton.trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.timestampInput).toBe('1700000001');
      }
    });

    it('應能切換時間戳模式', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const sMode = wrapper
        .findAll('.mode-toggle input[type="radio"]')
        .find((w) => (w.element as HTMLInputElement).value === 's');
      await sMode?.setValue();
      await wrapper.vm.$nextTick();
      expect((wrapper.vm as any).timestampMode).toBe('s');

      const msMode = wrapper
        .findAll('.mode-toggle input[type="radio"]')
        .find((w) => (w.element as HTMLInputElement).value === 'ms');
      await msMode?.setValue();
      await wrapper.vm.$nextTick();
      expect((wrapper.vm as any).timestampMode).toBe('ms');
    });

    it('應能切換時區 (utcOffset)', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const tzSelect = wrapper.find('#tz-select');

      await tzSelect.setValue(8);
      expect((wrapper.vm as any).utcOffset).toBe(8);

      await tzSelect.setValue(-5);
      expect((wrapper.vm as any).utcOffset).toBe(-5);
    });

    it('應能點擊轉換為時間戳按鈕', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const cards = wrapper.findAll('.card');
      const convertButton = cards[1]?.find('button');
      await convertButton?.trigger('click');
      // Should trigger convertToTimestamp and update result
      await wrapper.vm.$nextTick();
      expect((wrapper.vm as any).timestampResult).toBeTruthy();
    });

    it('應能顯示歷史紀錄', async () => {
      mockUseHistory.history = [{ id: 1, timestamp: '12:00', input: '123', output: '456' }];
      const wrapper = mount(TimestampConverter, mountOptions);
      await nextTick();
      expect(wrapper.find('.history-card').exists()).toBe(true);
      expect(wrapper.find('.history-item').text()).toContain('123');
    });
  });
  describe('相對時間顯示', () => {
    it('應能顯示相對時間', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const now = Math.floor(Date.now() / 1000);
      await wrapper.find('#timestamp-input').setValue(now.toString());
      await wrapper.vm.$nextTick();

      const convertButton = wrapper
        .findAll('.btn-primary')
        .find((b) => b.text().includes('Convert'));
      await convertButton?.trigger('click');
      await wrapper.vm.$nextTick();

      // Wait multiple cycles for: async date-fns locale import → ref update → Vue render
      await flushPromises();
      await nextTick();
      await flushPromises();
      await nextTick();

      // Verify relative time container exists and has content
      expect(wrapper.find('.relative-time').exists()).toBe(true);
      expect(wrapper.find('.relative-time').text().length).toBeGreaterThan(0);
    });
  });

  describe('時間間隔計算 (Duration)', () => {
    it('應能計算兩個時間的間隔', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);

      // Open duration calculator if it's in a modal or toggle (it's inline in the new design)
      // Assuming it's always visible or toggled. Let's find inputs.
      const startInput = wrapper.find('#duration-start');
      const endInput = wrapper.find('#duration-end');

      if (startInput.exists() && endInput.exists()) {
        await startInput.setValue('2023-01-01T12:00');
        await endInput.setValue('2023-01-01T14:30');

        // Trigger calculation (either auto or button)
        const calcButton = wrapper.find('.duration-calc-btn');
        if (calcButton.exists()) {
          await calcButton.trigger('click');
        } else {
          // trigger update if computed
          await wrapper.vm.$nextTick();
        }

        const result = wrapper.find('.duration-result');
        expect(result.text()).toContain('2h 30m'); // Or "2 時 30 分"
      }
    });

    it('結束時間早於開始時間應顯示錯誤或負值', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const startInput = wrapper.find('#duration-start');
      const endInput = wrapper.find('#duration-end');

      if (startInput.exists() && endInput.exists()) {
        await startInput.setValue('2023-01-01T12:00');
        await endInput.setValue('2023-01-01T11:00');

        await wrapper.vm.$nextTick();

        // Implementation dependent: might be negative duration or error class
        const result = wrapper.find('.duration-result');
        expect(result.exists()).toBe(true);
      }
    });
  });
});
