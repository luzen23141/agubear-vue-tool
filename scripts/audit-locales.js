/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-object-injection */
/* eslint-disable no-console */
/* eslint-env node */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDir = path.resolve(__dirname, '../src/locales');
const enPath = path.join(localesDir, 'en.json');

// Helper to confirm file exists
if (!fs.existsSync(enPath)) {
  console.error('❌ en.json not found!');
  process.exit(1);
}

// Helper to flatten object keys (e.g., { a: { b: 1 } } -> ['a.b'])
const flattenKeys = (obj, prefix = '') =>
  Object.keys(obj).reduce((acc, key) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenKeys(obj[key], pre + key));
    } else {
      acc[pre + key] = true;
    }
    return acc;
  }, {});

console.log('🔍 Starting Localization Audit...');

const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
const enKeys = flattenKeys(enContent);
const enKeyList = Object.keys(enKeys);

const files = fs.readdirSync(localesDir).filter((f) => f.endsWith('.json') && f !== 'en.json');
let hasErrors = false;

files.forEach((file) => {
  const filePath = path.join(localesDir, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const keys = flattenKeys(content);

  const missingKeys = enKeyList.filter((k) => !keys[k]);

  if (missingKeys.length > 0) {
    console.error(`❌ [${file}] Missing ${missingKeys.length} keys:`);
    // Show first 5 missing keys
    missingKeys.slice(0, 5).forEach((k) => console.error(`   - ${k}`));
    if (missingKeys.length > 5) console.error(`   ...and ${missingKeys.length - 5} more.`);
    hasErrors = true;
  } else {
    // Optional: Check for extra keys? Maybe not strict error but warning.
    console.log(`✅ [${file}] Passed`);
  }
});

if (hasErrors) {
  console.error(
    '\n💥 Localization integrity check failed. Please ensure all locales have the same keys as en.json.'
  );
  process.exit(1);
} else {
  console.log('\n✨ All locales are consistent with en.json!');
}
