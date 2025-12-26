import { createApp, type App as VueApp } from 'vue';
import { createHead } from '@vueuse/head';
import './style.css';
import App from './App.vue';
import i18n from './i18n';

// Performance: Mark app creation start
performance.mark('vue-app-start');

const app: VueApp<Element> = createApp(App);
const head = createHead();

app.use(i18n);
app.use(head);

// Global Error Handler
app.config.errorHandler = (err, _instance, info) => {
  // eslint-disable-next-line no-console
  console.error('Global Vue Error:', err);
  // eslint-disable-next-line no-console
  console.error('Info:', info);
};

// Window Error Handler
globalThis.addEventListener('error', (event: ErrorEvent) => {
  // eslint-disable-next-line no-console
  console.error('Global Window Error:', event.error);
});

// Unhandled Promise Rejection Handler
globalThis.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Promise Rejection:', event.reason);
});

// Mount and measure
app.mount('#app');

// Performance: Mark app mount complete
performance.mark('vue-app-mounted');
performance.measure('vue-app-init', 'vue-app-start', 'vue-app-mounted');

// Report Web Vitals for LCP/FCP/CLS/TTFB/INP monitoring
if (import.meta.env.DEV) {
  try {
    const { onCLS, onINP, onLCP, onFCP, onTTFB } = await import('web-vitals');
    const log = (name: string, metric: { value: number }) =>
      console.log(`[Performance] ${name}:`, metric.value, metric); // eslint-disable-line no-console
    onCLS((m) => log('CLS', m));
    onINP((m) => log('INP', m));
    onLCP((m) => log('LCP', m));
    onFCP((m) => log('FCP', m));
    onTTFB((m) => log('TTFB', m));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('Web Vitals load error:', e);
  }
}
