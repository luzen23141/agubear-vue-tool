/* eslint-env node */
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { createHtmlPlugin } from 'vite-plugin-html';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import { VitePWA } from 'vite-plugin-pwa';
import UnoCSS from 'unocss/vite';

const getPlugins = (environment: Record<string, string>, _mode: string) =>
  [
    vue(),
    UnoCSS(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          VITE_GA4_ID: environment.VITE_GA4_ID,
          VITE_ADSENSE_ID: environment.VITE_ADSENSE_ID,
          VITE_SITE_URL: environment.VITE_SITE_URL || 'https://agubear.black'
        }
      }
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'AguBear Tools',
        short_name: 'AguBear',
        description: 'Essential developer tools: Timestamp, Base64, Hash, JSON, and more.',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,txt,woff2}'],
        navigateFallbackDenylist: [/^\/sitemap\.xml$/, /^\/robots\.txt$/, /^\/CNAME$/]
      }
    }),
    process.env.CI
      ? null
      : visualizer({
          open: false,
          filename: 'reports/bundle-analysis.html',
          gzipSize: true,
          brotliSize: true
        })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ].filter(Boolean);

const buildConfig = {
  target: 'es2015',
  cssTarget: 'chrome61',
  sourcemap: false,
  modulePreload: {
    polyfill: true
  },
  cssCodeSplit: true,
  rollupOptions: {
    output: {
      manualChunks(id: string) {
        if (id.includes('node_modules')) {
          if (id.includes('vue') || id.includes('@vue')) return 'vue-core';
          if (id.includes('pinia')) return 'vue-store';
          return 'vendor';
        }
      },
      chunkFileNames: 'assets/js/[name]-[hash].js',
      entryFileNames: 'assets/js/[name]-[hash].js',
      assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
    }
  },
  chunkSizeWarningLimit: 500
};

const ssgOptions = {
  script: 'async',
  formatting: 'minify',
  async onFinished() {
    // Generate sitemap after SSG build
    await import('./scripts/generate-sitemap.mjs');
  },
  includedRoutes() {
    const locales = ['zh-TW', 'en', 'ja'];
    // Use paths and routes or ignore them with underscore?
    // Actually we are ignoring them and generating our own list.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tools = [
      'timestamp',
      'hash',
      'base64',
      'url',
      'unicode',
      'pinyin',
      'qrcode',
      'json',
      'jwt',
      'uuid',
      'color',
      'diff'
    ];

    return locales.flatMap((locale) => tools.map((tool) => `/${locale}/${tool}`));
  }
};

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), '');
  return {
    base: '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('src', import.meta.url))
      }
    },
    plugins: getPlugins(environment, mode),
    build: buildConfig,
    ssgOptions,
    esbuild: {
      // drop: mode === 'production' ? ['console', 'debugger'] : []
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts'],
      exclude: ['e2e/**', 'node_modules/**', '.claude/**'],
      coverage: {
        provider: 'v8',
        enabled: process.env.COVERAGE === 'true', // Only run coverage if requested
        reporter: ['text', 'json', 'html', 'lcov'],
        thresholds: {
          lines: 80,
          functions: 70,
          branches: 80,
          statements: 80
        },
        exclude: [
          'src/locales/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/.claude/**',
          '**/tests/**',
          '**/*.d.ts',
          'vite.config.ts'
        ]
      }
    }
  };
});
