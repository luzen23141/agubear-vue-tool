import { ref, watch } from 'vue';
import { useHistory } from './useHistory';

export type ConverterFunc = (_input: string) => string | null | Promise<string | null>;

// eslint-disable-next-line max-lines-per-function
export function useTwoWayConverter(type: string, encode: ConverterFunc, decode: ConverterFunc) {
  const { addToHistory } = useHistory();
  const mode = ref<'encode' | 'decode'>('encode');
  const inputText = ref('');
  const outputText = ref('');
  const isConverting = ref(false);

  // Watch for input/mode changes to trigger conversion
  const performConversion = async (
    text: string,
    currentMode: 'encode' | 'decode',
    checkCancelled: () => boolean
  ) => {
    isConverting.value = true;
    // try {
    const result = currentMode === 'encode' ? await encode(text) : await decode(text);
    if (!checkCancelled()) {
      outputText.value = result || '';
    }
    // } catch (error) {
    //   // eslint-disable-next-line no-console
    //   console.error('Conversion error:', error);
    //   if (!checkCancelled()) outputText.value = '';
    // } finally {
    if (!checkCancelled()) isConverting.value = false;
    // }
  };

  watch(
    [inputText, mode],
    ([newInput, newMode], [_oldInput, oldMode], onCleanup) => {
      // Swap input/output if mode changes
      if (oldMode && newMode !== oldMode && outputText.value) {
        inputText.value = outputText.value;
        return;
      }

      let isCancelled = false;
      onCleanup(() => {
        isCancelled = true;
      });

      if (!newInput) {
        outputText.value = '';
        return;
      }

      performConversion(newInput, newMode, () => isCancelled);
    },
    { immediate: true }
  );

  const recordHistory = () => {
    if (!outputText.value) return;
    const displayInput =
      inputText.value.length > 20 ? `${inputText.value.slice(0, 20)}...` : inputText.value;
    const displayOutput =
      outputText.value.length > 20 ? `${outputText.value.slice(0, 20)}...` : outputText.value;
    addToHistory(type, displayInput, displayOutput);
  };

  return {
    mode,
    inputText,
    outputText,
    isConverting,
    recordHistory
  };
}
