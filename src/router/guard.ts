import type { Router } from 'vue-router';
import { SUPPORTED_LOCALES } from '../i18n';

export const setupRouterGuard = (router: Router) => {
  router.beforeEach((to, _from, next) => {
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

    if (localeCode && typeof window !== 'undefined') {
      localStorage.setItem('agubear-locale', localeCode);
    }

    next();
  });
};
