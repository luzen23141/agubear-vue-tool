import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UuidGenerator from '../../components/UuidGenerator.vue';

// Mock vue-i18n
vi.mock('vue-i18n', async () => {
  const { ref } = await import('vue');
  return {
    useI18n: () => ({
      t: (key: string) => key,
      tm: () => [],
      locale: ref('en')
    })
  };
});

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
        showToast
      }
    }
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(UuidGenerator, mountOptions);
    expect(wrapper.find('.uuid-generator').exists()).toBe(true);
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
    const generateBtn = wrapper.find('.generate-btn');
    await generateBtn.trigger('click');

    const textarea = wrapper.find('textarea');
    const lines = textarea.element.value.split('\n');
    expect(lines.length).toBe(3);
    expect(lines[0]).toBe('mock-uuid-v4');
  });

  it('switches types', async () => {
    const wrapper = mount(UuidGenerator, mountOptions);

    // Switch to v7
    const v7Input = wrapper.findAll('input[type="radio"]').find((i) => i.element.value === 'v7');
    await v7Input?.setValue();

    const generateBtn = wrapper.find('.generate-btn');
    await generateBtn.trigger('click');

    expect(wrapper.find('textarea').element.value).toContain('mock-uuid-v7');

    // Switch to ULID
    const ulidInput = wrapper
      .findAll('input[type="radio"]')
      .find((i) => i.element.value === 'ulid');
    await ulidInput?.setValue();

    await generateBtn.trigger('click');
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
    const copyBtn = wrapper.find('.copy-btn');

    await copyBtn.trigger('click');
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('mock-uuid-v4')
    );
    expect(showToast).toHaveBeenCalledWith(expect.anything(), 'success');
  });
});
