import { describe, it, expect } from 'vitest';
import { formatJson, validateJson, unescapeString, decodeUnicode } from '../../utils/jsonUtils';

describe('jsonUtils', () => {
  describe('formatJson', () => {
    it('should format valid JSON with indentation', () => {
      const input = '{"a":1,"b":2}';
      const result = formatJson(input);
      expect(result.error).toBeNull();
      expect(result.result).toBe('{\n  "a": 1,\n  "b": 2\n}');
    });

    it('should return error for invalid JSON', () => {
      const input = '{"a":1,';
      const result = formatJson(input);
      expect(result.error).not.toBeNull();
      expect(result.result).toBeNull();
    });

    it('should handle unescape option', () => {
      // Input is: {\"a\": 1}
      // Unescaped: {"a": 1} -> Valid JSON object
      const input = '{\\"a\\": 1}';
      const result = formatJson(input, { unescape: true });
      expect(result.result).toContain('"a": 1');
      expect(result.error).toBeNull();
    });

    it('should handle unicode decode option', () => {
      const input = '{"a": "\\u4e2d\\u6587"}';
      const result = formatJson(input, { decodeUnicode: true });
      expect(result.result).toContain('中文');
    });
  });

  describe('validateJson', () => {
    it('should return valid for correct JSON', () => {
      const input = '{"a": 1}';
      const result = validateJson(input);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    it('should return invalid with error details for incorrect JSON', () => {
      const input = '{"a": 1,}'; // Trailing comma
      const result = validateJson(input);
      expect(result.isValid).toBe(false);
      expect(result.error).toBeDefined();
      // We expect some indication of where the error is
      expect(result.error.message).toBeDefined();
    });
  });

  describe('unescapeString', () => {
    it('should remove backslashes before quotes', () => {
      const input = '{\\"a\\": \\"b\\"}';
      expect(unescapeString(input)).toBe('{"a": "b"}');
    });

    it('should handle escaped newlines', () => {
      const input = 'LineOfText\\nSecondLine';
      expect(unescapeString(input)).toBe('LineOfText\nSecondLine');
    });
  });

  describe('decodeUnicode', () => {
    it('should decode unicode sequences', () => {
      const input = '\\u4e2d\\u6587';
      expect(decodeUnicode(input)).toBe('中文');
    });

    it('should leave non-unicode text alone', () => {
      const input = 'Hello World';
      expect(decodeUnicode(input)).toBe('Hello World');
    });

    it('should handle mixed content', () => {
      const input = 'Hello \\u4e16\\u754c';
      expect(decodeUnicode(input)).toBe('Hello 世界');
    });
  });
});
