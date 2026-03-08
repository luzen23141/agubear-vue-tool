import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDistanceToNow, type Locale } from 'date-fns';
import { UseLocalStorage } from './use-local-storage';
import { timestampToDate, dateToTimestamp } from '../utils/converter';

// Lazy-load date-fns locales; cache after first load
const dateFnsLocaleCache = new Map<string, Locale>();

// eslint-disable-next-line max-statements
async function getDateFnsLocale(code: string): Promise<Locale | undefined> {
  if (dateFnsLocaleCache.has(code)) return dateFnsLocaleCache.get(code);
  try {
    let locale: Locale;
    switch (code) {
      case 'zh-TW': {
        const module_ = await import('date-fns/locale/zh-TW');
        locale = module_.zhTW;
        break;
      }
      case 'ja': {
        const module_ = await import('date-fns/locale/ja');
        locale = module_.ja;
        break;
      }
      case 'en': {
        const module_ = await import('date-fns/locale/en-US');
        locale = module_.enUS;
        break;
      }
      case 'ko': {
        const module_ = await import('date-fns/locale/ko');
        locale = module_.ko;
        break;
      }
      case 'fr': {
        const module_ = await import('date-fns/locale/fr');
        locale = module_.fr;
        break;
      }
      case 'de': {
        const module_ = await import('date-fns/locale/de');
        locale = module_.de;
        break;
      }
      case 'es': {
        const module_ = await import('date-fns/locale/es');
        locale = module_.es;
        break;
      }
      default: {
        return undefined;
      }
    }
    dateFnsLocaleCache.set(code, locale);
    return locale;
  } catch {
    return undefined;
  }
}

type AddToHistoryFunction = (
  _type: string,
  _input: string,
  _output: string | number,
  _extra?: Record<string, unknown> | string | null
) => void;

type TimestampMode = 'auto' | 's' | 'ms';
type PasteTarget = 'ts' | 'date';

function getDefaultTimestamp() {
  return Math.floor(Date.now() / 1000).toString();
}

function getDefaultDate() {
  return new Date()
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
}

function sanitizeTimestamp(value: string) {
  return value.replaceAll(/(?!^-)\D/g, '').slice(0, 15);
}

function normalizeTimestampOnModeChange(
  input: string,
  nextMode: TimestampMode,
  previousMode: TimestampMode
) {
  if (nextMode === 'ms' && previousMode === 's' && input.length === 10) {
    return `${input}000`;
  }

  if (nextMode === 's' && previousMode === 'ms' && input.length === 13) {
    return input.slice(0, 10);
  }

  return input;
}

function getRelativeTimeDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function shouldRecordHistory(
  success: boolean,
  recordHistory: boolean,
  addToHistory?: AddToHistoryFunction
) {
  return success && recordHistory && Boolean(addToHistory);
}

/**
 * Composable for managing timestamp conversion and state
 */
// eslint-disable-next-line max-lines-per-function, max-statements
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

  const relativeTime = ref('');

  // Async relative time computation with lazy locale loading
  const updateRelativeTime = async () => {
    if (!dateResult.value) {
      relativeTime.value = '';
      return;
    }

    const date = getRelativeTimeDate(dateResult.value);
    if (!date) {
      relativeTime.value = '';
      return;
    }

    const locale = await getDateFnsLocale(appLocale.value);
    relativeTime.value = formatDistanceToNow(date, { addSuffix: true, locale });
  };

  watch([dateResult, () => appLocale.value], () => updateRelativeTime(), { immediate: true });

  // --- Methods ---
  const convertToDate = (recordHistory = true) => {
    const res = timestampToDate(timestampInput.value, timestampMode.value, utcOffset.value);
    dateResult.value = res.value;
    if (shouldRecordHistory(res.success, recordHistory, addToHistory)) {
      addToHistory?.('ts2date', timestampInput.value, res.value);
    }
  };

  const convertToTimestamp = (recordHistory = true) => {
    const res = dateToTimestamp(dateInput.value, useMilliseconds.value, utcOffset.value);
    timestampResult.value = res.value;
    if (shouldRecordHistory(res.success, recordHistory, addToHistory)) {
      addToHistory?.('date2ts', dateInput.value, res.value);
    }
  };

  const pasteInput = async (target: PasteTarget) => {
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
    const [, nextMode] = newVals as [boolean, TimestampMode, number];
    const [, previousMode] = oldVals as [boolean, TimestampMode, number];

    timestampInput.value = normalizeTimestampOnModeChange(
      timestampInput.value,
      nextMode,
      previousMode
    );

    convertToDate(false);
    convertToTimestamp(false);
  });

  watch(timestampInput, (value) => {
    const sanitized = sanitizeTimestamp(value);
    if (value !== sanitized) {
      timestampInput.value = sanitized;
    }
  });

  if (getCurrentInstance()) {
    onMounted(() => {
      if (typeof navigator !== 'undefined' && typeof navigator.clipboard?.readText === 'function') {
        canPaste.value = true;
      }
      // Initial Conversion
      convertToDate(false);
      convertToTimestamp(false);
    });
  } else if (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard?.readText === 'function'
  ) {
    // Fallback for tests or non-component environment
    canPaste.value = true;
  }

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
