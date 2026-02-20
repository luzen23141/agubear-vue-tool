/* eslint-disable no-console, security/detect-non-literal-fs-filename */
/* eslint-env node */

/**
 * Dependency Integrity Check
 *
 * 掃描專案中所有 source 與 config 檔案的 import/require 語句，
 * 比對 package.json 的 dependencies + devDependencies，
 * 偵測 phantom dependency（本地可用但未宣告的套件）。
 *
 * 這是為了在本地 check-all 就能攔截 CI 會遇到的 ERR_MODULE_NOT_FOUND。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Node.js built-in modules to skip
const BUILTINS = new Set([
  'assert',
  'buffer',
  'child_process',
  'cluster',
  'console',
  'constants',
  'crypto',
  'dgram',
  'dns',
  'domain',
  'events',
  'fs',
  'http',
  'http2',
  'https',
  'module',
  'net',
  'os',
  'path',
  'perf_hooks',
  'process',
  'punycode',
  'querystring',
  'readline',
  'repl',
  'stream',
  'string_decoder',
  'sys',
  'timers',
  'tls',
  'tty',
  'url',
  'util',
  'v8',
  'vm',
  'wasi',
  'worker_threads',
  'zlib'
]);

// Virtual modules and known aliases to skip
const VIRTUAL_PREFIXES = ['virtual:', '@/', '~/', '#'];

// Skip directories during file collection
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', 'dist-temp', 'reports']);

// Quoted string pattern: captures content between quotes
const QUOTED = /["']([^"']+)["']/;

// Build regex for each import style (source is a compile-time constant, not user input)
/* eslint-disable security/detect-non-literal-regexp */
const IMPORT_PATTERNS = [
  new RegExp(`import\\s+.+from\\s+${QUOTED.source}`, 'g'),
  new RegExp(`import\\s*\\(\\s*${QUOTED.source}\\s*\\)`, 'g'),
  new RegExp(`import\\s+${QUOTED.source}`, 'g'),
  new RegExp(`require\\s*\\(\\s*${QUOTED.source}\\s*\\)`, 'g'),
  new RegExp(`export\\s+.+from\\s+${QUOTED.source}`, 'g')
];
/* eslint-enable security/detect-non-literal-regexp */

/** Extract package name: 'unocss/vite' → 'unocss', '@vue/test-utils' → '@vue/test-utils' */
function getPackageName(specifier) {
  if (specifier.startsWith('@')) {
    const parts = specifier.split('/');
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : specifier;
  }
  return specifier.split('/')[0];
}

/** Check if specifier is an external package */
function isExternalPackage(specifier) {
  if (specifier.startsWith('.') || specifier.startsWith('/')) return false;
  if (VIRTUAL_PREFIXES.some((p) => specifier.startsWith(p))) return false;

  const packageName = getPackageName(specifier);
  return !BUILTINS.has(packageName) && !packageName.startsWith('node:');
}

/** Recursively collect files to scan */
function collectFiles(directory, extensions, result = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory() && !SKIP_DIRS.has(entry.name)) {
      collectFiles(fullPath, extensions, result);
    }
    if (entry.isFile() && extensions.some((extension) => entry.name.endsWith(extension))) {
      result.push(fullPath);
    }
  }
  return result;
}

/** Strip comments from source to avoid false positives */
function stripComments(source) {
  // Remove block comments (non-greedy via split/join is lint-safe)
  const noBlock = source
    .split(/\/\*/)
    .map((part, index) => {
      if (index === 0) return part;
      const end = part.indexOf('*/');
      return end >= 0 ? part.slice(end + 2) : '';
    })
    .join('');

  // Remove single-line comments line-by-line (preserve URLs with ://)
  return noBlock
    .split('\n')
    .map((line) => {
      const index = line.indexOf('//');
      if (index < 0) return line;
      // Keep if preceded by : (URL like https://)
      if (index > 0 && line[index - 1] === ':') return line;
      return line.slice(0, index);
    })
    .join('\n');
}

/** Extract all external package names from a file */
function extractImports(filePath) {
  const content = stripComments(fs.readFileSync(filePath, 'utf8'));
  const imports = new Set();

  for (const pattern of IMPORT_PATTERNS) {
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(content)) !== null) {
      if (isExternalPackage(match[1])) imports.add(getPackageName(match[1]));
    }
  }
  return imports;
}

/** Build the set of all declared package names from package.json */
function getDeclaredPackages() {
  const packagePath = path.join(projectRoot, 'package.json');
  const package_ = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  return new Set([
    ...Object.keys(package_.dependencies || {}),
    ...Object.keys(package_.devDependencies || {}),
    ...Object.keys(package_.peerDependencies || {})
  ]);
}

/** Collect and deduplicate all project files */
function getAllProjectFiles() {
  const extensions = ['.ts', '.mjs', '.cjs', '.js', '.vue'];
  const rootFiles = collectFiles(projectRoot, extensions).filter(
    (f) => !f.includes('/node_modules/') && !f.includes('/dist/')
  );
  const sourceFiles = collectFiles(path.join(projectRoot, 'src'), extensions);

  return [...new Set([...rootFiles, ...sourceFiles])];
}

/** Find undeclared imports across all files */
function findUndeclaredImports(files, declared) {
  const undeclared = new Map();

  for (const file of files) {
    for (const package_ of extractImports(file)) {
      if (declared.has(package_)) continue;
      if (!undeclared.has(package_)) undeclared.set(package_, []);
      undeclared.get(package_).push(path.relative(projectRoot, file));
    }
  }
  return undeclared;
}

/** Main check — returns { success, issues } */
export function checkDependencyIntegrity() {
  const declared = getDeclaredPackages();
  const files = getAllProjectFiles();
  const undeclared = findUndeclaredImports(files, declared);

  const issues = [...undeclared].map(([package_, files]) => ({ pkg: package_, files }));
  return { success: issues.length === 0, issues };
}

// CLI entry point
if (process.argv[1] && process.argv[1].includes('check-deps')) {
  const { success, issues } = checkDependencyIntegrity();

  if (success) {
    console.log('✔ All imported packages are declared in package.json');
  } else {
    console.error('✘ Undeclared dependencies found (phantom deps):');
    for (const issue of issues) {
      console.error(`  └─ "${issue.pkg}" imported by: ${issue.files.join(', ')}`);
    }
    process.exit(1);
  }
}
