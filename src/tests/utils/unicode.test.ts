/**
 * Unicode 轉換函式測試
 */
import { describe, it, expect } from 'vitest';
import {
  textToUnicode,
  unicodeToText,
  textToHtmlEntity,
  htmlEntityToText
} from '../../utils/unicode';

// ============================================
// textToUnicode 測試
// ============================================

const textToUnicodeCases = [
  { input: '你好', skipAscii: false, expected: '\\u4f60\\u597d', desc: '中文字轉 Unicode' },
  { input: 'ABC', skipAscii: false, expected: '\\u0041\\u0042\\u0043', desc: '英文字母轉 Unicode' },
  { input: 'ABC', skipAscii: true, expected: 'ABC', desc: '跳過 ASCII 字母' },
  { input: '123', skipAscii: true, expected: '123', desc: '跳過 ASCII 數字' },
  { input: 'A你B好', skipAscii: true, expected: 'A\\u4f60B\\u597d', desc: '混合文字跳過 ASCII' },
  { input: '👋', skipAscii: false, expected: '\\ud83d\\udc4b', desc: 'Emoji (Surrogate Pairs)' },
  { input: ' ', skipAscii: false, expected: '\\u0020', desc: '空格轉 Unicode' },
  { input: '', skipAscii: false, expected: '', desc: '空字串回傳空字串' },
  // 複雜 Emoji
  {
    input: '👨‍👩‍👧‍👦',
    skipAscii: false,
    expected: '\\ud83d\\udc68\\u200d\\ud83d\\udc69\\u200d\\ud83d\\udc67\\u200d\\ud83d\\udc66',
    desc: '家庭 Emoji (多重 Surrogate Pairs)'
  }
];

const unicodeToTextCases = [
  { input: '\\u4f60\\u597d', expected: '你好', desc: 'Unicode 轉中文字' },
  { input: '\\u0041\\u0042\\u0043', expected: 'ABC', desc: 'Unicode 轉英文字母' },
  { input: 'Hello \\u4e16\\u754c', expected: 'Hello 世界', desc: '混合文字 Unicode 解碼' },
  { input: '\\ud83d\\udc4b', expected: '👋', desc: 'Emoji Unicode 解碼' },
  { input: '', expected: '', desc: '空字串回傳空字串' },
  { input: 'no unicode here', expected: 'no unicode here', desc: '無 Unicode 序列原樣回傳' },
  { input: '👋', expected: '👋', desc: '原始 Emoji (無轉義) 原樣回傳' },
  // 異常解碼 (不完整序列應視為普通字串)
  { input: '\\u12', expected: '\\u12', desc: '不完整 Unicode 序列 (2位)' },
  { input: '\\uG123', expected: '\\uG123', desc: '非十六進位 Unicode 序列' }
];

// ============================================
// HTML Entity 測試
// ============================================

const textToHtmlEntityCases = [
  { input: '你好', skipAscii: false, expected: '&#x4F60;&#x597D;', desc: '中文轉 HTML Entity' },
  { input: 'AB', skipAscii: true, expected: 'AB', desc: '跳過 ASCII 字母' },
  { input: '12', skipAscii: true, expected: '12', desc: '跳過 ASCII 數字' },
  {
    input: 'a1你',
    skipAscii: true,
    expected: 'a1&#x4F60;',
    desc: '混合 ASCII 與 Unicode (跳過 ASCII)'
  },
  { input: '', skipAscii: false, expected: '', desc: '空字串回傳空字串' }
];

const htmlEntityToTextCases = [
  { input: '&#x4F60;&#x597D;', expected: '你好', desc: 'HTML Entity 轉中文' },
  { input: '&#x41;&#x42;', expected: 'AB', desc: 'HTML Entity 轉英文' },
  { input: '', expected: '', desc: '空字串回傳空字串' },
  { input: 'no entity', expected: 'no entity', desc: '無 Entity 原樣回傳' },
  // 異常解碼
  { input: '&#x;', expected: '&#x;', desc: '空 HTML Entity' },
  { input: '&#xG1;', expected: '&#xG1;', desc: '無效 HTML Entity' }
];

// ============================================
// 執行測試
// ============================================

describe('textToUnicode', () => {
  it.each(textToUnicodeCases)('$desc', ({ input, skipAscii, expected }) => {
    expect(textToUnicode(input, skipAscii)).toBe(expected);
  });
});

describe('unicodeToText', () => {
  it.each(unicodeToTextCases)('$desc', ({ input, expected }) => {
    expect(unicodeToText(input)).toBe(expected);
  });

  it('雙向轉換一致性', () => {
    const original = '你好世界 Hello 123';
    const encoded = textToUnicode(original);
    const decoded = unicodeToText(encoded);
    expect(decoded).toBe(original);
  });
});

describe('textToHtmlEntity', () => {
  it.each(textToHtmlEntityCases)('$desc', ({ input, skipAscii, expected }) => {
    expect(textToHtmlEntity(input, skipAscii)).toBe(expected);
  });
});

describe('htmlEntityToText', () => {
  it.each(htmlEntityToTextCases)('$desc', ({ input, expected }) => {
    expect(htmlEntityToText(input)).toBe(expected);
  });

  it('雙向轉換一致性', () => {
    const original = '測試文字';
    const encoded = textToHtmlEntity(original);
    const decoded = htmlEntityToText(encoded);
    expect(decoded).toBe(original);
  });
});
