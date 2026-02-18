import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Base64Converter from '../../components/Base64Converter.vue';
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
const mockClipboardRead = vi.fn().mockResolvedValue('pasted text');
Object.assign(navigator, {
  clipboard: {
    writeText: mockClipboardWrite,
    readText: mockClipboardRead
  }
});

describe('Base64Converter.vue', () => {
  let wrapper: any;
  beforeEach(() => {
    i18n.global.locale.value = 'zh-TW';
    historyMocks.history = [];
    historyMocks.addToHistory.mockClear();
    historyMocks.clearHistory.mockClear();
    historyMocks.removeFromHistory.mockClear();
    mockClipboardWrite.mockClear();
    mockClipboardRead.mockClear();
    wrapper = mount(Base64Converter, mountOptions);
  });

  describe('渲染', () => {
    it('應正確渲染標題', () => {
      expect(wrapper.find('h2').exists()).toBe(true);
    });

    it('應渲染兩個 textarea (輸入/輸出)', () => {
      const textareas = wrapper.findAll('textarea');
      expect(textareas.length).toBe(2);
    });

    it('應渲染模式切換按鈕 (編碼/解碼)', () => {
      const radios = wrapper.findAll('input[type="radio"]');
      expect(radios.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('功能: 編碼', () => {
    it('輸入文字應自動編碼為 Base64', async () => {
      await wrapper.find('input[value="encode"]').setValue();
      await wrapper.find('#base64-input').setValue('hello');
      await wrapper.vm.$nextTick();
      await new Promise((resolve) => {
        setTimeout(resolve, 100);
      }); // Wait for chunks

      expect(wrapper.find('#base64-output').element.value).toBe('aGVsbG8=');
    });

    it('應處理 UTF-8', async () => {
      await wrapper.find('input[value="encode"]').setValue();
      await wrapper.find('#base64-input').setValue('你好');
      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(wrapper.find('#base64-output').element.value).toBe('5L2g5aW9');
    });
  });

  describe('功能: 解碼', () => {
    it('輸入 Base64 應自動解碼為文字', async () => {
      await wrapper.find('input[value="decode"]').setValue();
      await wrapper.find('#base64-input').setValue('aGVsbG8=');
      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(wrapper.find('#base64-output').element.value).toBe('hello');
    });

    it('輸入無效 Base64 應顯示空', async () => {
      await wrapper.find('input[value="decode"]').setValue();
      await wrapper.find('#base64-input').setValue('!!invalid!!');
      await flushPromises();
      expect(wrapper.find('#base64-output').element.value).toBe('');
    });
  });

  describe('操作', () => {
    it('點擊複製按鈕應獲取輸出內容', async () => {
      await wrapper.find('#base64-input').setValue('test');
      await flushPromises();

      const copyBtns = wrapper.findAll('.copy-btn-overlay');
      const outputCopyBtn = copyBtns[1] || copyBtns[0];
      if (outputCopyBtn) {
        await outputCopyBtn.trigger('click');
        expect(mockClipboardWrite).toHaveBeenCalledWith('dGVzdA==');
      }
    });

    it('點擊貼上按鈕應更新輸入', async () => {
      const pasteBtn = wrapper.find('.paste-btn');
      await pasteBtn.trigger('click');
      expect(mockClipboardRead).toHaveBeenCalled();
      expect(wrapper.vm.inputText).toBe('pasted text');
    });

    it('點擊紀錄按鈕應呼叫 addToHistory', async () => {
      await wrapper.find('#base64-input').setValue('test');
      await flushPromises();

      const recordBtn = wrapper.find('.record-btn');
      await recordBtn.trigger('click');
      expect(historyMocks.addToHistory).toHaveBeenCalledWith('base64', 'test', 'dGVzdA==');
    });

    it('應顯示並能清除歷史紀錄', async () => {
      historyMocks.history = [{ id: 1, timestamp: '12:00', input: 'test', output: 'dGVzdA==' }];
      // Need re-mount or ensure reactivity in mock (which we don't have easily here)
      const newWrapper = mount(Base64Converter, mountOptions);
      expect(newWrapper.find('.history-card').exists()).toBe(true);
      expect(newWrapper.find('.history-item').text()).toContain('test');

      await newWrapper.find('.clear-btn').trigger('click');
      expect(historyMocks.clearHistory).toHaveBeenCalled();
    });

    it('記錄到歷史時應截斷長輸入', async () => {
      await wrapper.find('#base64-input').setValue('a'.repeat(50));
      await flushPromises();
      await wrapper.find('.record-btn').trigger('click');
      expect(historyMocks.addToHistory).toHaveBeenCalledWith(
        'base64',
        expect.stringContaining('...'),
        expect.any(String)
      );
    });

    it('應能刪除單筆紀錄', async () => {
      historyMocks.history = [{ id: 1, timestamp: '12:00', input: 'test', output: 'dGVzdA==' }];
      const newWrapper = mount(Base64Converter, mountOptions);
      await newWrapper.find('.delete-btn').trigger('click');
      expect(historyMocks.removeFromHistory).toHaveBeenCalledWith(1);
    });
  });
});
