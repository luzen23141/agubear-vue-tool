/**
 * Compute hash of a text string using specified algorithm.
 * Loads crypto-js dynamically.
 * @param {string} text - Input text
 * @param {string} algorithm - 'MD5', 'SHA1', 'SHA256', 'SHA512'
 * @returns {Promise<string|null>} Hex string of the hash, or null if invalid algorithm
 */
export async function computeHash(text: string, algorithm: string): Promise<string | null> {
  if (text === '' || text === null || text === undefined) return '';
  if (!algorithm) return null;

  try {
    // Dynamic import to split chunk
    const mod = await import('crypto-js');
    const CryptoJS = mod.default || mod;
    const hashObject = getHashObject(CryptoJS, text, algorithm.toUpperCase());
    return hashObject ? hashObject.toString(CryptoJS.enc.Hex) : null;
  } catch (e) {
    if (typeof process === 'undefined' || !process.env.VITEST) {
      console.error('computeHash error:', e);
    }
    return null;
  }
}

/**
 * Helper: Get CryptoJS hash object
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getHashObject(CryptoJS: any, text: string, algo: string) {
  switch (algo) {
    case 'MD5':
      return CryptoJS.MD5(text);
    case 'SHA1':
      return CryptoJS.SHA1(text);
    case 'SHA256':
      return CryptoJS.SHA256(text);
    case 'SHA512':
      return CryptoJS.SHA512(text);
    default:
      return null;
  }
}

/**
 * Encode text to Base64 (supports UTF-8)
 * Loads crypto-js dynamically.
 * @param {string} text
 * @returns {Promise<string>} Base64 string
 */
export async function toBase64(text: string): Promise<string> {
  if (text === null || text === undefined) return '';
  try {
    const mod = await import('crypto-js');
    const CryptoJS = mod.default || mod;
    const wordArray = CryptoJS.enc.Utf8.parse(text);
    const res = CryptoJS.enc.Base64.stringify(wordArray);
    return res;
  } catch (e) {
    if (typeof process === 'undefined' || !process.env.VITEST) {
      console.error('toBase64 error:', e);
    }
    return '';
  }
}

/**
 * Decode Base64 to text (supports UTF-8)
 * Loads crypto-js dynamically.
 * @param {string} base64
 * @returns {Promise<string|null>} Text string, or null if invalid Base64
 */
export async function fromBase64(base64: string): Promise<string | null> {
  if (!base64) return '';
  try {
    const mod = await import('crypto-js');
    const CryptoJS = mod.default || mod;
    const wordArray = CryptoJS.enc.Base64.parse(base64);
    const result = CryptoJS.enc.Utf8.stringify(wordArray);
    return result;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('fromBase64 error:', e);
    return null;
  }
}

/**
 * Encode text to URL entities
 * @param {string} text
 * @returns {string}
 */
export function toUrl(text: string): string {
  if (text === null || text === undefined) return '';
  return encodeURIComponent(text);
}

/**
 * Decode URL entities to text
 * @param {string} urlEncoded
 * @returns {string|null} Decoded string or null if malformed
 */
export function fromUrl(urlEncoded: string): string | null {
  if (!urlEncoded) return '';
  try {
    return decodeURIComponent(urlEncoded);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('fromUrl error:', e);
    return null;
  }
}
