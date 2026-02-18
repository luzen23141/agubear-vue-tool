import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, config } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { createI18n } from 'vue-i18n';
import { useTheme } from '@/composables/useTheme';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: {} } });
config.global.plugins = [i18n];

function withSetup<T>(composableFactory: () => T) {
  let result!: T;
  const Comp = defineComponent({
    setup() {
      result = composableFactory();
      return {};
    },
    template: '<div />'
  });
  const wrapper = mount(Comp);
  return { result, wrapper };
}

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('defaults to auto theme', () => {
    const { result } = withSetup(() => useTheme());
    expect(result.theme.value).toBe('auto');
  });

  it('loads saved theme from localStorage on mount', async () => {
    localStorage.setItem('theme', 'dark');
    const { result } = withSetup(() => useTheme());
    await nextTick();
    expect(result.theme.value).toBe('dark');
  });

  it('applies dark class when theme is dark', async () => {
    const { result } = withSetup(() => useTheme());
    result.theme.value = 'dark';
    await nextTick();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('removes dark class when theme is light', async () => {
    document.documentElement.classList.add('dark');
    const { result } = withSetup(() => useTheme());
    result.theme.value = 'light';
    await nextTick();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggleTheme cycles auto → light → dark → auto', async () => {
    const { result } = withSetup(() => useTheme());
    expect(result.theme.value).toBe('auto');

    result.toggleTheme();
    expect(result.theme.value).toBe('light');

    result.toggleTheme();
    expect(result.theme.value).toBe('dark');

    result.toggleTheme();
    expect(result.theme.value).toBe('auto');
  });

  it('removes localStorage entry when theme is set to auto', async () => {
    const { result } = withSetup(() => useTheme());
    result.theme.value = 'dark';
    await nextTick();
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');

    result.theme.value = 'auto';
    await nextTick();
    expect(localStorage.removeItem).toHaveBeenCalledWith('theme');
  });
});
