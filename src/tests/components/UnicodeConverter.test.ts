import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import UnicodeConverter from '../../components/UnicodeConverter.vue';
import { setupI18n } from '../../i18n';

const i18n = setupI18n();

const mountOptions = {
  global: {
    plugins: [i18n]
  }
};

// Mock useHistory
const historyMocks = {
  history: [] as any[],
  addToHistory: vi.fn(),
  clearHistory: vi.fn(),
  removeFromHistory: vi.fn()
};
vi.mock('../../composables/useHistory', () => ({
  useHistory: () => historyMocks
}));

// Mock useHead
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

// Mock clipboard
const mockClipboardWrite = vi.fn().mockResolvedValue(undefined);
const mockClipboardRead = vi.fn().mockResolvedValue('test content');
Object.assign(navigator, {
  clipboard: {
    writeText: mockClipboardWrite,
    readText: mockClipboardRead
  }
});

describe('UnicodeConverter.vue', () => {
  let wrapper: any;
  beforeEach(() => {
    i18n.global.locale.value = 'zh-TW';
    historyMocks.history = [];
    historyMocks.addToHistory.mockClear();
    historyMocks.clearHistory.mockClear();
    historyMocks.removeFromHistory.mockClear();
    mockClipboardWrite.mockClear();
    mockClipboardRead.mockClear();
    wrapper = mount(UnicodeConverter, mountOptions);
  });

  describe('渲染', () => {
    it('應正確渲染標題', () => {
      expect(wrapper.find('h2').text()).toContain('Unicode');
    });

    it('應渲染兩個 textarea', () => {
      expect(wrapper.findAll('textarea')).toHaveLength(2);
    });
  });

  describe('文字 → Unicode', () => {
    it('中文字應轉為 Unicode 編碼', async () => {
      await wrapper.find('#unicode-text-input').setValue('你好');
      const btn = wrapper
        .findAll('.action-buttons button')
        .find((b: any) => b.text().includes('文字 → Unicode'));
      await btn?.trigger('click');
      expect(wrapper.find('#unicode-raw-input').element.value).toBe('\\u4f60\\u597d');
    });

    it('應能轉為 HTML Entities', async () => {
      await wrapper.find('#unicode-mode-html').setValue();
      await wrapper.find('#unicode-text-input').setValue('你好');
      const btn = wrapper
        .findAll('.action-buttons button')
        .find((b: any) => b.text().includes('文字 → Unicode'));
      await btn?.trigger('click');
      expect(wrapper.find('#unicode-raw-input').element.value).toBe('&#x4F60;&#x597D;');
    });

    it('開啟 skipAscii 應正確跳過 ASCII', async () => {
      await wrapper.find('#skip-ascii').setValue(true);
      await wrapper.find('#unicode-text-input').setValue('Hi你好');
      const btn = wrapper
        .findAll('.action-buttons button')
        .find((b: any) => b.text().includes('文字 → Unicode'));
      await btn?.trigger('click');
      expect(wrapper.find('#unicode-raw-input').element.value).toBe('Hi\\u4f60\\u597d');
    });

    it('空輸入應提早回傳', async () => {
      await wrapper.find('#unicode-text-input').setValue('');
      const btn = wrapper
        .findAll('.action-buttons button')
        .find((b: any) => b.text().includes('文字 → Unicode'));
      await btn?.trigger('click');
      expect(wrapper.find('#unicode-raw-input').element.value).toBe('');
    });
  });

  describe('Unicode → 文字', () => {
    it('Unicode 編碼應轉為 中文字', async () => {
      await wrapper.find('#unicode-raw-input').setValue('\\u4f60\\u597d');
      // Use localized label or find by text if label is tricky
      const btn = wrapper
        .findAll('.action-buttons button')
        .find((b: any) => b.text().includes('Unicode → 文字'));
      await btn?.trigger('click');
      expect(wrapper.find('#unicode-text-input').element.value).toBe('你好');
    });

    it('應能解碼 HTML Entities', async () => {
      await wrapper.find('#unicode-mode-html').setValue();
      await wrapper.find('#unicode-raw-input').setValue('&#x4F60;&#x597D;');
      const btn = wrapper
        .findAll('.action-buttons button')
        .find((b: any) => b.text().includes('Unicode → 文字'));
      await btn?.trigger('click');
      expect(wrapper.find('#unicode-text-input').element.value).toBe('你好');
    });

    it('空編碼輸入應提早回傳', async () => {
      await wrapper.find('#unicode-raw-input').setValue('');
      const btn = wrapper
        .findAll('.action-buttons button')
        .find((b: any) => b.text().includes('Unicode → 文字'));
      await btn?.trigger('click');
      expect(wrapper.find('#unicode-text-input').element.value).toBe('');
    });
  });

  describe('歷史紀錄', () => {
    it('轉換後應記錄到歷史', async () => {
      await wrapper.find('#unicode-text-input').setValue('test');
      await wrapper.find('button[aria-label*="Unicode"]').trigger('click');
      expect(historyMocks.addToHistory).toHaveBeenCalled();
    });

    it('應顯示並能清除歷史紀錄', async () => {
      historyMocks.history = [{ id: 1, timestamp: '12:00', input: 'test', output: 'output' }];
      const newWrapper = mount(UnicodeConverter, mountOptions);
      expect(newWrapper.find('.history-card').exists()).toBe(true);
      await newWrapper.find('.clear-btn').trigger('click');
      expect(historyMocks.clearHistory).toHaveBeenCalled();
    });

    it('應能刪除單筆紀錄', async () => {
      historyMocks.history = [{ id: 1, timestamp: '12:00', input: 'test', output: 'output' }];
      const newWrapper = mount(UnicodeConverter, mountOptions);
      await newWrapper.find('.delete-btn').trigger('click');
      expect(historyMocks.removeFromHistory).toHaveBeenCalledWith(1);
    });

    it('紀錄到歷史時應截斷長內容', async () => {
      await wrapper.find('#unicode-text-input').setValue('a'.repeat(50));
      const btn = wrapper
        .findAll('.action-buttons button')
        .find((b: any) => b.text().includes('文字 → Unicode'));
      await btn?.trigger('click');
      expect(historyMocks.addToHistory).toHaveBeenCalledWith(
        'unicode',
        expect.stringContaining('...'),
        expect.stringContaining('...')
      );
    });
  });

  describe('複製與貼上', () => {
    it('應能複製輸入文字', async () => {
      await wrapper.find('#unicode-text-input').setValue('input copy');
      await wrapper.vm.$nextTick();
      const copyBtn = wrapper.find('.copy-btn-overlay');
      await copyBtn.trigger('click');
      expect(mockClipboardWrite).toHaveBeenCalledWith('input copy');
    });

    it('應能複製編碼結果', async () => {
      const wrapper = mount(UnicodeConverter, mountOptions);
      await wrapper.find('#unicode-text-input').setValue('你好');
      const btn = wrapper
        .findAll('.action-buttons button')
        .find((b: any) => b.text().includes('文字 → Unicode'));
      await btn?.trigger('click');
      await wrapper.vm.$nextTick();
      await wrapper.vm.$nextTick();

      const copyBtn = wrapper.find('#unicode-raw-input + .copy-btn-overlay');
      await copyBtn.trigger('click');
      expect(mockClipboardWrite).toHaveBeenCalledWith('\\u4f60\\u597d');
    });

    it('點擊貼上按鈕應更新輸入', async () => {
      const pasteBtn = wrapper.find('.paste-btn');
      await pasteBtn.trigger('click');
      expect(mockClipboardRead).toHaveBeenCalled();
      expect((wrapper.vm as any).textInput).toBe('test content');
    });

    it('應能點擊第二個貼上按鈕更新編碼輸入', async () => {
      const pasteBtns = wrapper.findAll('.paste-btn');
      await pasteBtns[1].trigger('click');
      expect(mockClipboardRead).toHaveBeenCalled();
      expect((wrapper.vm as any).unicodeInput).toBe('test content');
    });

    it('應能切換格式與 skipAscii 反向狀態', async () => {
      await wrapper.find('#unicode-mode-unicode').setValue();
      await wrapper.find('#skip-ascii').setValue(false);
      expect((wrapper.vm as any).format).toBe('unicode');
      expect((wrapper.vm as any).skipAscii).toBe(false);
    });
  });
});
