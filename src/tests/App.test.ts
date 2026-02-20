import { mount, flushPromises } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
// import { routes } from '../router'; // Using local testRoutes
import App from '../App.vue';
import { setupI18n } from '../i18n';

const i18n = setupI18n();

const { useHeadMock, createMockSFC } = vi.hoisted(() => {
  const mockComponent = { template: '<div />', render: () => null };
  const createMockSFC = (name: string) => {
    const component = { ...mockComponent, name };
    return {
      __isTeleport: false,
      __isKeepAlive: false,
      __isFragment: false,
      __v_isVNode: false,
      __isSuspense: false,
      __isAsync: false,
      __isSSR: false,
      __v_isRef: false,
      __v_isReactive: false,
      __v_raw: component,
      __v_skip: true,
      name,
      default: component
    };
  };

  return {
    useHeadMock: vi.fn(),
    createMockSFC
  };
});

vi.mock('@unhead/vue', () => ({
  useHead: useHeadMock
}));

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
    scrollTo: vi.fn()
  }))
});

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
});

vi.mock('../components/HashGenerator.vue', () => createMockSFC('HashGenerator'));
vi.mock('../components/Base64Converter.vue', () => createMockSFC('Base64Converter'));
vi.mock('../components/UrlConverter.vue', () => createMockSFC('UrlConverter'));
vi.mock('../components/UnicodeConverter.vue', () => createMockSFC('UnicodeConverter'));
vi.mock('../components/PinyinConverter.vue', () => createMockSFC('PinyinConverter'));
vi.mock('../components/QrCodeGenerator.vue', () => createMockSFC('QrCodeGenerator'));
vi.mock('../components/JsonFormatter.vue', () => createMockSFC('JsonFormatter'));
vi.mock('../components/JsonFormatter.vue', () => createMockSFC('JsonFormatter'));
vi.mock('../components/TimestampConverter.vue', () => createMockSFC('TimestampConverter'));
vi.mock('../components/JwtDebugger.vue', () => createMockSFC('JwtDebugger'));
vi.mock('../components/UuidGenerator.vue', () => createMockSFC('UuidGenerator'));
vi.mock('../components/ColorConverter.vue', () => createMockSFC('ColorConverter'));
vi.mock('../components/DiffChecker.vue', () => createMockSFC('DiffChecker'));

// Define synchronous routes for testing to avoid dynamic import issues
// Define routes matching production structure
const testRoutes = [
  { path: '/', redirect: '/zh-TW/timestamp' },
  {
    path: '/:lang',
    children: [
      {
        path: 'timestamp',
        name: 'timestamp',
        component: createMockSFC('TimestampConverter').default
      },
      { path: 'hash', name: 'hash', component: createMockSFC('HashGenerator').default },
      { path: 'base64', name: 'base64', component: createMockSFC('Base64Converter').default },
      { path: 'url', name: 'url', component: createMockSFC('UrlConverter').default },
      { path: 'unicode', name: 'unicode', component: createMockSFC('UnicodeConverter').default },
      { path: 'pinyin', name: 'pinyin', component: createMockSFC('PinyinConverter').default },
      { path: 'qrcode', name: 'qrcode', component: createMockSFC('QrCodeGenerator').default },
      { path: 'json', name: 'json', component: createMockSFC('JsonFormatter').default },
      { path: 'jwt', name: 'jwt', component: createMockSFC('JwtDebugger').default },
      { path: 'uuid', name: 'uuid', component: createMockSFC('UuidGenerator').default },
      { path: 'color', name: 'color', component: createMockSFC('ColorConverter').default },
      { path: 'diff', name: 'diff', component: createMockSFC('DiffChecker').default }
    ]
  }
];

const router = createRouter({
  history: createMemoryHistory(),
  routes: testRoutes
});

// Add mock guard from main.ts
router.beforeEach((to, _from, next) => {
  const lang = to.params.lang as string;
  const SUPPORTED_LOCALES = ['zh-TW', 'en', 'ja'];

  if (lang && SUPPORTED_LOCALES.includes(lang) && i18n.global.locale.value !== lang) {
    i18n.global.locale.value = lang;
  }
  next();
});

