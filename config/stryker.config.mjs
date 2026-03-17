export default {
  $schema: './node_modules/@stryker-mutator/core/schema/stryker-schema.json',
  testRunner: 'vitest',
  plugins: ['@stryker-mutator/vitest-runner'],
  mutate: ['src/utils/**/*.ts', 'src/composables/**/*.ts', '!src/**/*.test.ts', '!src/tests/**'],
  files: [
    '/src/**/*',
    '/scripts/generate-sitemap.mjs',
    '/vite.config.ts',
    '/package.json',
    '/pnpm-lock.yaml',
    '/tsconfig.json',
    '/tsconfig.node.json',
    '/tsconfig.app.json',
    '/tsconfig.check.json'
  ],
  ignorePatterns: ['/.agent/**', '/.claude/**', '/reports/**', '/coverage/**'],
  vitest: {
    configFile: 'vite.config.ts',
    related: true
  },
  coverageAnalysis: 'perTest',
  reporters: ['clear-text', 'progress', 'html', 'json'],
  htmlReporter: {
    fileName: 'reports/stryker/index.html'
  },
  jsonReporter: {
    fileName: 'reports/stryker/mutation-report.json'
  },
  thresholds: {
    high: 80,
    low: 60,
    break: null
  },
  concurrency: 2,
  timeoutMS: 5000,
  timeoutFactor: 1.5,
  dryRunTimeoutMinutes: 5,
  cleanTempDir: true,
  tempDirName: '.stryker-tmp'
};
