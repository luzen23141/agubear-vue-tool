import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ColorConverter from '../../views/ColorConverter.vue';
import { TOAST_KEY } from '../../composables/use-toast-key';

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

describe('ColorConverter.vue', () => {
  const showToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock clipboard
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve())
      }
    });

    // Provide mock
    // We can use global.provide in mount options
  });

  const mountOptions = {
    global: {
      provide: {
        [TOAST_KEY as symbol]: showToast
      }
    }
  };

  it('renders correctly', () => {
    const wrapper = mount(ColorConverter, mountOptions);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.findAll('input[type="color"]').length).toBe(1);
    expect(wrapper.find('#color-hex').exists()).toBe(true);
  });

  it('updates all fields when HEX is changed', async () => {
    const wrapper = mount(ColorConverter, mountOptions);
    const hexInput = wrapper.find('#color-hex');
    const rgbInput = wrapper.find('#color-rgb');
    const hslInput = wrapper.find('#color-hsl');

    // Set HEX to pure red
    await hexInput.setValue('#ff0000');

    // Check RGB
    expect((rgbInput.element as HTMLTextAreaElement).value).toBe('rgb(255, 0, 0)');
    // Check HSL (approx)
    expect((hslInput.element as HTMLTextAreaElement).value).toContain('hsl(0, 100%, 50%)');
  });

  it('updates all fields when RGB is changed', async () => {
    const wrapper = mount(ColorConverter, mountOptions);
    const hexInput = wrapper.find('#color-hex');
    const rgbInput = wrapper.find('#color-rgb');

    await rgbInput.setValue('rgb(0, 0, 255)'); // Blue

    expect((hexInput.element as HTMLTextAreaElement).value).toBe('#0000ff');
  });

  it('copies to clipboard when button clicked', async () => {
    const wrapper = mount(ColorConverter, mountOptions);
    const copyBtns = wrapper.findAll('.copy-btn-overlay');

    await copyBtns[0]?.trigger('click');
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(expect.anything(), 'success');
  });

  it('ignores invalid input', async () => {
    const wrapper = mount(ColorConverter, mountOptions);
    const hexInput = wrapper.find('#color-hex');
    const rgbInput = wrapper.find('#color-rgb');

    const originalRgb = (rgbInput.element as HTMLTextAreaElement).value;

    await hexInput.setValue('invalid-hex');

    // RGB should NOT change
    expect((rgbInput.element as HTMLTextAreaElement).value).toBe(originalRgb);
  });
});
