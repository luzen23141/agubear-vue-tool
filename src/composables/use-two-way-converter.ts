import { ref, watch } from 'vue';
import { UseHistory } from './use-history';

export type ConverterFunction = (_input: string) => string | null | Promise<string | null>;

type ConverterMode = 'encode' | 'decode';

function getNextInputOnModeChange(
  nextMode: ConverterMode,
  previousMode: ConverterMode | undefined,
  currentOutput: string
) {
  if (!previousMode || nextMode === previousMode || !currentOutput) {
    return null;
  }

  return currentOutput;
}

// eslint-disable-next-line max-lines-per-function
export function UseTwoWayConverter(
  type: string,
  encode: ConverterFunction,
  decode: ConverterFunction
) {
  const { addToHistory } = UseHistory();
  const mode = ref<ConverterMode>('encode');
  const inputText = ref('');
  const outputText = ref('');
  const isConverting = ref(false);

  // Watch for input/mode changes to trigger conversion
  const performConversion = async (
    text: string,
    currentMode: ConverterMode,
    checkCancelled: () => boolean
  ) => {
    isConverting.value = true;
    try {
      const result = currentMode === 'encode' ? await encode(text) : await decode(text);
      if (!checkCancelled()) {
        outputText.value = result || '';
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Conversion error:', error);
      if (!checkCancelled()) outputText.value = '';
    } finally {
      if (!checkCancelled()) isConverting.value = false;
    }
  };

  watch(
    [inputText, mode],
    ([newInput, newMode], [_oldInput, oldMode], onCleanup) => {
      const nextInput = getNextInputOnModeChange(newMode, oldMode, outputText.value);
      if (nextInput !== null) {
        inputText.value = nextInput;
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
