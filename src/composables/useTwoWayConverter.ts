import { ref, computed, watch } from 'vue';
import { useHistory } from './useHistory';

export function useTwoWayConverter(
  type: string,
  encode: (_input: string) => string | null,
  decode: (_input: string) => string | null
) {
  const { addToHistory } = useHistory();
  const mode = ref('encode');
  const inputText = ref('');
  const lastOutput = ref('');

  const outputText = computed(() => {
    if (!inputText.value) return '';
    if (mode.value === 'encode') {
      const res = encode(inputText.value);
      return res ?? '';
    }
    const res = decode(inputText.value);
    return res ?? '';
  });

  watch(outputText, (newVal) => {
    if (newVal) lastOutput.value = newVal;
  });

  watch(mode, () => {
    // Swap input/output when switching modes
    // If we have a valid output, use it as the new input
    if (lastOutput.value) {
      inputText.value = lastOutput.value;
      lastOutput.value = '';
    } else {
      inputText.value = '';
    }
  });

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
    recordHistory
  };
}
