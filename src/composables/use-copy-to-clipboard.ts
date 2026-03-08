import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { type ToastFunction, TOAST_KEY } from './use-toast-key';

const CLIPBOARD_MESSAGES = {
  copied: 'Copied!',
  copyFailed: 'Failed to copy',
  pasteFailed: 'Failed to paste'
} as const;

function getDefaultClipboardMessage(key: keyof typeof CLIPBOARD_MESSAGES) {
  switch (key) {
    case 'copied': {
      return CLIPBOARD_MESSAGES.copied;
    }
    case 'copyFailed': {
      return CLIPBOARD_MESSAGES.copyFailed;
    }
    case 'pasteFailed': {
      return CLIPBOARD_MESSAGES.pasteFailed;
    }
  }
}

function resolveClipboardMessage(
  translate: (_key: string) => string,
  key: keyof typeof CLIPBOARD_MESSAGES
) {
  const translatedMessage = translate(`common.${key}`);
  return translatedMessage && translatedMessage !== `common.${key}`
    ? translatedMessage
    : getDefaultClipboardMessage(key);
}

export function canUseClipboardRead() {
  return typeof navigator !== 'undefined' && typeof navigator.clipboard?.readText === 'function';
}

export async function readClipboardText(options: { trim?: boolean } = {}) {
  try {
    const text = await navigator.clipboard.readText();
    return options.trim ? text.trim() : text;
  } catch {
    return '';
  }
}

/**
 * Composable for clipboard operations with toast feedback.
 */
export function useCopyToClipboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showToast = inject<ToastFunction>(TOAST_KEY, (_message: string, _type: string) => {});
  const { t } = useI18n();

  const copyText = async (text: string | number) => {
    if (text === '') return false;
    try {
      await navigator.clipboard.writeText(String(text));
      showToast(resolveClipboardMessage(t, 'copied'), 'success');
      return true;
    } catch (error) {
      console.warn('Clipboard write failed:', error);
      showToast(resolveClipboardMessage(t, 'copyFailed'), 'error');
      return false;
    }
  };

  const pasteText = async () => {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.warn('Clipboard read failed:', error);
      showToast(resolveClipboardMessage(t, 'pasteFailed'), 'error');
      return '';
    }
  };

  return {
    copyText,
    pasteText,
    canPaste: canUseClipboardRead()
  };
}
