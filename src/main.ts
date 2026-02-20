import { ViteSSG } from 'vite-ssg';
import { createPinia } from 'pinia';
import App from './App.vue';
import { routes } from './router';
import { setupRouterGuard } from './router/guard';
import { setupI18n } from './i18n';
import '@/styles/main.css';
import 'virtual:uno.css';

import type { App as VueApp } from 'vue';

// Performance: Mark app creation start
performance.mark('vue-app-start');

const setupErrorHandlers = (app: VueApp, isClient: boolean) => {
  app.config.errorHandler = (error: unknown, _instance: unknown, info: string) => {
    // eslint-disable-next-line no-console
    console.error('Global Error:', error, info);
  };

  if (isClient) {
    window.addEventListener('error', (event) => {
      // eslint-disable-next-line no-console
      console.error('Global Window Error:', event.error);
    });
    window.addEventListener('unhandledrejection', (event) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled Promise Rejection:', event.reason);
    });
  }
};

const logPerformanceMetric = (name: string, metric: unknown) =>
  // eslint-disable-next-line no-console
  console.log(
    `[Performance] ${name}:`,
    Object.hasOwn(metric, 'value') ? (metric as { value: unknown }).value : undefined,
    metric
  );

const setupPerformanceReporting = (isClient: boolean) => {
  if (isClient && import.meta.env.DEV) {
    import('web-vitals')
      .then(({ onCLS, onINP, onLCP, onFCP, onTTFB }) => {
        onCLS((metric) => logPerformanceMetric('CLS', metric));
        onINP((metric) => logPerformanceMetric('INP', metric));
        onLCP((metric) => logPerformanceMetric('LCP', metric));
        onFCP((metric) => logPerformanceMetric('FCP', metric));
        onTTFB((metric) => logPerformanceMetric('TTFB', metric));
        return true;
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Web Vitals load error:', error);
      });
  }
};

export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  ({ app, router, isClient }) => {
    const i18n = setupI18n();
    const pinia = createPinia();
    app.use(i18n);
    app.use(pinia);

    setupRouterGuard(router);
    setupErrorHandlers(app, isClient);
    setupPerformanceReporting(isClient);
  }
);
