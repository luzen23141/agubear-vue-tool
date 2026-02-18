import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reactive, nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import TimestampConverter from '../../components/TimestampConverter.vue';
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

vi.mock('../../composables/useHistory', () => ({
  useHistory: () => mockUseHistory
}));

// Mock useHead
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

// Mock clipboard
const mockClipboardWrite = vi.fn().mockResolvedValue(undefined);
const mockClipboardRead = vi.fn().mockResolvedValue('1700000000');
Object.assign(navigator, {
  clipboard: {
    writeText: mockClipboardWrite,
    readText: mockClipboardRead
  }
});

describe('TimestampConverter.vue', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'zh-TW';
    mockClipboardWrite.mockClear();
    mockClipboardRead.mockClear();
  });

  describe('渲染', () => {
    it('應正確渲染標題', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      expect(wrapper.find('h2').text()).toContain('Unix Timestamp');
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
      expect(input.attributes('type')).toBe('text');
    });

    it('應渲染日期輸入欄位', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('#date-input');
      expect(input.exists()).toBe(true);
    });

    it('應有兩個結果區域', () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const results = wrapper.findAll('.result');
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
      const input = wrapper.find('input#timestamp-input');

      await input.setValue('1700000000');
      await wrapper.find('.input-group button').trigger('click');

      expect(wrapper.find('.result').text()).toContain('2023-11');
    });

    it('切換時區應影響結果', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const select = wrapper.find('select#tz-select');

      await select.setValue(0); // UTC+0

      const input = wrapper.find('input#timestamp-input');
      await input.setValue('1700000000');
      await wrapper.find('.input-group button').trigger('click');

      expect(wrapper.find('.result').text()).toContain('22:13:20');
    });

    it('無效時間戳應顯示錯誤碼', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('input#timestamp-input');

      await input.setValue('');
      const button = wrapper.findAll('.input-group button')[0];
      if (button) {
        await (button as any).trigger('click');
      }

      const result = wrapper.find('.result').text();
      expect(result).toContain('無效');
    });

    it('負數時間戳應能轉換 (1970年前)', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('input#timestamp-input');

      await input.setValue('-86400');
      await wrapper.find('.input-group button').trigger('click');

      expect(wrapper.find('.result').text()).toContain('1969');
    });
  });

  describe('輸入驗證與邊際情況', () => {
    it('應過濾非數字字元 (保留開頭負號)', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('input#timestamp-input');

      await input.setValue('abc123def-456');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect((input.element as HTMLInputElement).value).toBe('123456');

      await input.setValue('-123ab');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();
      expect((input.element as HTMLInputElement).value).toBe('-123');
    });

    it('應限制輸入長度為 15 位', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('input#timestamp-input');

      await input.setValue('1234567890123456789');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      expect((input.element as HTMLInputElement).value).toHaveLength(15);
      expect((input.element as HTMLInputElement).value).toBe('123456789012345');
    });

    it('輸入極大數字時不應轉為科學記號', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const input = wrapper.find('input#timestamp-input');

      const largeValue = '123456789012345';
      await input.setValue(largeValue);
      await wrapper.vm.$nextTick();

      // 因為 type="text"，所以不會被瀏覽器轉成 1.23e...
      expect((input.element as HTMLInputElement).value).toBe(largeValue);
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
      expect(wrapper.find('.result').text()).toContain('2009-02-14');
    });

    it('按下 Enter 應觸發 Date 轉換', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      // 直接修改 vm 狀態並呼叫方法
      await wrapper.find('#tz-select').setValue(0);
      (wrapper.vm as any).dateInput = '2023-11-15 00:00:00';
      await (wrapper.vm as any).convertToTimestamp();
      await wrapper.vm.$nextTick();

      const results = wrapper.findAll('.result');
      expect(results[1]?.text()).toMatch(/^\d+$/);
    });

    it('應能呼叫 addToHistory', async () => {
      mockUseHistory.addToHistory.mockClear();
      const wrapper = mount(TimestampConverter, mountOptions);
      await wrapper.find('#timestamp-input').setValue('1700000000');
      await wrapper.find('.input-group button').trigger('click');

      expect(mockUseHistory.addToHistory).toHaveBeenCalled();
    });

    it('應能刪除歷史紀錄', async () => {
      mockUseHistory.removeFromHistory.mockClear();
      mockUseHistory.history = [
        { id: 1, timestamp: '12:00', input: '1700000000', output: '2023...' }
      ];

      const wrapper = mount(TimestampConverter, mountOptions);
      await nextTick();
      const deleteBtn = wrapper.find('.delete-btn');
      await (deleteBtn as any).trigger('click');

      expect(mockUseHistory.removeFromHistory).toHaveBeenCalledWith(1);
    });

    it('應能清空歷史紀錄', async () => {
      mockUseHistory.clearHistory.mockClear();
      mockUseHistory.history = [
        { id: 1, timestamp: '12:00', input: '1700000000', output: '2023...' }
      ];

      const wrapper = mount(TimestampConverter, mountOptions);
      await nextTick();
      const clearBtn = wrapper.find('.clear-btn');
      await (clearBtn as any).trigger('click');

      expect(mockUseHistory.clearHistory).toHaveBeenCalled();
    });

    it('應能點擊複製 Timestamp 結果', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      await wrapper.find('#timestamp-input').setValue('1700000000');
      await (wrapper.findAll('.input-group button')[0] as any).trigger('click');
      await wrapper.vm.$nextTick();

      const copyBtns = wrapper.findAll('.copy-btn');
      if (copyBtns.length > 0) {
        await (copyBtns[0] as any).trigger('click');
        expect(mockClipboardWrite).toHaveBeenCalled();
      }
    });

    it('應能貼上至 Timestamp', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      const pasteBtn = wrapper.findAll('.paste-btn')[0];
      if (pasteBtn) {
        await (pasteBtn as any).trigger('click');
        expect(mockClipboardRead).toHaveBeenCalled();
        expect(wrapper.vm.timestampInput).toBe('1700000000');
      }
    });

    it('應能貼上至 Date', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      mockClipboardRead.mockResolvedValueOnce('2023-11-15 00:00:00');
      const pasteBtn = wrapper.findAll('.paste-btn')[1];
      if (pasteBtn) {
        await (pasteBtn as any).trigger('click');
        expect(wrapper.vm.dateInput).toBe('2023-11-15 00:00:00');
      }
    });

    it('應能切換格式 (毫秒)', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      const checkbox = wrapper.find('.format-toggle input[type="checkbox"]');
      if (checkbox.exists()) {
        await checkbox.setChecked(true); // ms
        await wrapper.find('#timestamp-input').setValue('1700000000000');
        await (wrapper.findAll('.input-group button')[0] as any).trigger('click');
        expect(wrapper.find('.result').text()).toContain('2023-11');
      }
    });

    it('貼上失敗時應處理錯誤', async () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      mockClipboardRead.mockRejectedValueOnce(new Error('paste fail'));
      wrapper.vm.timestampInput = 'original';

      const pasteBtn = wrapper.findAll('.paste-btn')[0];
      if (pasteBtn) {
        await pasteBtn.trigger('click');
        await wrapper.vm.$nextTick();
        expect(wrapper.vm.timestampInput).toBe('original');
      }
    });

    it('應能切換時間戳模式', async () => {
      const wrapper = mount(TimestampConverter, mountOptions);
      const sMode = wrapper.find('#ts-mode-s');
      await sMode.setValue();
      expect((wrapper.vm as any).timestampMode).toBe('s');

      const msMode = wrapper.find('#ts-mode-ms');
      await msMode.setValue();
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
      const convertBtn = cards[1]?.find('button');
      await convertBtn?.trigger('click');
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

    it('onMounted 應偵測剪貼簿支援', () => {
      const wrapper: any = mount(TimestampConverter, mountOptions);
      expect(wrapper.vm.canPaste).toBe(true);
    });
  });
});
