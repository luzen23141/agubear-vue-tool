/* eslint-env node */
module.exports = {
  root: true,

  // ── 擴展配置（由寬到嚴，後者覆蓋前者）──────────────────────
  extends: [
    // ESLint 官方推薦規則
    'eslint:recommended',

    // Vue 3 嚴格規則（包含 essential + strongly-recommended + recommended）
    'plugin:vue/vue3-recommended',

    // JavaScript Standard Style（統一風格）
    '@vue/eslint-config-standard',

    // TypeScript 支援
    '@vue/eslint-config-typescript',

    // SonarJS 邏輯檢查
    'plugin:sonarjs/recommended-legacy',

    // Security 安全檢查
    'plugin:security/recommended-legacy',

    // Promise 規範
    'plugin:promise/recommended',

    // Unicorn 現代極簡規則
    'plugin:unicorn/recommended',

    // Prettier 整合（關閉所有與 Prettier 衝突的規則，必須放最後）
    '@vue/eslint-config-prettier/skip-formatting'
  ],

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },

  // ── 環境 ──────────────────────────────────────────────────
  env: {
    browser: true,
    es2022: true,
    node: false
  },

  // ── 自訂嚴格規則（全部調整為最嚴格） ──────────────────────
  rules: {
    // ===== JavaScript 品質（全部 error） =====
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }
    ],
    'no-duplicate-imports': 'error',
    'no-template-literal-in-expression': 'off',
    eqeqeq: ['error', 'always'],
    curly: ['error', 'multi-line'],
    'no-throw-literal': 'error',
    'no-return-await': 'error',
    'prefer-template': 'error',
    'no-nested-ternary': 'error',
    'no-unneeded-ternary': 'error',
    'object-shorthand': ['error', 'always'],

    // ===== 複雜度與維護性（強烈限制） =====
    complexity: ['error', 10],
    'max-depth': ['error', 3],
    'max-params': ['error', 4],
    'max-lines-per-function': ['warn', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-statements': ['warn', 15],
    'prefer-destructuring': [
      'error',
      {
        array: false,
        object: true
      }
    ],
    'no-param-reassign': ['error', { props: false }],
    'no-else-return': 'error',
    'no-useless-return': 'error',
    'no-lonely-if': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-body-style': ['error', 'as-needed'],
    'no-useless-concat': 'error',
    'no-sequences': 'error',
    'no-array-constructor': 'error',
    'no-eval': 'error',
    'spaced-comment': ['error', 'always', { markers: ['/'] }],

    // ===== 邏輯陷阱與安全性 =====
    'no-self-compare': 'error',
    'no-unmodified-loop-condition': 'error',
    'no-promise-executor-return': 'error',
    'no-constant-binary-expression': 'error',
    'no-constructor-return': 'error',
    'no-new-wrappers': 'error',
    'no-proto': 'error',
    'no-extend-native': 'error',
    'no-iterator': 'error',
    'no-labels': 'error',
    'no-lone-blocks': 'error',
    'no-multi-str': 'error',
    'no-new': 'error',
    'no-new-func': 'error',
    'no-octal-escape': 'error',
    'no-script-url': 'error',
    'no-useless-call': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-rename': 'error',
    'prefer-numeric-literals': 'error',
    'prefer-rest-params': 'error',
    'prefer-spread': 'error',
    'symbol-description': 'error',
    'no-implied-eval': 'error',
    'no-loss-of-precision': 'error',
    'require-atomic-updates': 'error',
    'no-await-in-loop': 'warn',
    'no-unreachable-loop': 'error',
    'default-case-last': 'error',
    'grouped-accessor-pairs': 'error',
    'no-caller': 'error',
    'no-extra-bind': 'error',
    'no-floating-decimal': 'error',
    'no-multi-spaces': 'error',
    'no-void': 'error',
    'prefer-object-has-own': 'error',
    'prefer-regex-literals': 'error',

    // ===== TypeScript 嚴格規則 =====
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-empty-function': ['error', { allow: ['arrowFunctions'] }],

    // ===== Vue 嚴格規則（全部收緊為 error） =====
    'vue/multi-word-component-names': 'off',
    'vue/component-definition-name-casing': ['error', 'PascalCase'],
    'vue/no-unused-refs': 'error',
    'vue/no-useless-v-bind': 'error',
    'vue/prefer-true-attribute-shorthand': 'error',
    'vue/prefer-separate-static-class': 'error',
    'vue/no-static-inline-styles': 'error',
    'vue/no-v-html': 'error',
    'vue/require-explicit-emits': 'error',
    'vue/no-unused-properties': [
      'error',
      { groups: ['props', 'data', 'computed', 'methods', 'setup'] }
    ],
    'vue/next-tick-style': ['error', 'promise'],
    'vue/component-api-style': ['error', ['script-setup', 'composition']],
    'vue/html-self-closing': [
      'error',
      {
        html: {
          void: 'always',
          normal: 'always',
          component: 'always'
        },
        svg: 'always',
        math: 'always'
      }
    ],
    'vue/block-order': [
      'error',
      {
        order: ['template', 'script', 'style']
      }
    ],
    'vue/define-macros-order': [
      'error',
      {
        order: ['defineProps', 'defineEmits']
      }
    ],
    'vue/no-empty-component-block': 'error',
    'vue/padding-line-between-blocks': 'error',
    'vue/v-for-delimiter-style': ['error', 'in'],
    'vue/html-button-has-type': 'error',
    'vue/no-required-prop-with-default': 'error',
    'vue/prefer-define-options': 'error',
    'vue/require-macro-variable-name': 'error',
    'vue/no-ref-object-reactivity-loss': 'error',
    'vue/eqeqeq': 'error',
    'vue/no-boolean-default': 'error',
    'vue/no-duplicate-attr-inheritance': 'error',
    'vue/no-potential-component-option-typo': 'error',
    'vue/no-template-target-blank': 'error',
    'vue/no-this-in-before-route-enter': 'error',
    'vue/no-undef-components': ['error', { ignorePatterns: ['router-link', 'router-view'] }],
    'vue/no-undef-properties': 'error',
    'vue/no-useless-mustaches': 'error',
    'vue/require-name-property': 'off',
    'vue/attributes-order': [
      'error',
      {
        order: [
          'DEFINITION',
          'LIST_RENDERING',
          'CONDITIONALS',
          'RENDER_MODIFIERS',
          'GLOBAL',
          'UNIQUE',
          'SLOT',
          'TWO_WAY_BINDING',
          'OTHER_DIRECTIVES',
          'ATTR_DYNAMIC',
          'ATTR_STATIC',
          'ATTR_SHORTHAND_BOOL',
          'EVENTS',
          'CONTENT'
        ]
      }
    ],

    // ===== Unicorn 現代化規則自訂 =====
    'unicorn/prevent-abbreviations': [
      'error',
      {
        allowList: {
          env: true,
          props: true,
          param: true,
          params: true,
          ref: true,
          Ref: true,
          refs: true,
          args: true,
          cmd: true,
          err: true,
          vars: true,
          res: true
        }
      }
    ],
    'unicorn/no-null': 'off', // Vue/DOM API 經常需要 null
    'unicorn/filename-case': [
      'error',
      {
        cases: {
          kebabCase: true,
          pascalCase: true
        },
        ignore: [/^\[.*]\.vue$/]
      }
    ],
    'unicorn/prefer-module': 'off', // 此專案包含部分 CJS 腳本
    'unicorn/no-process-exit': 'off', // 腳本中常使用
    'unicorn/prefer-top-level-await': 'off'
  },

  // ── 針對特定檔案的覆寫 ────────────────────────────────────
  overrides: [
    // Node.js 腳本（允許 process、require 等）
    {
      files: ['vite.config.*', 'scripts/**/*.mjs', '.eslintrc.cjs', '.commitlintrc.cjs', '.dependency-cruiser.cjs'],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off'
      }
    },
    // 測試檔案（放寬部分規則，但仍然嚴格）
    {
      files: ['src/tests/**/*.{test,spec}.{js,jsx,ts,tsx}', '**/__tests__/**/*.{js,jsx,ts,tsx}', 'e2e/**/*.{spec,test}.{js,ts}'],
      env: {
        node: true
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_|wrapper'
          }
        ],
        'vue/no-static-inline-styles': 'off',
        'require-atomic-updates': 'off',
        'no-await-in-loop': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'sonarjs/cognitive-complexity': 'off',
        'sonarjs/no-identical-functions': 'off',
        'sonarjs/no-ignored-exceptions': 'off',
        'sonarjs/assertions-in-tests': 'off',
        'security/detect-object-injection': 'off',
        'complexity': 'off',
        'max-statements': 'off',
        'max-lines-per-function': 'off',
        'unicorn/consistent-function-scoping': 'off',
        'unicorn/no-await-expression-member': 'off',
        'unicorn/no-array-for-each': 'off',
        'unicorn/prefer-ternary': 'off'
      }
    },
    // Schema 檔案（Zod 需要鏈式 API）
    {
      files: ['src/schemas/**/*.ts'],
      rules: {
        '@typescript-eslint/no-inferrable-types': 'off'
      }
    }
  ]
};
