/* eslint-disable no-console, security/detect-non-literal-fs-filename, security/detect-object-injection */
/* eslint-env node */
const fs = require('node:fs');
const path = require('node:path');

const localesDirectory = path.join(__dirname, '../src/locales');
const sourceFile = path.join(localesDirectory, 'zh-TW.json');

if (!fs.existsSync(sourceFile)) {
  console.error('Source file (zh-TW.json) not found!');
  process.exit(1);
}

const sourceContent = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));

function getKeys(object, prefix = '') {
  let keys = [];
  for (const key in object) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof object[key] === 'object' && object[key] !== null && !Array.isArray(object[key])) {
      keys = [...keys, ...getKeys(object[key], fullKey)];
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const sourceKeys = new Set(getKeys(sourceContent));
const files = fs.readdirSync(localesDirectory).filter(f => f.endsWith('.json') && f !== 'zh-TW.json');

let hasError = false;

for (const file of files) {
  const content = JSON.parse(fs.readFileSync(path.join(localesDirectory, file), 'utf8'));
  const targetKeys = new Set(getKeys(content));
  
  const missing = [...sourceKeys].filter(k => !targetKeys.has(k));
  
  if (missing.length > 0) {
    console.error(`❌ ${file} is missing ${missing.length} keys:`);
    for (const k of missing.slice(0, 5)) console.log(`   - ${k}`);
    if (missing.length > 5) console.log(`   ...and ${missing.length - 5} more.`);
    hasError = true;
  } else {
    console.log(`✅ ${file} is complete.`);
  }
}

if (hasError) {
  process.exit(1);
} else {
  console.log('🎉 All locales are complete!');
}
