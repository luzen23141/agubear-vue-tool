import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { UseTheme } from '@/composables/use-theme';

describe('use-theme', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    document.documentElement.className = '';
    delete document.documentElement.dataset.theme;

    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => storage.get(key) ?? null),
      setItem: vi.fn((key: string, value: string) => {
        storage.set(key, value);
      }),
      removeItem: vi.fn((key: string) => {
        storage.delete(key);
      })
    });

    vi.stubGlobal('window', {
      localStorage: globalThis.localStorage,
      matchMedia: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn()
      }))
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('initTheme 預設使用 system 並套用 light', () => {
    const { theme, initTheme } = UseTheme();

    initTheme();

    expect(theme.value).toBe('system');
    expect(document.documentElement.dataset.theme).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('initTheme 會讀取 localStorage 並套用 dark', () => {
    storage.set('agubear-theme', 'dark');
    const { theme, initTheme } = UseTheme();

    initTheme();

    expect(theme.value).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('setTheme 會切換主題並持久化', () => {
    const { setTheme } = UseTheme();

    setTheme('high-contrast');

    expect(storage.get('agubear-theme')).toBe('high-contrast');
    expect(document.documentElement.dataset.theme).toBe('high-contrast');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggleTheme 會在 light/dark 間切換', () => {
    const { setTheme, toggleTheme } = UseTheme();

    setTheme('light');
    toggleTheme();
    expect(document.documentElement.dataset.theme).toBe('dark');

    toggleTheme();
    expect(document.documentElement.dataset.theme).toBe('light');
  });

  it('system 模式下會依偏好套用 dark', () => {
    vi.stubGlobal('window', {
      localStorage: globalThis.localStorage,
      matchMedia: vi.fn(() => ({
        matches: true,
        addEventListener: vi.fn()
      }))
    });

    const { applyTheme } = UseTheme();
    applyTheme('system');

    expect(document.documentElement.dataset.theme).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('SSR 環境不應拋錯', () => {
    const { missingGlobal } = globalThis as Record<string, unknown>;
    vi.stubGlobal('window', missingGlobal);
    vi.stubGlobal('localStorage', missingGlobal);

    const { initTheme, setTheme, applyTheme, toggleTheme } = UseTheme();

    expect(() => initTheme()).not.toThrow();
    expect(() => setTheme('dark')).not.toThrow();
    expect(() => applyTheme('dark')).not.toThrow();
    expect(() => toggleTheme()).not.toThrow();
  });
});
