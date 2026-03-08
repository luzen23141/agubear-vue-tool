import { ref, computed, watch, onMounted, getCurrentInstance } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatDistanceToNow, type Locale } from 'date-fns';
import { UseLocalStorage } from './use-local-storage';
import { canUseClipboardRead, readClipboardText } from './use-copy-to-clipboard';
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

type TimestampState = {
  timestampInput: { value: string };
  dateInput: { value: string };
};

type TimestampInitializer = {
  canPaste: boolean;
  initialize: () => void;
};

type TimestampConversionResult = {
  success: boolean;
  value: string | number;
};

function getTimestampToDateResult(input: string, mode: TimestampMode, offset: number) {
  return timestampToDate(input, mode, offset);
}

function getDateToTimestampResult(input: string, useMilliseconds: boolean, offset: number) {
  return dateToTimestamp(input, useMilliseconds, offset);
}

function applyTimestampConversionResult(
  result: TimestampConversionResult,
  options: {
    output: { value: string | number };
    recordHistory: boolean;
    addToHistory?: AddToHistoryFunction;
    historyType: string;
    historyInput: string;
  }
) {
  options.output.value = result.value;
  if (shouldRecordHistory(result.success, options.recordHistory, options.addToHistory)) {
    options.addToHistory?.(options.historyType, options.historyInput, result.value);
  }
}

function syncTimestampInputOnSettingsChange(
  timestampInput: { value: string },
  nextMode: TimestampMode,
  previousMode: TimestampMode
) {
  timestampInput.value = normalizeTimestampOnModeChange(
    timestampInput.value,
    nextMode,
    previousMode
  );
}

function sanitizeTimestampInput(timestampInput: { value: string }) {
  const sanitized = sanitizeTimestamp(timestampInput.value);
  if (timestampInput.value !== sanitized) {
    timestampInput.value = sanitized;
  }
}

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
  const digitsOnly = value.replaceAll(/\D/g, '');
  return `${value.startsWith('-') ? '-' : ''}${digitsOnly}`.slice(0, 15);
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

async function getRelativeTimeValue(value: string, localeCode: string) {
  if (!value) {
    return '';
  }

  const date = getRelativeTimeDate(value);
  if (!date) {
    return '';
  }

  const locale = await getDateFnsLocale(localeCode);
  return formatDistanceToNow(date, { addSuffix: true, locale });
}

function shouldRecordHistory(
  success: boolean,
  recordHistory: boolean,
  addToHistory?: AddToHistoryFunction
) {
  return success && recordHistory && Boolean(addToHistory);
}

function hasClipboardReadSupport() {
  return canUseClipboardRead();
}

async function readTrimmedClipboardText() {
  return readClipboardText({ trim: true });
}

function applyPastedInput(options: {
  target: PasteTarget;
  text: string;
  state: TimestampState;
  convertToDate: () => void;
  convertToTimestamp: () => void;
}) {
  if (options.target === 'ts') {
    options.state.timestampInput.value = options.text;
    options.convertToDate();
    return;
  }

  options.state.dateInput.value = options.text;
  options.convertToTimestamp();
}

function createTimestampInitializer(
  canPaste: { value: boolean },
  convertToDate: () => void,
  convertToTimestamp: () => void
): TimestampInitializer {
  const initialize = () => {
    if (hasClipboardReadSupport()) {
      canPaste.value = true;
    }

    convertToDate();
    convertToTimestamp();
  };

  return {
    canPaste: hasClipboardReadSupport(),
    initialize
  };
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
    relativeTime.value = await getRelativeTimeValue(dateResult.value, appLocale.value);
  };

  watch([dateResult, () => appLocale.value], () => updateRelativeTime(), { immediate: true });

  // --- Methods ---
  const convertToDate = (recordHistory = true) => {
    applyTimestampConversionResult(
      getTimestampToDateResult(timestampInput.value, timestampMode.value, utcOffset.value),
      {
        output: dateResult,
        recordHistory,
        addToHistory,
        historyType: 'ts2date',
        historyInput: timestampInput.value
      }
    );
  };

  const convertToTimestamp = (recordHistory = true) => {
    applyTimestampConversionResult(
      getDateToTimestampResult(dateInput.value, useMilliseconds.value, utcOffset.value),
      {
        output: timestampResult,
        recordHistory,
        addToHistory,
        historyType: 'date2ts',
        historyInput: dateInput.value
      }
    );
  };

  const pasteInput = async (target: PasteTarget) => {
    try {
      const text = await readTrimmedClipboardText();
      if (!text) return;

      applyPastedInput({
        target,
        text,
        state: { timestampInput, dateInput },
        convertToDate: () => convertToDate(),
        convertToTimestamp: () => convertToTimestamp()
      });
    } catch {
      /* ignore */
    }
  };

  const { canPaste: hasClipboardSupport, initialize } = createTimestampInitializer(
    canPaste,
    () => convertToDate(false),
    () => convertToTimestamp(false)
  );

  if (getCurrentInstance()) {
    onMounted(initialize);
  } else if (hasClipboardSupport) {
    canPaste.value = true;
  }

  // --- Watchers & Lifecycle ---
  // Re-run conversions when settings change without recording history
  watch([useMilliseconds, timestampMode, utcOffset], (newVals, oldVals) => {
    const [, nextMode] = newVals as [boolean, TimestampMode, number];
    const [, previousMode] = oldVals as [boolean, TimestampMode, number];

    syncTimestampInputOnSettingsChange(timestampInput, nextMode, previousMode);

    convertToDate(false);
    convertToTimestamp(false);
  });

  watch(timestampInput, () => {
    sanitizeTimestampInput(timestampInput);
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
