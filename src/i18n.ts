import { createI18n } from 'vue-i18n';

// Import all locale files
import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import zhCN from './locales/zh-CN.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import pt from './locales/pt.json';
import yue from './locales/yue.json';
import th from './locales/th.json';
import vi from './locales/vi.json';
import ar from './locales/ar.json';
import ru from './locales/ru.json';
import it from './locales/it.json';
import nl from './locales/nl.json';
import pl from './locales/pl.json';
import tr from './locales/tr.json';
import id from './locales/id.json';
import ms from './locales/ms.json';
import hi from './locales/hi.json';
import uk from './locales/uk.json';

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const messages: Record<string, any> = {
  'zh-TW': zhTW,
  en,
  ja,
  ko,
  'zh-CN': zhCN,
  es,
  fr,
  de,
  pt,
  yue,
  th,
  vi,
  ar,
  ru,
  it,
  nl,
  pl,
  tr,
  id,
  ms,
  hi,
  uk
};

/**
 * Resolve initial locale:
 * 1. Check URL query parameter (?lang=xx)
 * 2. Check localStorage for user preference
 * 3. Check browser language
 * 4. Fall back to zh-TW
 */
function getLocaleFromURL(): string | null {
  if (globalThis.window !== undefined) {
    const params = new URLSearchParams(globalThis.window.location.search);
    const langParam = params.get('lang');
    // eslint-disable-next-line security/detect-object-injection
    if (langParam && messages[langParam]) return langParam;
  }
  return null;
}

function getLocaleFromStorage(): string | null {
  try {
    if (globalThis.window?.localStorage) {
      const stored = globalThis.window.localStorage.getItem('agubear-locale');
      // eslint-disable-next-line security/detect-object-injection
      if (stored && messages[stored]) return stored;
    }
  } catch (e) {
    console.error('getLocaleFromStorage error:', e);
  }
  return null;
}

function getLocaleFromBrowser(): string | null {
  if (typeof navigator === 'undefined') return null;
  const browserLang =
    navigator.language || (navigator as unknown as Record<string, string>).userLanguage || '';
  // eslint-disable-next-line security/detect-object-injection
  if (messages[browserLang]) return browserLang;
  const base = browserLang.split('-')[0] ?? '';
  // eslint-disable-next-line security/detect-object-injection
  if (messages[base]) return base;
  return null;
}

function getInitialLocale(): string {
  return getLocaleFromURL() || getLocaleFromStorage() || getLocaleFromBrowser() || 'zh-TW';
}

const i18n = createI18n({
  legacy: false, // Use Composition API mode
  locale: getInitialLocale(),
  fallbackLocale: 'zh-TW',
  messages,
  missingWarn: false,
  fallbackWarn: false
});

export default i18n;
