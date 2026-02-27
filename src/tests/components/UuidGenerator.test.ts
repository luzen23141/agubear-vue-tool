import { describe, it, expect, vi, beforeEach } from 'vitest';
import { flushPromises, mount, DOMWrapper } from '@vue/test-utils';
import UuidGenerator from '@/views/UuidGenerator.vue';
import { TOAST_KEY } from '../../composables/use-toast-key';

// Mock vue-i18n
vi.mock('vue-i18n', async () => ({
  useI18n: () => ({
    t: (key: string) => key,
    tm: () => [],
    locale: { value: 'en' }
  })
}));

// Mock @unhead/vue
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

// Mock uuid and ulid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'mock-uuid-v4'),
  v7: vi.fn(() => 'mock-uuid-v7')
}));

vi.mock('ulid', () => ({
  ulid: vi.fn(() => 'mock-ulid')
}));

describe('UuidGenerator.vue', () => {
  const showToast = vi.fn();
  const mountOptions = {
    global: {
      provide: {
        [TOAST_KEY as symbol]: showToast
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial state', async () => {
    const wrapper = mount(UuidGenerator, mountOptions);
    await flushPromises();
    expect(wrapper.find('.generate-btn').exists()).toBe(true);
    // Initial generation on mounted
    expect(
      (wrapper.get('#uuid-output') as DOMWrapper<HTMLTextAreaElement>).element.value
    ).toContain('-');
  });

  it('generates UUID v4 by default', async () => {
    const wrapper = mount(UuidGenerator, mountOptions);
    await flushPromises();
    // Initial generation on mount
    const textarea = wrapper.find('textarea');
    expect(textarea.element.value).toContain('mock-uuid-v4');
  });

  it('generates multiple IDs', async () => {
    const wrapper = mount(UuidGenerator, mountOptions);
    const slider = wrapper.find('input[type="range"]');

    await slider.setValue(3);
    const generateButton = wrapper.find('.generate-btn');
    await generateButton.trigger('click');

    const textarea = wrapper.find('textarea');
    const lines = textarea.element.value.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('mock-uuid-v4');
  });

  it('switches types', async () => {
    const wrapper = mount(UuidGenerator, mountOptions);

    // Switch to v7
    const v7Input = wrapper
      .findAll('input[type="radio"]')
      .find((w) => (w.element as HTMLInputElement).value === 'v7');
    await v7Input?.setValue();

    const generateButton = wrapper.find('.generate-btn');
    await generateButton.trigger('click');

    expect(wrapper.find('textarea').element.value).toContain('mock-uuid-v7');

    // Switch to ULID
    const ulidInput = wrapper
      .findAll('input[type="radio"]')
      .find((w) => (w.element as HTMLInputElement).value === 'ulid');
    await ulidInput?.setValue();

    await generateButton.trigger('click');
    expect(wrapper.find('textarea').element.value).toContain('mock-ulid');
  });

  it('copies output to clipboard', async () => {
    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });
    const wrapper = mount(UuidGenerator, mountOptions);
    await flushPromises();
    const copyButton = wrapper.find('.copy-btn-overlay');
    if (copyButton.exists()) {
      await copyButton.trigger('click');
    } else {
      const buttons = wrapper.findAll('button');
      const button = buttons.find(
        (b) => b.attributes('title')?.includes('common.copy') || b.text().includes('common.copy')
      );
      await button?.trigger('click');
    }
    await flushPromises();
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(expect.anything(), 'success');
  });
});
