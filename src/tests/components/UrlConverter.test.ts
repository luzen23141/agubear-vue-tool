import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UrlConverter from '../../components/UrlConverter.vue';
import { setupI18n } from '../../i18n';

const i18n = setupI18n(); // Create i18n instance

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

describe('UrlConverter.vue', () => {
  let wrapper: any;
  beforeEach(() => {
    i18n.global.locale.value = 'zh-TW';
    historyMocks.history = [];
    historyMocks.addToHistory.mockClear();
    historyMocks.clearHistory.mockClear();
    historyMocks.removeFromHistory.mockClear();
    mockClipboardWrite.mockClear();
    mockClipboardRead.mockClear();
    wrapper = mount(UrlConverter, mountOptions);
  });

  describe('渲染', () => {
    it('應正確渲染標題', () => {
      expect(wrapper.find('h2').text()).toContain('URL');
    });
  });

  describe('功能: 編碼', () => {
    it('輸入文字應自動編碼', async () => {
      await wrapper.find('input[value="encode"]').setValue();
      await wrapper.find('#url-input').setValue('hello world');
      await wrapper.vm.$nextTick();
      await flushPromises();
      expect(wrapper.find('#url-output').element.value).toBe('hello%20world');
    });
  });

  describe('功能: 解碼', () => {
    it('輸入編碼網址應自動解碼', async () => {
      await wrapper.find('input[value="decode"]').setValue();
      await wrapper.find('#url-input').setValue('hello%20world');
      await wrapper.vm.$nextTick();
      await flushPromises();
      expect(wrapper.find('#url-output').element.value).toBe('hello world');
    });
  });

  describe('歷史紀錄', () => {
    it('點擊紀錄按鈕應呼叫 addToHistory', async () => {
      await wrapper.find('#url-input').setValue('test');
      await flushPromises();
      const recordBtn = wrapper.find('.record-btn');
      await recordBtn.trigger('click');
      expect(historyMocks.addToHistory).toHaveBeenCalledWith('url', 'test', 'test');
    });

    it('應顯示並能清除歷史紀錄', async () => {
      historyMocks.history = [{ id: 1, timestamp: '12:00', input: 'test', output: 'output' }];
      const newWrapper = mount(UrlConverter, mountOptions);
      expect(newWrapper.find('.history-card').exists()).toBe(true);
      await newWrapper.find('.clear-btn').trigger('click');
      expect(historyMocks.clearHistory).toHaveBeenCalled();
    });

    it('應能刪除單筆紀錄', async () => {
      historyMocks.history = [{ id: 1, timestamp: '12:00', input: 'test', output: 'output' }];
      const newWrapper = mount(UrlConverter, mountOptions);
      await newWrapper.find('.delete-btn').trigger('click');
      expect(historyMocks.removeFromHistory).toHaveBeenCalledWith(1);
    });

    it('記錄到歷史時應截斷長內容', async () => {
      await wrapper.find('#url-input').setValue('a'.repeat(50));
      await flushPromises();
      await wrapper.find('.record-btn').trigger('click');
      expect(historyMocks.addToHistory).toHaveBeenCalledWith(
        'url',
        expect.stringContaining('...'),
        expect.stringContaining('...')
      );
    });
  });

  describe('操作', () => {
    it('點擊輸入框複製按鈕應觸發 clipboard write', async () => {
      await wrapper.find('#url-input').setValue('input copy');
      await flushPromises();
      const copyBtn = wrapper.find('.copy-btn-overlay');
      await copyBtn.trigger('click');
      expect(mockClipboardWrite).toHaveBeenCalledWith('input copy');
    });

    it('點擊結果框複製按鈕應觸發 clipboard write', async () => {
      await wrapper.find('#url-input').setValue('test');
      await flushPromises();
      const copyBtn = wrapper.findAll('.copy-btn-overlay')[1]; // Output copy
      await copyBtn.trigger('click');
      expect(mockClipboardWrite).toHaveBeenCalledWith('test');
    });

    it('點擊貼上按鈕應更新輸入', async () => {
      const pasteBtn = wrapper.find('.paste-btn');
      await pasteBtn.trigger('click');
      expect(mockClipboardRead).toHaveBeenCalled();
      expect(wrapper.vm.inputText).toBe('test content');
    });

    it('切換模式應交換輸入輸出', async () => {
      await wrapper.find('#url-input').setValue('hello world');
      await wrapper.vm.$nextTick();
      await flushPromises();
      await wrapper.find('input[value="decode"]').setValue();
      await wrapper.vm.$nextTick();
      await flushPromises();
      expect(wrapper.vm.inputText).toBe('hello%20world');
    });
  });
});
