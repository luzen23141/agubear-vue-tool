import { ref, computed, watch } from 'vue';
import { format } from 'date-fns';
import { timestampToDate, dateToTimestamp } from '../utils/converter';

type AddToHistoryFn = (
  _type: string,
  _input: string,
  _output: string | number,
  _extra?: Record<string, unknown> | string | null
) => void;

const DEFAULT_TS = () => Math.floor(Date.now() / 1000).toString();
const DEFAULT_DATE = () => format(new Date(), 'yyyy-MM-dd HH:mm:ss');

export const useTimestampConverter = (addToHistory?: AddToHistoryFn) => {
  const timestampInput = ref(DEFAULT_TS());
  const dateResult = ref('');
  const dateInput = ref(DEFAULT_DATE());
  const timestampResult = ref<string | number>('');

  const useMilliseconds = ref(false);
  const timestampMode = ref<'auto' | 's' | 'ms'>('auto');
  const utcOffset = ref(8);

  const timestampLength = computed(() =>
    timestampInput.value ? String(timestampInput.value).length : 0
  );

  const convertToDate = () => {
    const res = timestampToDate(timestampInput.value, timestampMode.value, utcOffset.value);
    dateResult.value = res.value;
    if (res.success && addToHistory) addToHistory('ts2date', timestampInput.value, res.value);
  };

  const convertToTimestamp = () => {
    const res = dateToTimestamp(dateInput.value, useMilliseconds.value, utcOffset.value);
    timestampResult.value = res.value;
    if (res.success && addToHistory) addToHistory('date2ts', dateInput.value, res.value);
  };

  watch([useMilliseconds, timestampMode, utcOffset], () => {
    dateResult.value = timestampToDate(
      timestampInput.value,
      timestampMode.value,
      utcOffset.value
    ).value;
    timestampResult.value = dateToTimestamp(
      dateInput.value,
      useMilliseconds.value,
      utcOffset.value
    ).value;
  });

  watch(timestampInput, (val) => {
    const sanitized = val.replaceAll(/(?!^-)\D/g, '').slice(0, 15);
    if (val !== sanitized) timestampInput.value = sanitized;
  });

  return {
    timestampInput,
    dateResult,
    dateInput,
    timestampResult,
    useMilliseconds,
    timestampMode,
    timestampLength,
    utcOffset,
    convertToDate,
    convertToTimestamp
  };
};
