/* eslint-disable */
const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const sourceFile = path.join(localesDir, 'zh-TW.json');

if (!fs.existsSync(sourceFile)) {
  console.error('Source file (zh-TW.json) not found!');
  process.exit(1);
}

const sourceContent = JSON.parse(fs.readFileSync(sourceFile, 'utf-8'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys = keys.concat(getKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const sourceKeys = new Set(getKeys(sourceContent));
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.json') && f !== 'zh-TW.json');

let hasError = false;

files.forEach(file => {
  const content = JSON.parse(fs.readFileSync(path.join(localesDir, file), 'utf-8'));
  const targetKeys = new Set(getKeys(content));
  
  const missing = [...sourceKeys].filter(k => !targetKeys.has(k));
  
  if (missing.length > 0) {
    console.error(`❌ ${file} is missing ${missing.length} keys:`);
    missing.slice(0, 5).forEach(k => console.log(`   - ${k}`));
    if (missing.length > 5) console.log(`   ...and ${missing.length - 5} more.`);
    hasError = true;
  } else {
    console.log(`✅ ${file} is complete.`);
  }
});

if (hasError) {
  process.exit(1);
} else {
  console.log('🎉 All locales are complete!');
}
