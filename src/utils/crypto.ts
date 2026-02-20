/**
 * Compute hash of a text string using specified algorithm.
 * Loads crypto-js dynamically (cached after first load).
 * @param {string} text - Input text
 * @param {string} algorithm - 'MD5', 'SHA1', 'SHA256', 'SHA512'
 * @returns {Promise<string|null>} Hex string of the hash, or null if invalid algorithm
 */

// Module-level cache for dynamic import
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _cryptoJSPromise: Promise<any> | null = null;

async function getCryptoJS() {
  _cryptoJSPromise ??= import('crypto-js').then((module_) => module_.default || module_);
  return _cryptoJSPromise;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getHashObject(CryptoJS: any, text: string, algo: string) {
  switch (algo) {
    case 'MD5': {
      return CryptoJS.MD5(text);
    }
    case 'SHA1': {
      return CryptoJS.SHA1(text);
    }
    case 'SHA256': {
      return CryptoJS.SHA256(text);
    }
    case 'SHA512': {
      return CryptoJS.SHA512(text);
    }
    default: {
      return null;
    }
  }
}

export async function computeHash(text: string, algorithm: string): Promise<string | null> {
  if (text === '' || text === null || text === undefined) return '';
  if (!algorithm) return null;

  try {
    const CryptoJS = await getCryptoJS();
    const hashObject = getHashObject(CryptoJS, text, algorithm.toUpperCase());
    return hashObject ? hashObject.toString(CryptoJS.enc.Hex) : null;
  } catch (error) {
    if (typeof process === 'undefined' || !process.env.VITEST) {
      console.error('computeHash error:', error);
    }
    return null;
  }
}

/**
 * Encode text to Base64 (supports UTF-8)
 * @param {string} text
 * @returns {Promise<string>} Base64 string
 */
export async function toBase64(text: string): Promise<string> {
  if (text === null || text === undefined) return '';
  try {
    const CryptoJS = await getCryptoJS();
    // Assuming 'options' and 'iv' are defined elsewhere or intended to be part of a larger change.
    // This line is inserted as per the user's instruction, but its context might be incomplete.
    // options.iv ??= CryptoJS.enc.Utf8.parse('1234567890123456');
    const wordArray = CryptoJS.enc.Utf8.parse(text);
    return CryptoJS.enc.Base64.stringify(wordArray);
  } catch (error) {
    if (typeof process === 'undefined' || !process.env.VITEST) {
      console.error('toBase64 error:', error);
    }
    return '';
  }
}

/**
 * Decode Base64 to text (supports UTF-8)
 * @param {string} base64
 * @returns {Promise<string|null>} Text string, or null if invalid Base64
 */
export async function fromBase64(base64: string): Promise<string | null> {
  if (!base64) return '';
  try {
    const CryptoJS = await getCryptoJS();
    const wordArray = CryptoJS.enc.Base64.parse(base64);
    return CryptoJS.enc.Utf8.stringify(wordArray);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('fromBase64 error:', error);
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
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('fromUrl error:', error);
    return null;
  }
}
