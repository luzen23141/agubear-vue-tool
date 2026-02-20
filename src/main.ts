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
    globalThis.addEventListener('error', (event) => {
      // eslint-disable-next-line no-console
      console.error('Global Window Error:', event.error);
    });
    globalThis.window?.scrollTo({ top: 0, behavior: 'smooth' });
    globalThis.addEventListener('unhandledrejection', (event) => {
      // eslint-disable-next-line no-console
      console.error('Unhandled Promise Rejection:', event.reason);
    });
  }
};

// Removed performance reporting function

export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  ({ app, router }) => {
    const isClient = globalThis?.window !== undefined;
    const i18n = setupI18n();
    const pinia = createPinia();
    app.use(i18n);
    app.use(pinia);

    setupRouterGuard(router, i18n);
    setupErrorHandlers(app, isClient);
  }
);
