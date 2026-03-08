import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { type ToastFunction, TOAST_KEY } from './use-toast-key';

const CLIPBOARD_SUCCESS_FALLBACK = 'Copied!';
const CLIPBOARD_COPY_ERROR = 'Failed to copy';
const CLIPBOARD_PASTE_ERROR = 'Failed to paste';

const resolveCopiedMessage = (translatedMessage: string) =>
  translatedMessage || CLIPBOARD_SUCCESS_FALLBACK;

/**
 * Composable for clipboard operations with toast feedback.
 */
export function useCopyToClipboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showToast = inject<ToastFunction>(TOAST_KEY, (_message: string, _type: string) => {});
  const { t } = useI18n();

  const copyText = async (text: string | number) => {
    if (!text) return false;
    try {
      await navigator.clipboard.writeText(String(text));
      showToast(resolveCopiedMessage(t('common.copied')), 'success');
      return true;
    } catch (error) {
      console.warn('Clipboard write failed:', error);
      showToast(CLIPBOARD_COPY_ERROR, 'error');
      return false;
    }
  };

  const pasteText = async () => {
    try {
      return await navigator.clipboard.readText();
    } catch (error) {
      console.warn('Clipboard read failed:', error);
      showToast(CLIPBOARD_PASTE_ERROR, 'error');
      return '';
    }
  };

  const hasClipboardReadSupport =
    typeof navigator !== 'undefined' && typeof navigator.clipboard?.readText === 'function';

  return {
    copyText,
    pasteText,
    canPaste: hasClipboardReadSupport
  };
}
