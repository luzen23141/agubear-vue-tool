/**
 * i18n 設定測試
 */
import { describe, it, expect } from 'vitest';
import { SUPPORTED_LOCALES } from '../i18n';

// ============================================
// SUPPORTED_LOCALES 測試
// ============================================

describe('SUPPORTED_LOCALES', () => {
  it('應包含至少 20 個語系', () => {
    expect(SUPPORTED_LOCALES.length).toBeGreaterThanOrEqual(20);
  });

  it('每個語系應有 code, name, icon, dir 欄位', () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      expect(locale).toHaveProperty('code');
      expect(locale).toHaveProperty('name');
      expect(locale).toHaveProperty('icon');
      expect(locale).toHaveProperty('dir');
      expect(typeof locale.code).toBe('string');
      expect(typeof locale.name).toBe('string');
      expect(typeof locale.icon).toBe('string');
      expect(['ltr', 'rtl']).toContain(locale.dir);
    });
  });

  it('code 應唯一', () => {
    const codes = SUPPORTED_LOCALES.map((l) => l.code);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it('繁體中文 (zh-TW) 應為第一個', () => {
    expect(SUPPORTED_LOCALES[0].code).toBe('zh-TW');
  });

  it('應包含 zh-TW, en, ja, ko 等主要語系', () => {
    const codes = SUPPORTED_LOCALES.map((l) => l.code);
    expect(codes).toContain('zh-TW');
    expect(codes).toContain('en');
    expect(codes).toContain('ja');
    expect(codes).toContain('ko');
    expect(codes).toContain('zh-CN');
  });

  it('阿拉伯語應為 RTL', () => {
    const arabic = SUPPORTED_LOCALES.find((l) => l.code === 'ar');
    expect(arabic).toBeDefined();
    expect(arabic.dir).toBe('rtl');
  });

  it('非阿拉伯語系應為 LTR', () => {
    SUPPORTED_LOCALES.filter((l) => l.code !== 'ar').forEach((locale) => {
      expect(locale.dir).toBe('ltr');
    });
  });

  it('每個語系應有 icon (國旗 emoji)', () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      expect(locale.icon).toBeTruthy();
      expect(locale.icon.length).toBeGreaterThan(0);
    });
  });
});

// ============================================
// getInitialLocale 邏輯測試 (純邏輯，不依賴瀏覽器 API)
// ============================================

describe('getInitialLocale 邏輯', () => {
  // 模擬 getInitialLocale 的核心邏輯
  function resolveLocale(queryLang, storedLang, browserLang) {
    // 1. URL query param
    if (queryLang && SUPPORTED_LOCALES.some((l) => l.code === queryLang)) {
      return queryLang;
    }
    // 2. localStorage
    if (storedLang && SUPPORTED_LOCALES.some((l) => l.code === storedLang)) {
      return storedLang;
    }
    // 3. navigator.language (exact match)
    if (browserLang && SUPPORTED_LOCALES.some((l) => l.code === browserLang)) {
      return browserLang;
    }
    // 4. navigator.language (base language match)
    if (browserLang) {
      const base = browserLang.split('-')[0];
      const match = SUPPORTED_LOCALES.find((l) => l.code === base);
      if (match) return match.code;
    }
    // 5. Fallback
    return 'zh-TW';
  }

  it('URL query param 優先於其他來源', () => {
    expect(resolveLocale('ja', 'en', 'ko')).toBe('ja');
  });

  it('URL query param 無效時應 fallback 到 localStorage', () => {
    expect(resolveLocale('nonexistent', 'en', 'ko')).toBe('en');
  });

  it('URL query param 和 localStorage 都無效時應用 navigator.language', () => {
    expect(resolveLocale(null, null, 'ko')).toBe('ko');
  });

  it('navigator.language 完整碼應正確匹配 (zh-TW)', () => {
    expect(resolveLocale(null, null, 'zh-TW')).toBe('zh-TW');
  });

  it('navigator.language base 碼應正確匹配 (en-US → en)', () => {
    expect(resolveLocale(null, null, 'en-US')).toBe('en');
  });

  it('navigator.language base 碼應正確匹配 (ja-JP → ja)', () => {
    expect(resolveLocale(null, null, 'ja-JP')).toBe('ja');
  });

  it('所有來源都無效時應 fallback 到 zh-TW', () => {
    expect(resolveLocale(null, null, null)).toBe('zh-TW');
  });

  it('所有來源都是無效語系時也應 fallback 到 zh-TW', () => {
    expect(resolveLocale('xx', 'yy', 'zz')).toBe('zh-TW');
  });

  it('每個支援語系都能透過 query param 選取', () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      expect(resolveLocale(locale.code, null, null)).toBe(locale.code);
    });
  });

  it('每個支援語系都能透過 localStorage 選取', () => {
    SUPPORTED_LOCALES.forEach((locale) => {
      expect(resolveLocale(null, locale.code, null)).toBe(locale.code);
    });
  });
});
