/**
 * Unicode 轉換工具函式
 */

function isAscii(code: number): boolean {
  return (
    (code >= 0x30 && code <= 0x39) || // 0-9
    (code >= 0x41 && code <= 0x5a) || // A-Z
    (code >= 0x61 && code <= 0x7a) // a-z
  );
}

function processText(
  text: string,
  skipAscii: boolean,
  transform: (_code: number) => string
): string {
  if (!text) return '';

  return Array.from(text)
    .map((char) => {
      const code = char.codePointAt(0);
      if (code === undefined) return '';

      // 跳過 ASCII 字母和數字
      if (skipAscii && isAscii(code)) {
        return char;
      }

      return transform(code);
    })
    .join('');
}

/**
 * 將文字轉為 Unicode 編碼 (\uXXXX 格式)
 * @param {string} text - 輸入文字
 * @param {boolean} skipAscii - 是否跳過 ASCII 字元（字母、數字）
 * @returns {string} Unicode 編碼字串
 */
export function textToUnicode(text: string, skipAscii = false): string {
  return processText(text, skipAscii, (code) =>
    // 處理 BMP 範圍內的字元 (U+0000 ~ U+FFFF)
    code <= 0xffff
      ? String.raw`\u${code.toString(16).padStart(4, '0')}`
      : String.raw`\u${(Math.floor((code - 0x10000) / 0x400) + 0xd800).toString(16).padStart(4, '0')}\u${(((code - 0x10000) % 0x400) + 0xdc00).toString(16).padStart(4, '0')}`
  );
}

/**
 * 將 Unicode 編碼 (\uXXXX 格式) 轉為文字
 * @param {string} encoded - Unicode 編碼字串
 * @returns {string} 解碼後的文字
 */
export function unicodeToText(encoded: string): string {
  if (!encoded) return '';

  try {
    // 處理 \uXXXX 格式
    return encoded.replaceAll(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    );
  } catch (e) {
    if (typeof process === 'undefined' || !process.env.VITEST) {
      console.error('unicodeToText error:', e);
    }
    return encoded;
  }
}

/**
 * 將文字轉為 HTML Entity 格式 (&#xXXXX;)
 * @param {string} text - 輸入文字
 * @param {boolean} skipAscii - 是否跳過 ASCII 字元
 * @returns {string} HTML Entity 字串
 */
export function textToHtmlEntity(text: string, skipAscii = false): string {
  return processText(text, skipAscii, (code) => `&#x${code.toString(16).toUpperCase()};`);
}

/**
 * 將 HTML Entity (&#xXXXX;) 轉為文字
 * @param {string} encoded - HTML Entity 字串
 * @returns {string} 解碼後的文字
 */
export function htmlEntityToText(encoded: string): string {
  if (!encoded) return '';

  try {
    return encoded.replaceAll(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(Number.parseInt(hex, 16))
    );
  } catch (e) {
    if (typeof process === 'undefined' || !process.env.VITEST) {
      console.error('htmlEntityToText error:', e);
    }
    return encoded;
  }
}
