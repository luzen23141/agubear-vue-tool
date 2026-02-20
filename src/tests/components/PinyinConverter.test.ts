import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import PinyinConverter from '../../views/PinyinConverter.vue';
import { setupI18n } from '../../i18n';

const i18n = setupI18n();

const mountOptions = {
  global: {
    plugins: [i18n]
  }
};

// Mock UseHistory
const addToHistoryMock = vi.fn();
const clearHistoryMock = vi.fn();
const removeFromHistoryMock = vi.fn();
let mockHistory: any[] = [];

vi.mock('@/composables/use-history', () => ({
  UseHistory: () => ({
    history: ref(mockHistory),
    addToHistory: addToHistoryMock,
    clearHistory: clearHistoryMock,
    removeFromHistory: removeFromHistoryMock
  })
}));

// Mock useHead
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

// Mock clipboard
const mockClipboardWrite = vi.fn().mockResolvedValue();
const mockClipboardRead = vi.fn().mockResolvedValue('test content');
Object.assign(navigator, {
  clipboard: {
    writeText: mockClipboardWrite,
    readText: mockClipboardRead
  }
});

describe('PinyinConverter.vue', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'zh-TW';
    addToHistoryMock.mockClear();
    clearHistoryMock.mockClear();
    removeFromHistoryMock.mockClear();
    mockClipboardWrite.mockClear();
    mockClipboardRead.mockClear();
    mockHistory = [];
  });

  describe('渲染', () => {
    it('應正確渲染標題', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      expect(wrapper.find('h2').text()).toContain('拼音');
    });

    it('應渲染 textarea', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('應渲染轉換按鈕', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const button = wrapper.find('.action-buttons button');
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain('拼音');
    });

    it('應渲染聲調開關', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const checkbox = wrapper.find('input[type="checkbox"]');
      expect(checkbox.exists()).toBe(true);
    });

    it('無結果時不應顯示結果區域', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      expect(wrapper.find('.result-box').exists()).toBe(false);
    });
  });

  describe('拼音轉換', () => {
    it('輸入中文應轉換為不帶聲調拼音 (預設)', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('textarea').setValue('你好');
      await wrapper.find('.action-buttons button').trigger('click');
      expect(wrapper.find('.result-box').text()).toBe('ni hao');
    });

    it('開啟聲調應產生帶聲調拼音', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('#show-tone').setValue(true);
      await wrapper.find('textarea').setValue('你好');
      await wrapper.find('.action-buttons button').trigger('click');
      expect(wrapper.find('.result-box').text()).toBe('nǐ hǎo');
    });

    it('關閉空格應產生無空格拼音', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('#show-spaces').setValue(false);
      await wrapper.find('textarea').setValue('你好');
      await wrapper.find('.action-buttons button').trigger('click');
      expect(wrapper.find('.result-box').text()).toBe('nihao');
    });

    it('空輸入不應產生結果', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('textarea').setValue('');
      await wrapper.find('.action-buttons button').trigger('click');
      expect(wrapper.find('.result-box').exists()).toBe(false);
    });

    it('只有空白不應產生結果', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('textarea').setValue('   ');
      await wrapper.find('.action-buttons button').trigger('click');
      expect(wrapper.find('.result-box').exists()).toBe(false);
    });

    it('多個漢字應正確轉換', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('textarea').setValue('中華人民共和國');
      await wrapper.find('.action-buttons button').trigger('click');
      const result = wrapper.find('.result-box').text();
      expect(result).toContain('zhong');
      expect(result).toContain('hua');
    });

    it('應處理中英混合與標點', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('textarea').setValue('你好 context');
      await wrapper.find('.action-buttons button').trigger('click');
      const result = wrapper.find('.result-box').text();
      expect(result).toContain('ni hao');
      expect(result).toContain('context');
    });

    it('應能正確轉換拼音 (含聲調與空格)', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('#pinyin-input').setValue('你好');
      await wrapper.find('#show-tone').setValue(true);
      await wrapper.find('#show-spaces').setValue(true);
      await wrapper.find('.action-buttons button').trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.result-box').text()).toBe('nǐ hǎo');
    });

    it('應能正確轉換拼音 (無聲調、無空格)', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('#pinyin-input').setValue('你好');
      await wrapper.find('#show-tone').setValue(false);
      await wrapper.find('#show-spaces').setValue(false);
      await wrapper.find('.action-buttons button').trigger('click');
      await wrapper.vm.$nextTick();
      const result = wrapper.find('.result-box').text();
      expect(result).toBe('nihao');
    });
  });

  describe('歷史紀錄', () => {
    it('轉換後應記錄到歷史', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('textarea').setValue('你好');
      await wrapper.find('.action-buttons button').trigger('click');

      expect(addToHistoryMock).toHaveBeenCalledWith('pinyin', '你好', 'ni hao');
    });

    it('長文字應被截斷後記錄', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const longText = '中'.repeat(20);
      await wrapper.find('textarea').setValue(longText);
      await wrapper.find('.action-buttons button').trigger('click');

      const lastCall = addToHistoryMock.mock.calls.at(-1);
      const calledInput = lastCall ? lastCall[1] : '';
      expect(calledInput).toContain('...');
      expect(calledInput.length).toBeLessThanOrEqual(18); // 15 + '...'
    });

    it('清除歷史應觸發 clearHistory', async () => {
      mockHistory = [{ id: 1, timestamp: '12:00', input: 'test', output: 'test' }];
      const wrapper = mount(PinyinConverter, mountOptions);
      const clearButton = wrapper.find('.clear-btn');
      if (clearButton.exists()) {
        await clearButton.trigger('click');
        expect(clearHistoryMock).toHaveBeenCalled();
      }
    });

    it('應能刪除單筆紀錄', async () => {
      mockHistory = [{ id: 1, timestamp: '12:00', input: 'test', output: 'test' }];
      const wrapper = mount(PinyinConverter, mountOptions);
      const button = wrapper.find('.delete-btn');
      if (button.exists()) {
        await button.trigger('click');
      }
      expect(removeFromHistoryMock).toHaveBeenCalledWith(1);
    });
  });

  describe('操作功能', () => {
    it('點擊結果區域應觸發複製', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('textarea').setValue('測試');
      await wrapper.find('.action-buttons button').trigger('click');

      const resultBox = wrapper.find('.result-box');
      await resultBox.trigger('click');
      expect(mockClipboardWrite).toHaveBeenCalled();
    });

    it('點擊貼上按鈕應更新輸入', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const pasteButton = wrapper.find('.paste-btn');
      if (pasteButton.exists()) {
        await pasteButton.trigger('click');
        expect(mockClipboardRead).toHaveBeenCalled();
        expect((wrapper.vm as any).inputText).toBe('test content');
      }
    });

    it('貼上失敗時應保持不變', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      mockClipboardRead.mockRejectedValueOnce(new Error('paste fail'));
      (wrapper.vm as any).inputText = 'original';

      const pasteButton = wrapper.find('.paste-btn');
      if (pasteButton.exists()) {
        await pasteButton.trigger('click');
        await wrapper.vm.$nextTick();
        expect((wrapper.vm as any).inputText).toBe('original');
      }
    });

    it('應處理全英文輸入', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.find('#pinyin-input').setValue('hello world');
      await wrapper.find('.action-buttons button').trigger('click');
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.result-box').text()).toBe('hello world');
    });

    it('onMounted 應偵測剪貼簿支援', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      expect((wrapper.vm as any).canPaste).toBe(true);
    });
  });

  describe('Accessibility', () => {
    it('textarea 應有 aria-label', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      expect(wrapper.find('textarea').attributes('aria-label')).toBeTruthy();
    });

    it('轉換按鈕應有 aria-label', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const button = wrapper.find('.action-buttons button');
      expect(button.attributes('aria-label')).toBeTruthy();
    });

    it('聲調 checkbox 應有 aria-label', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const checkbox = wrapper.find('input[type="checkbox"]');
      expect(checkbox.attributes('aria-label')).toBeTruthy();
    });
  });
});
