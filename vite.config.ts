/* eslint-env node */
import { defineConfig, loadEnv } from 'vite';
import { fileURLToPath, URL } from 'node:url';
import { createHtmlPlugin } from 'vite-plugin-html';
import vue from '@vitejs/plugin-vue';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';
const getPlugins = (env: Record<string, string>) => [
  vue(),
  createHtmlPlugin({
    minify: true,
    inject: {
      data: {
        VITE_GA4_ID: env.VITE_GA4_ID || '',
        VITE_ADSENSE_ID: env.VITE_ADSENSE_ID || '',
        VITE_SITE_URL: env.VITE_SITE_URL || 'https://agubear.black'
      }
    }
  }),
  compression({
    threshold: 10240,
    algorithm: 'gzip',
    ext: '.gz'
  }),
  compression({
    threshold: 10240,
    algorithm: 'brotliCompress',
    ext: '.br'
  }),
  visualizer({
    open: false,
    filename: 'bundle-analysis.html',
    gzipSize: true,
    brotliSize: true
  })
];

const buildConfig = {
  target: 'es2015',
  cssTarget: 'chrome61',
  cssMinify: false,
  sourcemap: false,
  modulePreload: {
    polyfill: true
  },
  cssCodeSplit: true,
  minify: 'terser' as const,
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true
    }
  },
  rollupOptions: {
    output: {
      manualChunks(id: string) {
        if (id.includes('node_modules')) {
          if (id.includes('vue')) return 'vue';
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    base: './',
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    plugins: getPlugins(env),
    build: buildConfig,
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
