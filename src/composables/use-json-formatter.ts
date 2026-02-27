/* eslint-disable max-lines-per-function, max-statements */

import { ref, reactive, watch, onMounted, getCurrentInstance } from 'vue';
import JsonToTS from 'json-to-ts';
import { formatJson, type JsonError } from '../utils/json-utils';

// Helper logic extracted to reduce composable length
const minifyJson = (json: string): string => {
  try {
    return JSON.stringify(JSON.parse(json));
  } catch {
    return json;
  }
};

const convertToTs = (json: string): { result: string; error: string | null } => {
  try {
    const object = JSON.parse(json);
    return { result: JsonToTS(object).join('\n\n'), error: null };
  } catch (error) {
    return { result: '', error: (error as Error).message };
  }
};

export function UseJsonFormatter() {
  const inputJson = ref('');
  const outputJson = ref('');
  const error = ref<JsonError | null>(null);
  const options = reactive({ unescape: false, decodeUnicode: false });
  const canPaste = ref(false);

  const handleFormat = () => {
    error.value = null;
    if (!inputJson.value.trim()) {
      outputJson.value = '';
      return;
    }
    const res = formatJson(inputJson.value, options);
    if (res.error) error.value = res.error;
    else if (res.result !== null) outputJson.value = res.result;
  };

  const handleToTs = () => {
    error.value = null;
    if (!inputJson.value.trim()) {
      outputJson.value = '';
      return;
    }
    const fmt = formatJson(inputJson.value, options);
    if (fmt.error) {
      error.value = fmt.error;
      return;
    }
    const ts = convertToTs(fmt.result || '{}');
    if (ts.error) error.value = { message: `Conversion failed: ${ts.error}`, line: 0, column: 0 };
    else outputJson.value = ts.result;
  };

  const pasteInput = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const text = clipboardText.trim();
      if (text) inputJson.value = text;
    } catch {
      /* ignore */
    }
  };

  if (getCurrentInstance()) {
    onMounted(() => {
      if (typeof navigator?.clipboard?.readText === 'function') canPaste.value = true;
    });
  } else if (typeof navigator?.clipboard?.readText === 'function') {
    canPaste.value = true;
  }
  watch(inputJson, () => {
    if (error.value) error.value = null;
  });

  return {
    inputJson,
    outputJson,
    error,
    options,
    canPaste,
    handleFormat,
    handleToTs,
    pasteInput,
    handleMinify: () => {
      handleFormat();
      if (outputJson.value && !error.value) outputJson.value = minifyJson(outputJson.value);
    },
    handleClear: () => {
      inputJson.value = '';
      outputJson.value = '';
      error.value = null;
    }
  };
}
