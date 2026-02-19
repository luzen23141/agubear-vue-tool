import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import HashGenerator from '../../components/HashGenerator.vue';
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

// Mock computeHash for error case
const mockComputeHash = vi.fn().mockImplementation((text, algo) => {
  // Original logic but we can mock it to fail
  const CryptoJS = require('crypto-js');
  try {
    const hash = CryptoJS[algo](text);
    return hash.toString(CryptoJS.enc.Hex);
  } catch (e) {
    return null;
  }
});
vi.mock('../../utils/crypto', async () => {
  const actual = (await vi.importActual('../../utils/crypto')) as any;
  return {
    ...actual,
    computeHash: (text: string, algo: string) => mockComputeHash(text, algo)
  };
});

// Mock clipboard
const mockClipboardWrite = vi.fn().mockResolvedValue(undefined);
const mockClipboardRead = vi.fn().mockResolvedValue('pasted content');
Object.assign(navigator, {
  clipboard: {
    writeText: mockClipboardWrite,
    readText: mockClipboardRead
  }
});

describe('HashGenerator.vue', () => {
  let wrapper: any;
  beforeEach(() => {
    i18n.global.locale.value = 'zh-TW';
    historyMocks.history = [];
    historyMocks.addToHistory.mockClear();
    historyMocks.clearHistory.mockClear();
    historyMocks.removeFromHistory.mockClear();
    mockClipboardWrite.mockClear();
    mockClipboardRead.mockClear();
    wrapper = mount(HashGenerator, mountOptions);
  });

  describe('渲染', () => {
    it('應正確渲染標題', () => {
      expect(wrapper.find('h2').exists()).toBe(true);
    });

    it('應渲染算法選擇器', () => {
      const select = wrapper.find('select');
      expect(select.exists()).toBe(true);
      expect(select.findAll('option').length).toBeGreaterThanOrEqual(4); // MD5, SHA1, SHA256, SHA512
    });
  });

  describe('雜湊產生', () => {
    it('預設應使用 MD5', async () => {
      await wrapper.find('#hash-input').setValue('hello');
      expect(wrapper.find('#hash-output').element.value.toLowerCase()).toBe(
        '5d41402abc4b2a76b9719d911017c592'
      );
    });

    it('切換 SHA1 應產生正確雜湊', async () => {
      await wrapper.find('#hash-input').setValue('hello');
      await wrapper.find('select').setValue('SHA1');
      expect(wrapper.find('#hash-output').element.value.toLowerCase()).toBe(
        'aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d'
      );
    });

    it('切換 SHA256 應產生正確雜湊', async () => {
      await wrapper.find('#hash-input').setValue('hello');
      await wrapper.find('select').setValue('SHA256');
      expect(wrapper.find('#hash-output').element.value.toLowerCase()).toBe(
        '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
      );
    });

    it('切換 SHA512 應產生正確雜湊', async () => {
      await wrapper.find('#hash-input').setValue('hello');
      await wrapper.find('select').setValue('SHA512');
      expect(wrapper.find('#hash-output').element.value.toLowerCase()).toBe(
        '9b71d224bd62f3785d96d46ad3ea3d73319bfbc2890caadae2dff72519673ca72323c3d99ba5c11d7c7acc6e14b8c5da0c4663475c2e5c3adef46f73bcdec043'
      );
    });

    it('應能切換大寫模式', async () => {
      await wrapper.find('#hash-input').setValue('hello');
      const checkbox = wrapper.find('input[type="checkbox"]');
      await checkbox.setChecked(true);
      expect(wrapper.find('#hash-output').element.value).toBe('5D41402ABC4B2A76B9719D911017C592');
    });
  });

  describe('歷史紀錄', () => {
    it('點擊紀錄按鈕應呼叫 addToHistory', async () => {
      await wrapper.find('#hash-input').setValue('test');
      await wrapper.vm.$nextTick();
      await wrapper.find('.btn-primary').trigger('click');
      expect(historyMocks.addToHistory).toHaveBeenCalledWith('hash', 'test', expect.any(String));
    });

    it('應顯示並能清除歷史紀錄', async () => {
      historyMocks.history = [{ id: 1, timestamp: '12:00', input: 'test', output: 'output' }];
      const newWrapper = mount(HashGenerator, mountOptions);
      expect(newWrapper.find('.history-card').exists()).toBe(true);
      expect(newWrapper.find('.history-item').text()).toContain('test');

      await newWrapper.find('.clear-btn').trigger('click');
      expect(historyMocks.clearHistory).toHaveBeenCalled();
    });

    it('應能刪除單筆紀錄', async () => {
      historyMocks.history = [{ id: 1, timestamp: '12:00', input: 'test', output: 'output' }];
      const newWrapper = mount(HashGenerator, mountOptions);
      await newWrapper.find('.delete-btn').trigger('click');
      expect(historyMocks.removeFromHistory).toHaveBeenCalledWith(1);
    });

    it('記錄到歷史時應截斷長輸入', async () => {
      await wrapper.find('#hash-input').setValue('a'.repeat(50));
      await wrapper.vm.$nextTick();
      await wrapper.find('.btn-primary').trigger('click');
      expect(historyMocks.addToHistory).toHaveBeenCalledWith(
        'hash',
        expect.stringContaining('...'),
        expect.any(String)
      );
    });
  });

  describe('其他功能', () => {
    it('點擊貼上按鈕應更新輸入', async () => {
      const pasteBtn = wrapper.find('.paste-btn');
      await pasteBtn.trigger('click');
      expect(mockClipboardRead).toHaveBeenCalled();
      expect(wrapper.vm.inputText).toBe('pasted content');
    });

    it('點擊輸入框旁複製按鈕應觸發', async () => {
      await wrapper.find('#hash-input').setValue('copy me');
      await wrapper.vm.$nextTick();
      const copyBtn = wrapper.findAll('.copy-btn-overlay')[0];
      await copyBtn.trigger('click');
      expect(mockClipboardWrite).toHaveBeenCalledWith('copy me');
    });

    it('應處理雜湊產生失敗的情況', async () => {
      const wrapper = mount(HashGenerator, mountOptions);
      mockComputeHash.mockReturnValue(null);

      await wrapper.find('#hash-input').setValue('fail test');
      await wrapper.vm.$nextTick();
      // Should not crash
      expect((wrapper.vm as any).hashResult).toBe('');
      mockComputeHash.mockRestore(); // Not really a spy but let's reset
    });
  });
});