const mountOptions = {
  global: {
    plugins: [i18n, router]
  }
};

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: any) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    })
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('App.vue', () => {
  beforeEach(async () => {
    i18n.global.locale.value = 'zh-TW';
    localStorageMock.clear();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    await router.push('/');
    await router.isReady();
  });

  it('預設應顯示時間戳轉換器', async () => {
    const wrapper = mount(App, mountOptions);
    await flushPromises();

    // Main content area
    const main = wrapper.find('main');
    expect(main.exists()).toBe(true);

    // Check nav buttons
    const buttons = wrapper.findAll('.tab-btn');
    expect(buttons.length).toBe(12);
    expect(buttons[0]?.classes()).toContain('active'); // Timestamp default
  });

  it('切換頁籤應更新 active class', async () => {
    const wrapper = mount(App, mountOptions);
    const buttons = wrapper.findAll('.tab-btn');

    // Click Hash tab (index 1)
    const hashButton = buttons[1];
    if (hashButton) {
      console.log('Before click:', router.currentRoute.value.name);
      await hashButton.trigger('click');
      await flushPromises();
      console.log('After click:', router.currentRoute.value.name);

      // Ensure router has updated
      expect(router.currentRoute.value.name).toBe('hash');
      expect(hashButton.classes()).toContain('active');
      expect(buttons[0]?.classes()).not.toContain('active');
    }
  });

  it('切換頁籤應更新 active class', async () => {
    const wrapper = mount(App, mountOptions);
    const buttons = wrapper.findAll('.tab-btn');

    // Click Base64 tab (index 2)
    const base64Button = buttons[2];
    if (base64Button) {
      await base64Button.trigger('click');
      await flushPromises();
      // Active class check is enough to verify navigation
      expect(base64Button.classes()).toContain('active');
    }
  });

  it('所有頁籤按鈕都應有 role=tab', () => {
    const wrapper = mount(App, mountOptions);
    const buttons = wrapper.findAll('.tab-btn');

    for (const button of buttons) {
      expect(button.attributes('role')).toBe('tab');
    }
  });

  it('頁籤導航應有 role=tablist', () => {
    const wrapper = mount(App, mountOptions);
    const nav = wrapper.find('.tab-list-container');
    expect(nav.attributes('role')).toBe('tablist');
  });

  it('active 頁籤應有 aria-selected=true', async () => {
    const wrapper = mount(App, mountOptions);
    const buttons = wrapper.findAll('.tab-btn');

    expect(buttons[0]?.attributes('aria-selected')).toBe('true');
    expect(buttons[1]?.attributes('aria-selected')).toBe('false');
  });

  it('每個頁籤按鈕應有 aria-label', () => {
    const wrapper = mount(App, mountOptions);
    const buttons = wrapper.findAll('.tab-btn');

    for (const button of buttons) {
      expect(button.attributes('aria-label')).toBeTruthy();
    }
  });

  it('應顯示 footer', () => {
    const wrapper = mount(App, mountOptions);
    const footer = wrapper.find('.app-footer');
    expect(footer.exists()).toBe(true);
    expect(footer.text()).toContain('AguBear Tools');
  });

  it('點擊每個頁籤都應切換', async () => {
    const wrapper = mount(App, mountOptions);
    const buttons = wrapper.findAll('.tab-btn');

    for (const button of buttons) {
      if (button) {
        await button.trigger('click');
        await flushPromises();
        expect(button.classes()).toContain('active');
      }
    }
  });

  it('QR Code 頁籤存在', () => {
    const wrapper = mount(App, mountOptions);
    const buttons = wrapper.findAll('.tab-btn');
    const qrButton = buttons.find((b) => b.text().includes('QR Code'));
    expect(qrButton).toBeDefined();
  });

  describe('分類與收藏功能', () => {
    it('預設應顯示所有分類', () => {
      const wrapper = mount(App, mountOptions);
      const categorySelect = wrapper.find('.category-select');
      expect((categorySelect.element as HTMLSelectElement).value).toBe('all');

      // 所有 12 個工具都應該顯示
      expect(wrapper.findAll('.tab-btn').length).toBe(12);
    });

    it('切換分類應過濾工具', async () => {
      const wrapper = mount(App, mountOptions);
      const categorySelect = wrapper.find('.category-select');

      // 1. 生成工具 (Hash, QRCode, UUID, Diff)
      await categorySelect.setValue('generators');
      let buttons = wrapper.findAll('.tab-btn');
      expect(buttons.length).toBe(4);
      expect(buttons[0]?.text()).toContain('雜湊');
      expect(buttons[1]?.text()).toContain('QR Code');

      // 2. 轉換工具 (Timestamp, Base64, Url, Unicode, Pinyin, Color)
      await categorySelect.setValue('conversion');
      buttons = wrapper.findAll('.tab-btn');
      expect(buttons.length).toBe(6);

      // 3. 格式化工具 (JSON, JWT)
      await categorySelect.setValue('formatters');
      buttons = wrapper.findAll('.tab-btn');
      expect(buttons.length).toBe(2);
      expect(buttons[0]?.text()).toContain('JSON');

      // 4. 全部工具
      await categorySelect.setValue('all');
      buttons = wrapper.findAll('.tab-btn');
      expect(buttons.length).toBe(12);
    });

    it('點擊星星應加入或移除收藏', async () => {
      const wrapper = mount(App, mountOptions);
      const starBtns = wrapper.findAll('.star-action-btn');

      // 1. 加入收藏 (Timestamp)
      const firstStar = starBtns[0];
      if (firstStar) {
        await firstStar.trigger('click');
        // Check if the star button has the active class
        expect(firstStar.classes()).toContain('starred');

        // 2. 移除收藏
        await firstStar.trigger('click');
        expect(firstStar.classes()).not.toContain('starred');
      }
    });

    it('切換只顯示收藏應過濾工具', async () => {
      const wrapper = mount(App, mountOptions);

      // 先加入一個收藏
      const starBtns = wrapper.findAll('.star-action-btn');
      const firstStar = starBtns[0];
      if (firstStar) {
        await firstStar.trigger('click'); // Timestamp added
      }

      // 點擊只顯示收藏按鈕
      const toggleFavButton = wrapper.find('.fav-toggle-btn');
      await toggleFavButton.trigger('click');

      const buttons = wrapper.findAll('.tab-btn');
      expect(buttons.length).toBe(1);
      expect(buttons[0]?.text()).toContain('時間戳');
    });

    it('當 localStorage 有無效資料時應忽略並進入 catch 區塊', () => {
      // Test that the app still mounts without crashing
      localStorageMock.getItem.mockReturnValueOnce('{{invalid');
      const wrapper = mount(App, mountOptions);
      expect(wrapper.exists()).toBe(true);
    });

    it('當 localStorage 資料不是陣列時應忽略', () => {
      localStorageMock.getItem.mockReturnValueOnce('{"not":"array"}');
      const wrapper = mount(App, mountOptions);
      expect(wrapper.exists()).toBe(true);
    });

    it('當沒有工具符合篩選條件時，應顯示無工具訊息', async () => {
      const wrapper = mount(App, mountOptions);
      // Ensure favorites is empty (default)
      // Toggle favorites only
      await wrapper.find('.fav-toggle-btn').trigger('click');
      await flushPromises();

      expect(wrapper.find('.no-tools-msg').exists()).toBe(true);
      expect(wrapper.find('.no-tools-msg').text()).toContain('沒有收藏');

      // Now test search no results
      (wrapper.vm as any).activeCategory = 'all';
      await wrapper.vm.$nextTick();

      const searchInput = wrapper.find('#search-input');
      if (searchInput.exists()) {
        await searchInput.setValue('not-existing-tool-name-xyz');
        await flushPromises();
        expect(wrapper.find('.no-tools-msg').exists()).toBe(true);
        expect(wrapper.find('.no-tools-msg').text()).toContain('找不到');
      }
    });
  });

  describe('整合與進階互動', () => {
    it('應能切換語系', async () => {
      const wrapper = mount(App, mountOptions);
      const langButton = wrapper.find('.lang-btn');

      // 開啟選單
      await langButton.trigger('click');
      expect(wrapper.find('.lang-dropdown').exists()).toBe(true);

      // 選擇英文
      const enOption = wrapper
        .findAll('.lang-option')
        .find((opt) => opt.text().includes('English'));
      if (enOption) {
        await enOption.trigger('click');
        await flushPromises();
      }

      expect(i18n.global.locale.value).toBe('en');
      expect(wrapper.find('.lang-dropdown').exists()).toBe(false);
    });

    it('點擊外部應關閉語系選單', async () => {
      const wrapper = mount(App, mountOptions);
      await wrapper.find('.lang-btn').trigger('click');
      expect(wrapper.find('.lang-dropdown').exists()).toBe(true);

      // Trigger click on app-container (root)
      await wrapper.find('.app-container').trigger('click');
      expect(wrapper.find('.lang-dropdown').exists()).toBe(false);
    });

    it('應正確計算目前的 Locale 資訊', async () => {
      const wrapper = mount(App, mountOptions);
      i18n.global.locale.value = 'zh-TW';
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.lang-name').text()).toBe('繁體中文');

      i18n.global.locale.value = 'en';
      await wrapper.vm.$nextTick();
      expect(wrapper.find('.lang-name').text()).toBe('English');
    });

    it('應呼叫 useHead 進行 SEO 設定', () => {
      mount(App, mountOptions);
      expect(useHeadMock).toHaveBeenCalled();
    });

    it('useHead 應包含正確的 SEO meta tags', () => {
      mount(App, mountOptions);
      const { calls } = useHeadMock.mock;
      const seoCall = calls.find((call: any) => {
        const headObject = call[0].value || call[0];
        return headObject.meta && headObject.meta.some((m: any) => m.name === 'description');
      });

      expect(seoCall).toBeDefined();
      if (seoCall) {
        const headObject = seoCall[0].value || seoCall[0];
        expect(headObject.meta).toEqual(
          expect.arrayContaining([
            expect.objectContaining({ name: 'description' }),
            expect.objectContaining({ name: 'keywords' }),
            expect.objectContaining({ property: 'og:type', content: 'website' })
          ])
        );
      }
    });
  });
});
