/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: '禁止循環依賴，這會導致架構混亂與難以測試。',
      from: {},
      to: { circular: true }
    },
    {
      name: 'no-orphans',
      severity: 'error',
      comment: '偵測未被使用的檔案（孤兒文件），必須移除或納入引用。',
      from: { orphan: true, pathNot: ['\\.d\\.ts$', '\\.test\\.ts$', '\\.spec\\.ts$', 'tests/', 'schemas/'] },
      to: {}
    },
    {
      name: 'no-unresolved',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true }
    },
    {
      name: 'no-deprecated-core',
      severity: 'error',
      comment: '禁止使用已廢棄的 Node.js 核心模組。',
      from: {},
      to: { dependencyTypes: ['core'], path: '^(punycode|domain|constants|sys|_linklist|_stream_wrap)$' }
    },
    {
      name: 'not-to-test',
      severity: 'error',
      comment: '生產代碼不應依賴測試檔案。',
      from: { pathNot: ['(^|/)tests/', '\\.test\\.ts$', '\\.spec\\.ts$'] },
      to: { path: ['(^|/)tests/', '\\.test\\.ts$', '\\.spec\\.ts$'] }
    },
    {
      name: 'not-to-spec',
      severity: 'error',
      comment: '生產代碼不應依賴 spec 檔案。',
      from: { pathNot: ['\\.spec\\.ts$'] },
      to: { path: '\\.spec\\.ts$' }
    },
    {
      name: 'no-non-package-json',
      severity: 'error',
      comment: '禁止引入 node_modules 中不在 package.json 的依賴。',
      from: {},
      to: { dependencyTypes: ['npm-no-pkg', 'npm-unknown'] }
    }
  ],
  options: {
    exclude: {
      path: ['node_modules', 'vite/client', '^virtual:']
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.check.json'
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default']
    },
    reporterOptions: {
      text: {}
    }
  }
};
