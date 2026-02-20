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
    expect(wrapper.find('.color-converter').exists()).toBe(true);
    expect(wrapper.findAll('input').length).toBeGreaterThan(0);
  });

  it('updates all fields when HEX is changed', async () => {
    const wrapper = mount(ColorConverter, mountOptions);
    const inputs = wrapper.findAll('.input-wrapper input');
    const hexInput = inputs[0]; // HEX is first
    const rgbInput = inputs[1]; // RGB is second

    if (!hexInput || !rgbInput) throw new Error('Inputs not found');

    // Set HEX to pure red
    await hexInput.setValue('#ff0000');

    // Check RGB
    expect(rgbInput.element.value).toBe('rgb(255, 0, 0)');
    // Check HSL (approx)
    expect(wrapper.find('input[placeholder="hsl(0, 0%, 0%)"]').element.value).toContain(
      'hsl(0, 100%, 50%)'
    );
  });

  it('updates all fields when RGB is changed', async () => {
    const wrapper = mount(ColorConverter, mountOptions);
    const inputs = wrapper.findAll('.input-wrapper input');
    const hexInput = inputs[0];
    const rgbInput = inputs[1];

    if (!hexInput || !rgbInput) throw new Error('Inputs not found');

    await rgbInput.setValue('rgb(0, 0, 255)'); // Blue

    expect(hexInput.element.value).toBe('#0000ff');
  });

  it('copies to clipboard when button clicked', async () => {
    const wrapper = mount(ColorConverter, mountOptions);
    const copyBtns = wrapper.findAll('.copy-btn');

    await copyBtns[0]?.trigger('click');
    expect(navigator.clipboard.writeText).toHaveBeenCalled();
    expect(showToast).toHaveBeenCalledWith(expect.anything(), 'success');
  });

  it('ignores invalid input', async () => {
    const wrapper = mount(ColorConverter, mountOptions);
    const inputs = wrapper.findAll('.input-wrapper input');
    const hexInput = inputs[0];
    const rgbInput = inputs[1];

    if (!hexInput || !rgbInput) throw new Error('Inputs not found');

    const originalRgb = rgbInput.element.value;

    await hexInput.setValue('invalid-hex');

    // RGB should NOT change (or stricter: stay same as before)
    // The component logic says: if (color.isValid()) syncAll(color);
    // So invalid input just doesn't trigger sync.
    expect(rgbInput.element.value).toBe(originalRgb);
  });
});
