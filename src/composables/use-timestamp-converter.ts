/* eslint-disable max-lines-per-function, max-statements */

import { ref, computed, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDistanceToNow } from 'date-fns';
import { zhTW, ja, enUS } from 'date-fns/locale';
import { UseLocalStorage } from './use-local-storage';
import { timestampToDate, dateToTimestamp } from '../utils/converter';

const LOCALE_MAP: Record<string, typeof zhTW> = {
  'zh-TW': zhTW,
  ja,
  en: enUS
};

type AddToHistoryFunction = (
  _type: string,
  _input: string,
  _output: string | number,
  _extra?: Record<string, unknown> | string | null
) => void;

type TimestampMode = 'auto' | 's' | 'ms';

/**
 * Default timestamp (current time in seconds)
 */
const getDefaultTimestamp = () => Math.floor(Date.now() / 1000).toString();

/**
 * Default date formatted as yyyy-mm-dd hh:mm:ss
 */
const getDefaultDate = () =>
  new Date()
    .toLocaleString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
    .replace(/,/, '');

/**
 * Sanitize timestamp input (numbers only, max 15 digits)
 */
const sanitizeTimestamp = (value: string) => value.replaceAll(/(?!^-)\D/g, '').slice(0, 15);

/**
 * Composable for managing timestamp conversion and state
 */
export const UseTimestampConverter = (addToHistory?: AddToHistoryFunction) => {
  const { locale: appLocale } = useI18n();

  // --- State ---
  const timestampInput = ref(getDefaultTimestamp());
  const dateResult = ref('');
  const dateInput = ref(getDefaultDate());
  const timestampResult = ref<string | number>('');
  const canPaste = ref(false);

  // Settings from LocalStorage
  const useMilliseconds = UseLocalStorage<boolean>('timestamp_use_ms', false);
  const timestampMode = UseLocalStorage<'auto' | 's' | 'ms'>('timestamp_mode', 'auto');
  const utcOffset = UseLocalStorage<number>('timestamp_utc_offset', 8);

  // --- Computed ---
  const timestampLength = computed(() => timestampInput.value?.length || 0);

  const relativeTime = computed(() => {
    if (!dateResult.value) return '';
    const date = new Date(dateResult.value);
    const dateFnsLocale = LOCALE_MAP[appLocale.value] || enUS;
    return Number.isNaN(date.getTime())
      ? ''
      : formatDistanceToNow(date, { addSuffix: true, locale: dateFnsLocale });
  });

  // --- Methods ---
  const convertToDate = (recordHistory = true) => {
    const res = timestampToDate(timestampInput.value, timestampMode.value, utcOffset.value);
    dateResult.value = res.value;
    if (res.success && recordHistory && addToHistory) {
      addToHistory('ts2date', timestampInput.value, res.value);
    }
  };

  const convertToTimestamp = (recordHistory = true) => {
    const res = dateToTimestamp(dateInput.value, useMilliseconds.value, utcOffset.value);
    timestampResult.value = res.value;
    if (res.success && recordHistory && addToHistory) {
      addToHistory('date2ts', dateInput.value, res.value);
    }
  };

  const pasteInput = async (target: 'ts' | 'date') => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      const text = clipboardText.trim();
      if (!text) return;

      if (target === 'ts') {
        timestampInput.value = text;
        convertToDate();
      } else {
        dateInput.value = text;
        convertToTimestamp();
      }
    } catch {
      /* ignore */
    }
  };

  // --- Watchers & Lifecycle ---
  // Re-run conversions when settings change without recording history
  watch([useMilliseconds, timestampMode, utcOffset], (newVals, oldVals) => {
    // Auto-convert timestamp digits when mode changes between s and ms
    const [, newMode] = newVals as [boolean, TimestampMode, number];
    const [, oldMode] = oldVals as [boolean, TimestampMode, number];

    if (newMode === 'ms' && oldMode === 's' && timestampInput.value.length === 10) {
      timestampInput.value += '000';
    } else if (newMode === 's' && oldMode === 'ms' && timestampInput.value.length === 13) {
      timestampInput.value = timestampInput.value.slice(0, 10);
    }

    convertToDate(false);
    convertToTimestamp(false);
  });

  watch(timestampInput, (value) => {
    const sanitized = sanitizeTimestamp(value);
    if (value !== sanitized) {
      timestampInput.value = sanitized;
    }
  });

  onMounted(() => {
    if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.readText === 'function') {
      canPaste.value = true;
    }
    // Initial Conversion
    convertToDate(false);
    convertToTimestamp(false);
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
    relativeTime,
    canPaste,
    convertToDate,
    convertToTimestamp,
    clearTimestampInput: () => {
      timestampInput.value = '';
    },
    clearDateInput: () => {
      dateInput.value = '';
    },
    pasteToTimestamp: () => pasteInput('ts'),
    pasteToDate: () => pasteInput('date')
  };
};
