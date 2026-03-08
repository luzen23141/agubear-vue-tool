import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { UseLocalStorage } from '@/composables/use-local-storage';

// Helper: wraps the composable in a tiny component so onMounted fires
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

describe('UseLocalStorage', () => {
  const originalWindow = globalThis.window;

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      writable: true,
      configurable: true
    });
  });

  it('returns the initial value when localStorage is empty', () => {
    const { result } = withSetup(() => UseLocalStorage('test-key', 42));
    expect(result.value).toBe(42);
  });

  it('reads an existing value from localStorage on mount', async () => {
    localStorage.setItem('existing-key', JSON.stringify('stored-value'));
    const { result } = withSetup(() => UseLocalStorage('existing-key', 'default'));
    await nextTick();
    expect(result.value).toBe('stored-value');
  });

  it('writes value to localStorage when it changes', async () => {
    const { result } = withSetup(() => UseLocalStorage('write-key', 'a'));
    result.value = 'b';
    await nextTick();
    expect(localStorage.setItem).toHaveBeenCalledWith('write-key', JSON.stringify('b'));
  });

  it('removes from localStorage when value is undefined', async () => {
    const { result } = withSetup(() => UseLocalStorage<string | undefined>('undef-key', 'initial'));
    result.value = globalThis.undefined;
    await nextTick();

    expect(localStorage.removeItem).toHaveBeenCalledWith('undef-key');
  });

  it('skips write when globalThis.localStorage is unavailable', async () => {
    vi.stubGlobal('localStorage', globalThis.undefined);
    const { result } = withSetup(() => UseLocalStorage('no-client-write', 'a'));

    result.value = 'b';
    await nextTick();

    expect(result.value).toBe('b');
  });

  it('handles JSON parse errors gracefully (returns raw string)', async () => {
    localStorage.setItem('bad-json', 'not-valid-json');
    const { result } = withSetup(() => UseLocalStorage('bad-json', 'fallback'));
    await nextTick();
    expect(result.value).toBe('not-valid-json');
  });

  it('returns null when globalThis.localStorage is unavailable', () => {
    vi.stubGlobal('localStorage', globalThis.undefined);
    const { result } = withSetup(() => UseLocalStorage('no-storage', 'fallback'));

    expect(result.value).toBe('fallback');
  });

  it('reads an existing value outside component setup', () => {
    localStorage.setItem('outside-setup-key', JSON.stringify('stored-outside'));
    const result = UseLocalStorage('outside-setup-key', 'fallback');

    expect(result.value).toBe('stored-outside');
  });

  it('skips write when window.localStorage is unavailable', async () => {
    Object.defineProperty(globalThis, 'window', {
      value: { localStorage: undefined },
      writable: true,
      configurable: true
    });

    const setItemSpy = vi.spyOn(localStorage, 'setItem');
    const { result } = withSetup(() => UseLocalStorage('skip-write', 'a'));
    result.value = 'b';
    await nextTick();

    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('handles localStorage read errors gracefully', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const getItemSpy = vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('read-failed');
    });

    const { result } = withSetup(() => UseLocalStorage('read-error', 'fallback'));
    await nextTick();

    expect(result.value).toBe('fallback');
    expect(getItemSpy).toHaveBeenCalledWith('read-error');
    expect(warnSpy).toHaveBeenCalled();
  });
});
