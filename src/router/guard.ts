import type { Router } from 'vue-router';
import { SUPPORTED_LOCALES, loadLocaleMessages } from '../i18n';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setupRouterGuard = (router: Router, i18n: any) => {
  router.beforeEach(async (to, _from, next) => {
    const { params } = to;
    const lang = params.lang as string;
    const localeCode = SUPPORTED_LOCALES.find((l) => l.code === lang)?.code;

    if (lang && !localeCode && to.path !== '/') {
      // Invalid lang param found, redirect to default locale but preserve tool
      const targetName = to.name ? (to.name as string) : 'timestamp';
      return next({
        name: targetName,
        params: { ...to.params, lang: 'zh-TW' },
        query: to.query,
        replace: true
      });
    }

    if (localeCode) {
      // Lazy-load locale messages before entering the route
      await loadLocaleMessages(i18n, localeCode);

      if (globalThis?.window !== undefined) {
        localStorage.setItem('agubear-locale', localeCode);
      }
    }

    next();
  });
};
