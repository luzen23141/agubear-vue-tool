/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable security/detect-object-injection */
/* eslint-disable no-console */
/* eslint-env node */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDirectory = path.resolve(__dirname, '../src/locales');
const enPath = path.join(localesDirectory, 'en.json');

// Helper to confirm file exists
if (!fs.existsSync(enPath)) {
  console.error('❌ en.json not found!');
  process.exit(1);
}

// Helper to flatten object keys (e.g., { a: { b: 1 } } -> ['a.b'])
const flattenKeys = (object, prefix = '') => {
  const accumulator = {};
  for (const key of Object.keys(object)) {
    const pre = prefix.length > 0 ? `${prefix}.` : '';
    if (typeof object[key] === 'object' && object[key] !== null && !Array.isArray(object[key])) {
      Object.assign(accumulator, flattenKeys(object[key], pre + key));
    } else {
      accumulator[pre + key] = true;
    }
  }
  return accumulator;
};

console.log('🔍 Starting Localization Audit...');

const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const enKeys = flattenKeys(enContent);
const enKeyList = Object.keys(enKeys);

const files = fs
  .readdirSync(localesDirectory)
  .filter((f) => f.endsWith('.json') && f !== 'en.json');
let hasErrors = false;

for (const file of files) {
  const filePath = path.join(localesDirectory, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const keys = flattenKeys(content);

  const missingKeys = enKeyList.filter((k) => !keys[k]);

  if (missingKeys.length > 0) {
    console.error(`❌ [${file}] Missing ${missingKeys.length} keys:`);
    // Show first 5 missing keys
    for (const k of missingKeys.slice(0, 5)) console.error(`   - ${k}`);
    if (missingKeys.length > 5) console.error(`   ...and ${missingKeys.length - 5} more.`);
    hasErrors = true;
  } else {
    // Optional: Check for extra keys? Maybe not strict error but warning.
    console.log(`✅ [${file}] Passed`);
  }
}

if (hasErrors) {
  console.error(
    '\n💥 Localization integrity check failed. Please ensure all locales have the same keys as en.json.'
  );
  process.exit(1);
} else {
  console.log('\n✨ All locales are consistent with en.json!');
}
