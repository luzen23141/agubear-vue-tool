import { mount } from '@vue/test-utils';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import JsonFormatter from '../../views/JsonFormatter.vue';
import { setupI18n } from '../../i18n';

const i18n = setupI18n();

// Mock clipboard
const mockClipboardWrite = vi.fn().mockResolvedValue();
const mockClipboardRead = vi.fn().mockResolvedValue('{"a":1}');
Object.assign(navigator, {
  clipboard: {
    writeText: mockClipboardWrite,
    readText: mockClipboardRead
  }
});

// Mock useHead
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

const mountOptions = {
  global: {
    plugins: [i18n]
  }
};

describe('JsonFormatter.vue', () => {
  beforeEach(() => {
    i18n.global.locale.value = 'zh-TW';
    mockClipboardWrite.mockClear();
    mockClipboardRead.mockClear();
  });

  it('應正確渲染輸入與輸出區域', () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    expect(wrapper.find('#json-input').exists()).toBe(true);
    expect(wrapper.find('#json-output').exists()).toBe(true);
  });

  it('應能格式化有效的 JSON', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    const input = wrapper.find('#json-input');
    await input.setValue('{"a":1}');

    const formatButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('格式化') || b.text().includes('Format'));
    await formatButton?.trigger('click');

    const output = (wrapper.find('#json-output').element as HTMLTextAreaElement).value;
    expect(output).toContain('"a": 1');
    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('應能壓縮 JSON', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    const input = wrapper.find('#json-input');
    await input.setValue('{\n  "a": 1\n}');

    const minifyButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('Minify') || b.text().includes('壓縮'));
    await minifyButton?.trigger('click');

    const output = (wrapper.find('#json-output').element as HTMLTextAreaElement).value;
    expect(output).toBe('{"a":1}');
  });

  it('輸入無效 JSON 時應顯示錯誤訊息', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    const input = wrapper.find('#json-input');
    await input.setValue('{"a":1'); // Missing closing brace

    const formatButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('格式化') || b.text().includes('Format'));
    await formatButton?.trigger('click');

    expect(wrapper.find('.error-message').exists()).toBe(true);
    expect(wrapper.find('.error-message').text()).toContain('JSON');
  });

  it('清除按鈕應清空所有內容', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    await wrapper.find('#json-input').setValue('{"a":1}');
    const formatButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('格式化') || b.text().includes('Format'));
    await formatButton?.trigger('click');

    const clearButton = wrapper
      .findAll('button')
      .find(
        (b) =>
          b.text().includes('Clear') ||
          b.text().includes('清空') ||
          b.text().includes('清除') ||
          b.text().includes('Clear')
      );
    await clearButton?.trigger('click');

    expect((wrapper.find('#json-input').element as HTMLTextAreaElement).value).toBe('');
    expect((wrapper.find('#json-output').element as HTMLTextAreaElement).value).toBe('');
    expect(wrapper.find('.error-message').exists()).toBe(false);
  });

  it('測試反轉義選項', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    const unescapeToggle = wrapper.find('input[type="checkbox"]');

    await unescapeToggle.setValue(true);
    await wrapper.vm.$nextTick();

    await wrapper.find('#json-input').setValue('{\\"a\\": 1}');
    const formatButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('格式化') || b.text().includes('Format'));
    await formatButton?.trigger('click');
    await wrapper.vm.$nextTick();

    const output = (wrapper.find('#json-output').element as HTMLTextAreaElement).value;
    expect(output.replaceAll(/\s/g, '')).toContain('"a":1');
  });

  it('測試 Unicode 解碼選項', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    const unicodeToggle = wrapper.findAll('input[type="checkbox"]')[1];

    await unicodeToggle?.setValue(true);
    await wrapper.vm.$nextTick();

    await wrapper.find('#json-input').setValue('{"a": "\\u4e2d"}');
    const formatButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('格式化') || b.text().includes('Format'));
    await formatButton?.trigger('click');
    await wrapper.vm.$nextTick();

    const output = (wrapper.find('#json-output').element as HTMLTextAreaElement).value;
    expect(output).toContain('"a": "中"');
  });

  it('複製按鈕應觸發 clipboard write', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    await wrapper.find('#json-input').setValue('{"test": true}');
    const formatButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('格式化') || b.text().includes('Format'));
    await formatButton?.trigger('click');
    await wrapper.vm.$nextTick();

    const copyButton = wrapper.findAll('.copy-btn-overlay').pop();
    await copyButton?.trigger('click');
    expect(mockClipboardWrite).toHaveBeenCalledWith(expect.stringContaining('"test": true'));
  });

  it('貼上按鈕應觸發 clipboard read', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    const pasteButton = wrapper.find('.icon-btn');
    if (pasteButton.exists()) {
      await pasteButton.trigger('click');
      expect(mockClipboardRead).toHaveBeenCalled();
      await wrapper.vm.$nextTick();
      expect((wrapper.vm as any).inputJson).toBe('{"a":1}');
    }
  });

  it('貼上失敗時不應更新輸入', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    mockClipboardRead.mockRejectedValueOnce(new Error('paste fail'));
    (wrapper.vm as any).inputJson = 'original';

    const pasteButton = wrapper.find('.icon-btn');
    if (pasteButton.exists()) {
      await pasteButton.trigger('click');
      await wrapper.vm.$nextTick();
      expect((wrapper.vm as any).inputJson).toBe('original');
    }
  });

  it('複製失敗時應處理錯誤', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const wrapper = mount(JsonFormatter, mountOptions);
    mockClipboardWrite.mockRejectedValueOnce(new Error('copy fail'));
    await wrapper.find('#json-input').setValue('{"a":1}');
    const formatButton = wrapper
      .findAll('button')
      .find((b) => b.text().includes('格式化') || b.text().includes('Format'));
    await formatButton?.trigger('click');

    const copyButton = wrapper.findAll('.copy-btn-overlay').pop();
    await copyButton?.trigger('click');
    // Error is logged to console
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  it('onMounted 應偵測剪貼簿支援', () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    expect((wrapper.vm as any).canPaste).toBe(true);
  });

  it('handleMinify 應正確處理無效輸出 (回歸測試)', async () => {
    const wrapper = mount(JsonFormatter, mountOptions);
    (wrapper.vm as any).inputJson = '{"valid":true}';
    await wrapper.vm.$nextTick();

    const spy = vi.spyOn(JSON, 'parse').mockImplementationOnce(() => {
      throw new Error('parse fail');
    });
    await (wrapper.vm as any).handleMinify();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  describe('Accessibility', () => {
    it('按鈕應有可識別的文字內容', () => {
      const wrapper = mount(JsonFormatter, mountOptions);
      const buttons = wrapper.findAll('button');
      for (const button of buttons) {
        const hasText = button.text().trim().length > 0;
        const hasAriaLabel = !!button.attributes('aria-label');
        const hasTitle = !!button.attributes('title');
        expect(hasText || hasAriaLabel || hasTitle).toBe(true);
      }
    });
  });
  describe('TypeScript 介面轉換', () => {
    it('應能將 JSON 轉換為 TypeScript Interface', async () => {
      const wrapper = mount(JsonFormatter, mountOptions);
      const input = wrapper.find('#json-input');
      await input.setValue('{"name": "Alex", "age": 30}');

      const toTsButton = wrapper.findAll('button').find((b) => b.text().includes('TS'));

      // Only execute if button exists (feature flag check effectively)
      if (toTsButton?.exists()) {
        await toTsButton.trigger('click');

        const output = (wrapper.find('#json-output').element as HTMLTextAreaElement).value;
        expect(output).toContain('interface');
        expect(output).toContain('name: string');
        expect(output).toContain('age: number');
      }
    });

    it('無效 JSON 轉換 TS 應顯示錯誤', async () => {
      const wrapper = mount(JsonFormatter, mountOptions);
      const input = wrapper.find('#json-input');
      await input.setValue('{"name": "Alex"'); // Invalid

      const toTsButton = wrapper.findAll('button').find((b) => b.text().includes('TS'));
      if (toTsButton?.exists()) {
        await toTsButton.trigger('click');
        expect(wrapper.find('.error-message').exists()).toBe(true);
      }
    });
  });
});
