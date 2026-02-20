import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import DiffChecker from '../../views/DiffChecker.vue';

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

// Mock diff-match-patch if necessary.
// For now, let's try using the actual library if possible,
// but if it has issues in JSDOM, we mock it.
// Assuming it works.

describe('DiffChecker.vue', () => {
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
    const wrapper = mount(DiffChecker, mountOptions);
    expect(wrapper.find('.diff-checker').exists()).toBe(true);
    // Two textareas
    expect(wrapper.findAll('textarea').length).toBe(2);
  });

  it('computes diff correctly', async () => {
    const wrapper = mount(DiffChecker, mountOptions);
    const textareas = wrapper.findAll('textarea');

    await textareas[0]?.setValue('Hello World');
    await textareas[1]?.setValue('Hello Vue');

    const computeButton = wrapper.findAll('button').find((b) => b.text().includes('compare'));
    expect(computeButton).toBeDefined();
    await computeButton?.trigger('click');

    // Result should be visible
    expect(wrapper.find('.diff-output-container').exists()).toBe(true);
    const html = wrapper.find('.diff-output').html();
    // Should contain "World" as deleted and "Vue" as inserted ?
    // Or "Hello " as common.
    // diff-match-patch logic:
    // Hello World -> Hello Vue
    // = Hello <del>World</del><ins>Vue</ins>
    expect(html).toContain('Hello');
    expect(html).toContain('World');
    expect(html).toContain('Vue');
  });

  it('swaps inputs', async () => {
    const wrapper = mount(DiffChecker, mountOptions);
    const textareas = wrapper.findAll('textarea');

    await textareas[0]?.setValue('A');
    await textareas[1]?.setValue('B');

    const swapButton = wrapper.findAll('button').find((b) => b.text().includes('swap'));
    await swapButton?.trigger('click');

    expect(textareas[0]?.element.value).toBe('B');
    expect(textareas[1]?.element.value).toBe('A');
  });

  it('clears inputs', async () => {
    const wrapper = mount(DiffChecker, mountOptions);
    const textareas = wrapper.findAll('textarea');

    await textareas[0]?.setValue('A');
    await textareas[1]?.setValue('B');

    const clearButton = wrapper.findAll('button').find((b) => b.text().includes('clear'));
    await clearButton?.trigger('click');

    expect(textareas[0]?.element.value).toBe('');
    expect(textareas[1]?.element.value).toBe('');
    expect(wrapper.find('.diff-output-container').exists()).toBe(false);
  });

  it('shows warning on empty input', async () => {
    const wrapper = mount(DiffChecker, mountOptions);
    const computeButton = wrapper.findAll('button').find((b) => b.text().includes('compare'));

    await computeButton?.trigger('click');

    expect(showToast).toHaveBeenCalledWith(expect.anything(), 'info');
    expect(wrapper.find('.diff-output-container').exists()).toBe(false);
  });
});
