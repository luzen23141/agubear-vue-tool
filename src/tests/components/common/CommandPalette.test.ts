import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import CommandPalette from '../../../components/common/CommandPalette.vue';
import { setupI18n } from '../../../i18n';
import { nextTick } from 'vue';
import type * as VueUseCore from '@vueuse/core';

const i18n = setupI18n();

// Mock useRouter
const mockPush = vi.fn();
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: () => ({
    name: 'timestamp',
    params: { lang: 'en' }
  })
}));

// Mock useHead
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

// Mock @vueuse/core
const triggers = vi.hoisted(() => ({
  metaK: (_v: boolean) => {},
  ctrlK: (_v: boolean) => {},
  escape: (_v: boolean) => {}
}));

vi.mock('@vueuse/core', async (importOriginal) => {
  const actual = await importOriginal<typeof VueUseCore>();
  const { ref, watch } = await import('vue');

  return {
    ...actual,
    useMagicKeys: () => {
      const metaK = ref(false);
      const ctrlK = ref(false);
      const escape = ref(false);

      triggers.metaK = (v: boolean) => {
        metaK.value = v;
      };
      triggers.ctrlK = (v: boolean) => {
        ctrlK.value = v;
      };
      triggers.escape = (v: boolean) => {
        escape.value = v;
      };

      return { Meta_K: metaK, Ctrl_K: ctrlK, Escape: escape };
    },
    whenever: (source: any, callback: any) => {
      watch(source, (v: any) => {
        if (v) callback();
      });
    },
    onClickOutside: vi.fn()
  };
});

const mountOptions = {
  global: {
    plugins: [i18n],
    stubs: {
      Transition: true // Stub transition to render content immediately
    }
  },
  attachTo: document.body
};

describe('CommandPalette.vue', () => {
  beforeEach(() => {
    mockPush.mockClear();
    document.body.innerHTML = '';
    // Reset triggers
    triggers.metaK(false);
    triggers.ctrlK(false);
    triggers.escape(false);
  });

  const openPalette = async () => {
    triggers.metaK(true);
    await nextTick();
    await flushPromises();
  };

  it('預設應為隱藏狀態', () => {
    mount(CommandPalette, mountOptions);
    expect(document.querySelector('.cmd-overlay')).toBeNull();
  });

  it('按下快捷鍵 (Command+K) 應開啟', async () => {
    mount(CommandPalette, mountOptions);
    await openPalette();
    expect(document.querySelector('.cmd-overlay')).not.toBeNull();
    expect(document.querySelector('input')?.getAttribute('placeholder')).toBeTruthy();
  });

  it('按下快捷鍵 (Ctrl+K) 應開啟', async () => {
    mount(CommandPalette, mountOptions);

    triggers.ctrlK(true);
    await nextTick();
    await flushPromises();

    expect(document.querySelector('.cmd-overlay')).not.toBeNull();
  });

  it('開啟後輸入文字應過濾指令', async () => {
    mount(CommandPalette, mountOptions);
    await openPalette();

    const input =
      (document.querySelector('.cmd-input') as HTMLInputElement) || document.querySelector('input');
    expect(input).not.toBeNull();

    if (input) {
      input.value = 'Time';
      input.dispatchEvent(new Event('input'));

      await nextTick();
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 300);
      });

      const results = document.querySelectorAll('.cmd-item');
      expect(results.length).toBeGreaterThan(0);
      if (results.length > 0) {
        expect(results[0]?.textContent).toContain('Timestamp'); // Adjust to match actual content if needed
      }
    }
  });

  it('按下 Esc 應關閉', async () => {
    mount(CommandPalette, mountOptions);
    await openPalette();

    triggers.escape(true);

    await nextTick();
    await flushPromises();
    expect(document.querySelector('.cmd-overlay')).toBeNull();
  });

  it('ArrowDown 應選取下一個項目', async () => {
    mount(CommandPalette, mountOptions);
    await openPalette();

    const input = document.querySelector('.cmd-input');
    expect(input).not.toBeNull();
    if (input) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    }

    await nextTick();
    const items = document.querySelectorAll('.cmd-item');
    if (items.length > 1) {
      // Index 0 is selected by default? Or none?
      // Based on component code: selectedIndex = 0.
      // ArrowDown -> 1.
      expect(items[1]?.classList.contains('active')).toBe(true);
    }
  });

  it('Enter 應執行該指令並關閉', async () => {
    mount(CommandPalette, mountOptions);
    await openPalette();

    const input = document.querySelector('.cmd-input');
    expect(input).not.toBeNull();
    if (input) {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    }

    await nextTick();

    expect(mockPush).toHaveBeenCalled();
    expect(document.querySelector('.cmd-overlay')).toBeNull();
  });

  it('點擊背景應關閉', async () => {
    mount(CommandPalette, mountOptions);
    await openPalette();

    const overlay = document.querySelector('.cmd-overlay');
    expect(overlay).not.toBeNull();
    if (overlay) {
      overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }

    await nextTick();
    expect(document.querySelector('.cmd-overlay')).toBeNull();
  });
});
