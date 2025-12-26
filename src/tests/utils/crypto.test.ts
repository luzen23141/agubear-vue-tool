import { describe, it, expect } from 'vitest';
import { computeHash, toBase64, fromBase64, toUrl, fromUrl } from '../../utils/crypto';

describe('Crypto Utilities', () => {
  describe('computeHash', () => {
    const text = 'hello world';

    it('should compute MD5 hash', () => {
      // echo -n "hello world" | md5
      expect(computeHash(text, 'MD5')).toBe('5eb63bbbe01eeed093cb22bb8f5acdc3');
    });

    it('should compute SHA1 hash', () => {
      // echo -n "hello world" | shasum -a 1
      expect(computeHash(text, 'SHA1')).toBe('2aae6c35c94fcfb415dbe95f408b9ce91ee846ed');
    });

    it('should compute SHA256 hash', () => {
      // echo -n "hello world" | shasum -a 256
      expect(computeHash(text, 'SHA256')).toBe(
        'b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
      );
    });

    it('should compute SHA512 hash', () => {
      // echo -n "hello world" | shasum -a 512
      expect(computeHash(text, 'SHA512')).toBe(
        '309ecc489c12d6eb4cc40f50c902f2b4d0ed77ee511a7c7a9bcd3ca86d4cd86f989dd35bc5ff499670da34255b45b0cfd830e81f605dcf7dc5542e93ae9cd76f'
      );
    });

    it('should return null for unsupported algorithm', () => {
      expect(computeHash(text, 'UNKNOWN')).toBeNull();
    });

    it('should return empty string for empty input', () => {
      expect(computeHash('', 'MD5')).toBe('');
    });
  });

  describe('Base64 Encoding', () => {
    const text = 'hello world';
    const encoded = 'aGVsbG8gd29ybGQ=';
    const chineseText = '你好';
    const chineseEncoded = '5L2g5aW9'; // UTF-8 bytes to Base64

    it('should encode text to Base64', () => {
      expect(toBase64(text)).toBe(encoded);
    });

    it('should decode Base64 to text', () => {
      expect(fromBase64(encoded)).toBe(text);
    });

    it('should handle UTF-8 characters correctly', () => {
      expect(toBase64(chineseText)).toBe(chineseEncoded);
      expect(fromBase64(chineseEncoded)).toBe(chineseText);
    });

    it('should return null for invalid Base64 input', () => {
      expect(fromBase64('invalid-base64!')).toBeNull();
    });
  });

  describe('URL Encoding', () => {
    const text = 'hello world?&';
    const encoded = 'hello%20world%3F%26';

    it('should encode URL components', () => {
      expect(toUrl(text)).toBe(encoded);
    });

    it('should decode URL components', () => {
      expect(fromUrl(encoded)).toBe(text);
    });

    it('should handle malformed URI sequence gracefully', () => {
      expect(fromUrl('%E0%A4%A')).toBeNull(); // Incomplete sequence
    });
  });
});
