import { describe, it, expect, vi, beforeEach } from 'vitest';
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
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
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

  it('removes from localStorage when value is null', async () => {
    const { result } = withSetup(() => UseLocalStorage<string | null>('null-key', 'initial'));
    result.value = null;
    await nextTick();
    expect(localStorage.removeItem).toHaveBeenCalledWith('null-key');
  });

  it('handles JSON parse errors gracefully (returns raw string)', async () => {
    localStorage.setItem('bad-json', 'not-valid-json');
    const { result } = withSetup(() => UseLocalStorage('bad-json', 'fallback'));
    await nextTick();
    expect(result.value).toBe('not-valid-json');
  });

  it('supports object values with deep watch', async () => {
    const { result } = withSetup(() => UseLocalStorage('obj-key', { count: 0, items: ['a'] }));
    result.value.count = 5;
    await nextTick();
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'obj-key',
      JSON.stringify({ count: 5, items: ['a'] })
    );
  });
});
