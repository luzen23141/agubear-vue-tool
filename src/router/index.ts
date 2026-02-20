import { type RouteRecordRaw } from 'vue-router';
import TimestampConverter from '@/views/TimestampConverter.vue';
import { SUPPORTED_LOCALES } from '@/i18n';

// Extract locale codes
const localeCodes = new Set(SUPPORTED_LOCALES.map((l) => l.code));
const defaultLocale = 'zh-TW';

// Helper to get browser locale or default
const getBrowserLocale = () => {
  if (globalThis?.window !== undefined) {
    const browserLang = globalThis.navigator?.language;
    if (localeCodes.has(browserLang)) return browserLang;
    const base = browserLang.split('-')[0];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const found = SUPPORTED_LOCALES.find((l) => l.code === base || l.code.split('-')[0] === base);
    if (found) return found.code;
  }
  return defaultLocale;
};

// Route definitions with :lang prefix
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: () => {
      const saved =
        globalThis?.window === undefined ? null : localStorage.getItem('agubear-locale');
      const target = saved && localeCodes.has(saved) ? saved : getBrowserLocale();
      return `/${target}/timestamp`;
    }
  },
  // Flattened routes for reliable SSG
  {
    path: '/:lang/timestamp',
    name: 'timestamp',
    component: TimestampConverter,
    meta: { title: 'app.tabs.timestamp' }
  },
  {
    path: '/:lang/hash',
    name: 'hash',
    component: () => import('@/views/HashGenerator.vue'),
    meta: { title: 'app.tabs.hash' }
  },
  {
    path: '/:lang/base64',
    name: 'base64',
    component: () => import('@/views/Base64Converter.vue'),
    meta: { title: 'app.tabs.base64' }
  },
  {
    path: '/:lang/url',
    name: 'url',
    component: () => import('@/views/UrlConverter.vue'),
    meta: { title: 'app.tabs.url' }
  },
  {
    path: '/:lang/unicode',
    name: 'unicode',
    component: () => import('@/views/UnicodeConverter.vue'),
    meta: { title: 'app.tabs.unicode' }
  },
  {
    path: '/:lang/pinyin',
    name: 'pinyin',
    component: () => import('@/views/PinyinConverter.vue'),
    meta: { title: 'app.tabs.pinyin' }
  },
  {
    path: '/:lang/qrcode',
    name: 'qrcode',
    component: () => import('@/views/QrCodeGenerator.vue'),
    meta: { title: 'app.tabs.qrcode' }
  },
  {
    path: '/:lang/json',
    name: 'json',
    component: () => import('@/views/JsonFormatter.vue'),
    meta: { title: 'app.tabs.json' }
  },
  {
    path: '/:lang/jwt',
    name: 'jwt',
    component: () => import('@/views/JwtDebugger.vue'),
    meta: { title: 'app.tabs.jwt' }
  },
  {
    path: '/:lang/uuid',
    name: 'uuid',
    component: () => import('@/views/UuidGenerator.vue'),
    meta: { title: 'app.tabs.uuid' }
  },
  {
    path: '/:lang/color',
    name: 'color',
    component: () => import('@/views/ColorConverter.vue'),
    meta: { title: 'app.tabs.color' }
  },
  {
    path: '/:lang/diff',
    name: 'diff',
    component: () => import('@/views/DiffChecker.vue'),
    meta: { title: 'app.tabs.diff' }
  },
  // Catch-all for 404 - Redirect to default lang
  {
    path: '/:pathMatch(.*)*',
    redirect: () => `/${defaultLocale}/timestamp`
  }
];
