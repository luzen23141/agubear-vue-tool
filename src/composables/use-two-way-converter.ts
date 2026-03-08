import { ref, watch } from 'vue';
import { useHistoryStore } from '@/stores/history';

export type ConverterFunction = (_input: string) => string | null | Promise<string | null>;

type ConverterMode = 'encode' | 'decode';

type ModeChangeState = {
  nextInput: string | null;
  shouldConvert: boolean;
};

function resolveModeChangeState(
  nextMode: ConverterMode,
  previousMode: ConverterMode | undefined,
  currentInput: string,
  currentOutput: string
): ModeChangeState {
  if (!previousMode || nextMode === previousMode) {
    return {
      nextInput: null,
      shouldConvert: Boolean(currentInput)
    };
  }

  if (!currentOutput) {
    return {
      nextInput: null,
      shouldConvert: Boolean(currentInput)
    };
  }

  return {
    nextInput: currentOutput,
    shouldConvert: false
  };
}

function truncateHistoryValue(value: string) {
  return value.length > 20 ? `${value.slice(0, 20)}...` : value;
}

function getHistoryEntry(input: string, output: string) {
  if (!output) {
    return null;
  }

  return {
    input: truncateHistoryValue(input),
    output: truncateHistoryValue(output)
  };
}

// eslint-disable-next-line max-lines-per-function
export function UseTwoWayConverter(
  type: string,
  encode: ConverterFunction,
  decode: ConverterFunction
) {
  const { addToHistory } = useHistoryStore();
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
      const modeChangeState = resolveModeChangeState(newMode, oldMode, newInput, outputText.value);
      if (modeChangeState.nextInput !== null) {
        inputText.value = modeChangeState.nextInput;
        return;
      }

      let isCancelled = false;
      onCleanup(() => {
        isCancelled = true;
      });

      if (!modeChangeState.shouldConvert) {
        outputText.value = '';
        return;
      }

      performConversion(newInput, newMode, () => isCancelled);
    },
    { immediate: true }
  );

  const recordHistory = () => {
    const entry = getHistoryEntry(inputText.value, outputText.value);
    if (!entry) return;

    addToHistory(type, entry.input, entry.output);
  };

  return {
    mode,
    inputText,
    outputText,
    isConverting,
    recordHistory
  };
}
