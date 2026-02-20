import { createI18n } from 'vue-i18n';

// Only pre-load primary locales; others loaded on-demand
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';

/**
 * Supported languages with native display names and BCP-47 codes.
 * Order: CJK languages first, then Latin/Cyrillic, then other scripts.
 */
export interface LocaleInfo {
  code: string;
  name: string;
  icon: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LOCALES: LocaleInfo[] = [
  { code: 'zh-TW', name: '繁體中文', icon: '🇹🇼', dir: 'ltr' },
  { code: 'zh-CN', name: '简体中文', icon: '🇨🇳', dir: 'ltr' },
  { code: 'yue', name: '廣東話', icon: '🇭🇰', dir: 'ltr' },
  { code: 'ja', name: '日本語', icon: '🇯🇵', dir: 'ltr' },
  { code: 'ko', name: '한국어', icon: '🇰🇷', dir: 'ltr' },
  { code: 'en', name: 'English', icon: '🇺🇸', dir: 'ltr' },
  { code: 'es', name: 'Español', icon: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', icon: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'Deutsch', icon: '🇩🇪', dir: 'ltr' },
  { code: 'pt', name: 'Português', icon: '🇧🇷', dir: 'ltr' },
  { code: 'it', name: 'Italiano', icon: '🇮🇹', dir: 'ltr' },
  { code: 'nl', name: 'Nederlands', icon: '🇳🇱', dir: 'ltr' },
  { code: 'pl', name: 'Polski', icon: '🇵🇱', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', icon: '🇹🇷', dir: 'ltr' },
  { code: 'ru', name: 'Русский', icon: '🇷🇺', dir: 'ltr' },
  { code: 'uk', name: 'Українська', icon: '🇺🇦', dir: 'ltr' },
  { code: 'th', name: 'ไทย', icon: '🇹🇭', dir: 'ltr' },
  { code: 'vi', name: 'Tiếng Việt', icon: '🇻🇳', dir: 'ltr' },
  { code: 'id', name: 'Indonesia', icon: '🇮🇩', dir: 'ltr' },
  { code: 'ms', name: 'Melayu', icon: '🇲🇾', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', icon: '🇮🇳', dir: 'ltr' },
  { code: 'ar', name: 'العربية', icon: '🇸🇦', dir: 'rtl' }
];

const SUPPORTED_LOCALE_CODES = new Set(SUPPORTED_LOCALES.map((l) => l.code));

/**
 * Lazy-load mapping: locale code → dynamic import function.
 * zh-TW and en are pre-loaded; others loaded on demand.
 */
const LOCALE_LOADERS: Record<string, () => Promise<{ default: Record<string, unknown> }>> = {
  ja: () => import('./locales/ja.json'),
  ko: () => import('./locales/ko.json'),
  'zh-CN': () => import('./locales/zh-CN.json'),
  es: () => import('./locales/es.json'),
  fr: () => import('./locales/fr.json'),
  de: () => import('./locales/de.json'),
  pt: () => import('./locales/pt.json'),
  yue: () => import('./locales/yue.json'),
  th: () => import('./locales/th.json'),
  vi: () => import('./locales/vi.json'),
  ar: () => import('./locales/ar.json'),
  ru: () => import('./locales/ru.json'),
  it: () => import('./locales/it.json'),
  nl: () => import('./locales/nl.json'),
  pl: () => import('./locales/pl.json'),
  tr: () => import('./locales/tr.json'),
  id: () => import('./locales/id.json'),
  ms: () => import('./locales/ms.json'),
  hi: () => import('./locales/hi.json'),
  uk: () => import('./locales/uk.json')
};

// Track which locales have been loaded
const loadedLocales = new Set(['zh-TW', 'en']);

/**
 * Load a locale's messages on demand.
 * Returns true if messages were loaded, false if already loaded or unsupported.
 */
export async function loadLocaleMessages(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  i18n: any,
  locale: string
): Promise<boolean> {
  if (loadedLocales.has(locale)) return true;

  // eslint-disable-next-line security/detect-object-injection
  const loader = LOCALE_LOADERS[locale];
  if (!loader) return false;

  try {
    const messages = await loader();
    i18n.global.setLocaleMessage(locale, messages.default || messages);
    loadedLocales.add(locale);
    return true;
  } catch (error) {
    console.error(`Failed to load locale "${locale}":`, error);
    return false;
  }
}

/**
 * Check if locale code is supported.
 */
export function isLocaleSupported(code: string): boolean {
  return SUPPORTED_LOCALE_CODES.has(code);
}

/**
 * Resolve initial locale:
 * 1. Check URL query parameter (?lang=xx)
 * 2. Check localStorage for user preference
 * 3. Check browser language
 * 4. Fall back to zh-TW
 */
function getLocaleFromURL(): string | null {
  if (globalThis.window !== undefined) {
    const parameters = new URLSearchParams(globalThis.window.location.search);
    const langParameter = parameters.get('lang');
    if (langParameter && SUPPORTED_LOCALE_CODES.has(langParameter)) return langParameter;
  }
  return null;
}

function getLocaleFromStorage(): string | null {
  try {
    if (globalThis.window?.localStorage) {
      const stored = globalThis.window.localStorage.getItem('agubear-locale');
      if (stored && SUPPORTED_LOCALE_CODES.has(stored)) return stored;
    }
  } catch (error) {
    console.error('getLocaleFromStorage error:', error);
  }
  return null;
}

function getLocaleFromBrowser(): string | null {
  if (typeof navigator === 'undefined') return null;
  const browserLang =
    navigator.language || (navigator as unknown as Record<string, string>).userLanguage || '';
  if (SUPPORTED_LOCALE_CODES.has(browserLang)) return browserLang;
  const base = browserLang.split('-')[0] ?? '';
  if (SUPPORTED_LOCALE_CODES.has(base)) return base;
  // Try to find a supported locale that shares the same base
  const found = SUPPORTED_LOCALES.find((l) => l.code.split('-')[0] === base);
  if (found) return found.code;
  return null;
}

function getInitialLocale(): string {
  return getLocaleFromURL() || getLocaleFromStorage() || getLocaleFromBrowser() || 'zh-TW';
}

export function setupI18n() {
  return createI18n({
    legacy: false, // Use Composition API mode
    locale: getInitialLocale(),
    fallbackLocale: 'zh-TW',
    messages: {
      'zh-TW': zhTW,
      en
    },
    missingWarn: false,
    fallbackWarn: false
  });
}
