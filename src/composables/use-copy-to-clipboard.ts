import { inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { type ToastFunction, TOAST_KEY } from './use-toast-key';

/**
 * Composable for clipboard operations with toast feedback.
 */
export function useCopyToClipboard() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const showToast = inject<ToastFunction>(TOAST_KEY, (_message: string, _type: string) => {});
  const { t } = useI18n();

  const copyText = async (text: string | number) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      showToast(t('common.copied') || 'Copied!', 'success');
    } catch (error) {
      console.warn('Clipboard write failed:', error);
      showToast('Failed to copy', 'error');
    }
  };

  return { copyText };
}
