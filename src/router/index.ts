import { type RouteRecordRaw } from 'vue-router';
import TimestampConverter from '../components/TimestampConverter.vue';
import { SUPPORTED_LOCALES } from '../i18n';

// Extract locale codes
const localeCodes = SUPPORTED_LOCALES.map((l) => l.code);
const defaultLocale = 'zh-TW';

// Helper to get browser locale or default
const getBrowserLocale = () => {
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language;
    if (localeCodes.includes(browserLang)) return browserLang;
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
      const saved = typeof window !== 'undefined' ? localStorage.getItem('agubear-locale') : null;
      const target = saved && localeCodes.includes(saved) ? saved : getBrowserLocale();
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
    component: () => import('../components/HashGenerator.vue'),
    meta: { title: 'app.tabs.hash' }
  },
  {
    path: '/:lang/base64',
    name: 'base64',
    component: () => import('../components/Base64Converter.vue'),
    meta: { title: 'app.tabs.base64' }
  },
  {
    path: '/:lang/url',
    name: 'url',
    component: () => import('../components/UrlConverter.vue'),
    meta: { title: 'app.tabs.url' }
  },
  {
    path: '/:lang/unicode',
    name: 'unicode',
    component: () => import('../components/UnicodeConverter.vue'),
    meta: { title: 'app.tabs.unicode' }
  },
  {
    path: '/:lang/pinyin',
    name: 'pinyin',
    component: () => import('../components/PinyinConverter.vue'),
    meta: { title: 'app.tabs.pinyin' }
  },
  {
    path: '/:lang/qrcode',
    name: 'qrcode',
    component: () => import('../components/QrCodeGenerator.vue'),
    meta: { title: 'app.tabs.qrcode' }
  },
  {
    path: '/:lang/json',
    name: 'json',
    component: () => import('../components/JsonFormatter.vue'),
    meta: { title: 'app.tabs.json' }
  },
  // Catch-all for 404 - Redirect to default lang
  {
    path: '/:pathMatch(.*)*',
    redirect: () => `/${defaultLocale}/timestamp`
  }
];
