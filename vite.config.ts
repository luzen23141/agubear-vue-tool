/* eslint-env node */
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { createHtmlPlugin } from 'vite-plugin-html';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import eslint from 'vite-plugin-eslint';

const getPlugins = (env: Record<string, string>, mode: string) =>
  [
    vue(),
    mode !== 'production' && eslint(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          VITE_GA4_ID: env.VITE_GA4_ID,
          VITE_ADSENSE_ID: env.VITE_ADSENSE_ID,
          VITE_SITE_URL: env.VITE_SITE_URL || 'https://agubear.black'
        }
      }
    }),
    // Removed compression plugins as per instruction
    visualizer({
      open: false,
      filename: 'bundle-analysis.html',
      gzipSize: true,
      brotliSize: true
    })
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
          if (id.includes('/node_modules/vue/') || id.includes('/node_modules/@vue/')) {
            return 'vue-core';
          }
          if (id.includes('date-fns')) return 'date-fns';
          if (id.includes('crypto-js')) return 'crypto-js';
          if (id.includes('pinyin-pro')) return 'pinyin-pro';
          if (id.includes('qrcode')) return 'qrcode';
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
  onFinished() {
    // generateSitemap() // Optional: if we add sitemap plugin later
  }
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: '/',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    plugins: getPlugins(env, mode),
    build: buildConfig,
    ssgOptions,
    esbuild: {
      drop: mode === 'production' ? ['console', 'debugger'] : []
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/tests/setup.ts'],
      exclude: ['e2e/**', 'node_modules/**'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'src/locales/**',
          '**/node_modules/**',
          '**/dist/**',
          '**/tests/**',
          '**/*.d.ts',
          'vite.config.ts'
        ]
      }
    }
  };
});
