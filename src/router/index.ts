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
    meta: { titleKey: 'app.tabs.timestamp', descriptionKey: 'timestamp.seo.description' }
  },
  {
    path: '/:lang/hash',
    name: 'hash',
    component: () => import('@/views/HashGenerator.vue'),
    meta: { titleKey: 'app.tabs.hash', descriptionKey: 'hash.seo.description' }
  },
  {
    path: '/:lang/base64',
    name: 'base64',
    component: () => import('@/views/Base64Converter.vue'),
    meta: { titleKey: 'app.tabs.base64', descriptionKey: 'base64.seo.description' }
  },
  {
    path: '/:lang/url',
    name: 'url',
    component: () => import('@/views/UrlConverter.vue'),
    meta: { titleKey: 'app.tabs.url', descriptionKey: 'url.seo.description' }
  },
  {
    path: '/:lang/unicode',
    name: 'unicode',
    component: () => import('@/views/UnicodeConverter.vue'),
    meta: { titleKey: 'app.tabs.unicode', descriptionKey: 'unicode.seo.description' }
  },
  {
    path: '/:lang/pinyin',
    name: 'pinyin',
    component: () => import('@/views/PinyinConverter.vue'),
    meta: { titleKey: 'app.tabs.pinyin', descriptionKey: 'pinyin.seo.description' }
  },
  {
    path: '/:lang/qrcode',
    name: 'qrcode',
    component: () => import('@/views/QrCodeGenerator.vue'),
    meta: { titleKey: 'app.tabs.qrcode', descriptionKey: 'qrcode.seo.description' }
  },
  {
    path: '/:lang/json',
    name: 'json',
    component: () => import('@/views/JsonFormatter.vue'),
    meta: { titleKey: 'app.tabs.json', descriptionKey: 'json.seo.description' }
  },
  {
    path: '/:lang/jwt',
    name: 'jwt',
    component: () => import('@/views/JwtDebugger.vue'),
    meta: { titleKey: 'app.tabs.jwt', descriptionKey: 'jwt.seo.description' }
  },
  {
    path: '/:lang/uuid',
    name: 'uuid',
    component: () => import('@/views/UuidGenerator.vue'),
    meta: { titleKey: 'app.tabs.uuid', descriptionKey: 'uuid.seo.description' }
  },
  {
    path: '/:lang/color',
    name: 'color',
    component: () => import('@/views/ColorConverter.vue'),
    meta: { titleKey: 'app.tabs.color', descriptionKey: 'color.seo.description' }
  },
  {
    path: '/:lang/diff',
    name: 'diff',
    component: () => import('@/views/DiffChecker.vue'),
    meta: { titleKey: 'app.tabs.diff', descriptionKey: 'diff.seo.description' }
  },
  // Catch-all for 404 - Redirect to default lang
  {
    path: '/:pathMatch(.*)*',
    redirect: () => `/${defaultLocale}/timestamp`
  }
];
