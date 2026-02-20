/**
 * Unescapes a string by removing backslashes used for escaping.
 * Useful for when JSON is embedded as a string within another JSON or string.
 * @param {string} input
 * @returns {string}
 */
export const unescapeString = (input: string): string => {
  if (!input) return '';
  // Simple unescape: replace \" with "
  // We might need a more robust approach if we want to handle full JSON string unescaping
  // But per requirements "Remove primitive escape chars", this often means \" -> "
  // Also handle \n, \t etc if they are literal characters in the string

  // Use a simple replace for now as per common "unescape" tools behavior online
  // They often just strip the escaping backslash from quote
  return input
    .replaceAll(String.raw`\"`, '"')
    .replaceAll(String.raw`\\`, '\\')
    .replaceAll(String.raw`\n`, '\n')
    .replaceAll(String.raw`\t`, '\t')
    .replaceAll(String.raw`\r`, '\r');
};

/**
 * Decodes Unicode escape sequences (e.g. \u4e2d) to their character representation.
 * @param {string} input
 * @returns {string}
 */
export const decodeUnicode = (input: string): string => {
  if (!input) return '';
  return input.replaceAll(/\\u[\da-f]{4}/gi, (match) =>
    String.fromCodePoint(Number.parseInt(match.replaceAll('\\u', ''), 16))
  );
};

export interface JsonError {
  message: string;
  line: number;
  column: number;
}

export interface ValidationResult {
  isValid: boolean;
  error: JsonError | null;
}

/**
 * Validates a JSON string.
 * @param {string} input
 * @returns {validationResult}
 */
export const validateJson = (input: string): ValidationResult => {
  if (!input || input.trim() === '') {
    return { isValid: false, error: { message: 'Empty input', line: 1, column: 1 } };
  }
  try {
    JSON.parse(input);
    return { isValid: true, error: null };
  } catch (error: unknown) {
    // Extract line and column from error message if available
    // Standard V8 Error message: "Unexpected token } in JSON at position 123"
    // We might need to manually calculate line/column from position
    let line = 1;
    let column = 1;
    const message = error instanceof Error ? error.message : String(error);

    // Use a match explicitly for 'at position'
    const positionMatch = /at position (\d+)/.exec(message);
    if (positionMatch) {
      const position = Number.parseInt(positionMatch[1] ?? '0', 10);
      const lines = input.slice(0, Math.max(0, position)).split('\n');
      line = lines.length;
      column = (lines.at(-1)?.length ?? 0) + 1;
    }
    // Sometimes line number is explicitly mentioned in other environments, but 'at position' is standard for V8

    return {
      isValid: false,
      error: {
        message,
        line,
        column
      }
    };
  }
};

export interface FormatOptions {
  unescape?: boolean;
  decodeUnicode?: boolean;
}

/**
 * Formats a JSON string with options.
 * @param {string} input
 * @param {FormatOptions} options
 * @returns {{result: string | null, error: Object | null}}
 */
export const formatJson = (
  input: string,
  options: FormatOptions = {}
): { result: string | null; error: JsonError | null } => {
  let processingInput = input;

  if (options.unescape) {
    processingInput = unescapeString(processingInput);
  }

  // If unescape resulted in a string that looks like it should be JSON parsed again,
  // we might want to do that, but "format" usually implies parsing what we have.
  // However, "unescape" often means the input was a stringified JSON.
  // e.g. "{\"a\":1}" -> {"a":1}
  // If the user inputs a raw JSON, unescape might break it if it has internal escaped quotes.
  // The requirement says "contain functionality to remove escape characters before double quotes".

  if (options.decodeUnicode) {
    processingInput = decodeUnicode(processingInput);
  }

  const validation = validateJson(processingInput);
  if (!validation.isValid) {
    return { result: null, error: validation.error };
  }

  try {
    const parsed = JSON.parse(processingInput);
    const formatted = JSON.stringify(parsed, null, 2);
    // If decodeUnicode is true, we might need to apply it again on the stringified result
    // because JSON.stringify might re-encode some characters depending on implementation,
    // though usually it keeps printable unicode chars as is.
    // But strictly speaking, JSON.stringify doesn't escape multibyte chars by default in modern JS.
    // So it should be fine.

    return { result: formatted, error: null };
  } catch (error: unknown) {
    // Should be caught by validateJson, but just in case
    return {
      result: null,
      error: { message: error instanceof Error ? error.message : String(error), line: 1, column: 1 }
    };
  }
};
