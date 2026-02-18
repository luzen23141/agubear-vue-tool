import { ViteSSG } from 'vite-ssg';
import { createUnhead } from '@unhead/vue';
import App from './App.vue';
import { routes } from './router';
import { setupI18n, SUPPORTED_LOCALES } from './i18n';
import './style.css';

// Performance: Mark app creation start
performance.mark('vue-app-start');

export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  ({ app, router, isClient }) => {
    const head = createUnhead();
    const i18n = setupI18n(); // Create fresh instance
    app.use(head);
    app.use(i18n);

    // Router Guard for Locale
    router.beforeEach((to, _from, next) => {
      const lang = to.params.lang as string;
      // console.log(`[DEBUG] Navigating to: ${to.fullPath}, param lang: ${lang}`);

      const localeCode = SUPPORTED_LOCALES.find((l) => l.code === lang)?.code;

      if (lang && !localeCode && to.path !== '/') {
        // Invalid lang param found, redirect.
        return next({ path: `/zh-TW/timestamp`, replace: true });
      }

      if (localeCode) {
        // console.log(`[DEBUG] Found locale: ${localeCode}`);
        if (i18n.global.locale.value !== localeCode) {
          // console.log(`[DEBUG] Switching to ${localeCode}`);
          i18n.global.locale.value = localeCode;
        }
        if (isClient) {
          localStorage.setItem('agubear-locale', localeCode);
          document.documentElement.lang = localeCode;
        }
      }
      next();
    });

    // Global Error Handler
    app.config.errorHandler = (err, _instance, info) => {
      // eslint-disable-next-line no-console
      console.error('Global Vue Error:', err);
      // eslint-disable-next-line no-console
      console.error('Info:', info);
    };

    if (isClient) {
      // Window Error Handler
      window.addEventListener('error', (event) => {
        // eslint-disable-next-line no-console
        console.error('Global Window Error:', event.error);
      });

      // Unhandled Promise Rejection Handler
      window.addEventListener('unhandledrejection', (event) => {
        // eslint-disable-next-line no-console
        console.error('Unhandled Promise Rejection:', event.reason);
      });

      // Report Web Vitals
      if (import.meta.env.DEV) {
        import('web-vitals')
          .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const log = (name: string, metric: any) =>
              // eslint-disable-next-line no-console
              console.log(`[Performance] ${name}:`, metric.value, metric);
            onCLS((m) => log('CLS', m));
            onINP((m) => log('INP', m));
            onLCP((m) => log('LCP', m));
            onFCP((m) => log('FCP', m));
            onTTFB((m) => log('TTFB', m));
            return true;
          })
          // eslint-disable-next-line no-console
          .catch((e) => console.error('Web Vitals load error:', e));
      }
    }
  }
);
