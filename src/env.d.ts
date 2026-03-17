/// <reference types="vite/client" />

declare module './scripts/generate-sitemap.mjs';
declare module 'vite-plugin-eslint';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
