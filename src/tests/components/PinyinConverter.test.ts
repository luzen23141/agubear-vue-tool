import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount, DOMWrapper } from '@vue/test-utils';
import PinyinConverter from '@/views/PinyinConverter.vue';
import { setupI18n } from '@/i18n';
import { TOAST_KEY } from '@/composables/use-toast-key';
import { ref } from 'vue';

const i18n = setupI18n();

const mountOptions = {
  global: {
    plugins: [i18n],
    provide: {
      [TOAST_KEY as symbol]: vi.fn()
    }
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
      expect(wrapper.get('h2').text()).toContain('拼音');
    });

    it('應渲染 textarea', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      expect(wrapper.find('textarea').exists()).toBe(true);
    });

    it('應渲染轉換按鈕', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const button = wrapper.find('.action-buttons button');
      expect(button.exists()).toBe(true);
      expect(button.text()).toContain('轉換');
    });

    it('應渲染聲調開關', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const checkbox = wrapper.find('#show-tone');
      expect(checkbox.exists()).toBe(true);
    });
  });

  describe('拼音轉換', () => {
    it('輸入中文應轉換為不帶聲調拼音 (預設)', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).setValue('你好');
      await wrapper.find('.action-buttons button').trigger('click');
      await flushPromises();
      expect((wrapper.get('#pinyin-output') as DOMWrapper<HTMLTextAreaElement>).element.value).toBe(
        'ni hao'
      );
    });

    it('開啟聲調應產生帶聲調拼音', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.get('#show-tone').setValue(true);
      await (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).setValue('你好');
      await wrapper.find('.action-buttons button').trigger('click');
      await flushPromises();
      expect((wrapper.get('#pinyin-output') as DOMWrapper<HTMLTextAreaElement>).element.value).toBe(
        'nǐ hǎo'
      );
    });

    it('關閉空格應產生無空格拼音', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await wrapper.get('#show-spaces').setValue(false);
      await (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).setValue('你好');
      await wrapper.find('.action-buttons button').trigger('click');
      await flushPromises();
      expect((wrapper.get('#pinyin-output') as DOMWrapper<HTMLTextAreaElement>).element.value).toBe(
        'nihao'
      );
    });

    it('空輸入不應產生結果', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).setValue('');
      await wrapper.find('.action-buttons button').trigger('click');
      await flushPromises();
      expect(wrapper.find('#pinyin-output').exists()).toBe(false);
    });

    it('多個漢字應正確轉換', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).setValue(
        '中華人民共和國'
      );
      await wrapper.find('.action-buttons button').trigger('click');
      await flushPromises();
      const result = (wrapper.get('#pinyin-output') as DOMWrapper<HTMLTextAreaElement>).element
        .value;
      expect(result).toContain('zhong hua');
    });

    it('應處理中英混合與標點', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).setValue(
        '你好 context'
      );
      await wrapper.find('.action-buttons button').trigger('click');
      await flushPromises();
      const result = (wrapper.get('#pinyin-output') as DOMWrapper<HTMLTextAreaElement>).element
        .value;
      expect(result).toContain('ni hao  context');
    });
  });

  describe('歷史紀錄', () => {
    it('轉換後應記錄到歷史', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).setValue('你好');
      await wrapper.find('.action-buttons button').trigger('click');
      await flushPromises();

      expect(addToHistoryMock).toHaveBeenCalledWith('pinyin', '你好', 'ni hao');
    });

    it('長文字應被截斷後記錄', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const longText = '中'.repeat(20);
      await (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).setValue(longText);
      await wrapper.find('.action-buttons button').trigger('click');
      await flushPromises();

      const lastCall = addToHistoryMock.mock.calls.at(-1);
      const calledInput = lastCall ? lastCall[1] : '';
      expect(calledInput).toContain('...');
      expect(calledInput.length).toBeLessThanOrEqual(18); // 15 + '...'
    });
  });

  describe('操作功能', () => {
    it('點擊結果區域應觸發複製', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      await (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).setValue('你好');
      await wrapper.find('.action-buttons button').trigger('click');
      await flushPromises();

      const copyButton = wrapper
        .find('#pinyin-output')
        .element.parentElement?.parentElement?.querySelector('.copy-btn-overlay');
      if (copyButton) {
        await (copyButton as HTMLElement).click();
        expect(mockClipboardWrite).toHaveBeenCalled();
      }
    });

    it('點擊貼上按鈕應更新輸入', async () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const pasteButton = wrapper.find('.paste-btn');
      if (pasteButton.exists()) {
        await pasteButton.trigger('click');
        await flushPromises();
        expect(mockClipboardRead).toHaveBeenCalled();
        expect(
          (wrapper.get('#pinyin-input') as DOMWrapper<HTMLTextAreaElement>).element.value
        ).toBe('test content');
      }
    });
  });

  describe('Accessibility', () => {
    it('textarea 應有 aria-label', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      expect(wrapper.get('#pinyin-input').attributes('aria-label')).toBeTruthy();
    });

    it('轉換按鈕應有 aria-label', () => {
      const wrapper = mount(PinyinConverter, mountOptions);
      const button = wrapper.find('.action-buttons button');
      expect(button.attributes('aria-label')).toBeTruthy();
    });
  });
});
