/* eslint-disable no-console, security/detect-non-literal-fs-filename */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localesDirectory = path.resolve(__dirname, '../src/locales');
const files = fs.readdirSync(localesDirectory).filter((f) => f.endsWith('.json'));

const diffContextEn = {
  title: 'About Diff Checker',
  content: [
    'A Diff Checker is a tool used to compare two text inputs and highlight their differences. It is widely used by developers to track code changes, identify bugs, and merge conflicts.',
    'This tool uses a semantic comparison algorithm to show insertions and deletions clearly. It supports inline diffing for better readability.',
    'AguBear Tools ensures your data remains private as all comparisons happen locally in your browser.'
  ]
};

const diffContextZhTw = {
  title: '關於文字比對工具',
  content: [
    'Diff Checker 是一個用來比對兩段文字差異的工具。它常被開發者用來追蹤程式碼變更、找出 Bug 以及解決合併衝突。',
    '本工具使用語意化比對演算法，清晰地標示出新增與刪除的內容，並支援行內比對以提升閱讀性。',
    'AguBear Tools 確保您的資料隱私，所有比對皆在您的瀏覽器端本地執行，不會上傳至伺服器。'
  ]
};

for (const file of files) {
  const filePath = path.join(localesDirectory, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  if (!content.diff) {
    content.diff = {};
  }

  // Ensure diff.context exists
  if (content.diff.context) {
    console.log(`Skipping ${file} (already has context)`);
  } else {
    console.log(`Patching ${file}...`);

    content.diff.context =
      file === 'zh-TW.json' || file === 'zh-CN.json' ? diffContextZhTw : diffContextEn;

    fs.writeFileSync(filePath, `${JSON.stringify(content, null, 2)}\n`);
  }
}

console.log('All locales patched successfully.');
