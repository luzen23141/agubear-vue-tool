import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { useCopyToClipboard } from '../../composables/use-copy-to-clipboard';
import { TOAST_KEY, type ToastFunction } from '../../composables/use-toast-key';

let copiedText = 'Copied!';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => (key === 'common.copied' ? copiedText : key)
  })
}));

function withSetup(showToast: ToastFunction) {
  let copyText!: (text: string | number) => Promise<void>;

  const Comp = defineComponent({
    setup() {
      ({ copyText } = useCopyToClipboard());
      return {};
    },
    template: '<div />'
  });

  const wrapper = mount(Comp, {
    global: {
      provide: {
        [TOAST_KEY as symbol]: showToast
      }
    }
  });

  return { copyText, wrapper };
}

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    copiedText = 'Copied!';
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockImplementation(async () => {})
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('returns early when text is empty', async () => {
    const showToast = vi.fn();
    const { copyText } = withSetup(showToast);

    await copyText('');

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('returns early when text is 0', async () => {
    const showToast = vi.fn();
    const { copyText } = withSetup(showToast);

    await copyText(0);

    expect(navigator.clipboard.writeText).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('copies text and shows success toast', async () => {
    const showToast = vi.fn();
    const { copyText } = withSetup(showToast);

    await copyText('hello');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
    expect(showToast).toHaveBeenCalledWith('Copied!', 'success');
  });

  it('falls back to default copied message when i18n returns empty string', async () => {
    copiedText = '';
    const showToast = vi.fn();
    const { copyText } = withSetup(showToast);

    await copyText('hello');

    expect(showToast).toHaveBeenCalledWith('Copied!', 'success');
  });

  it('shows error toast when clipboard write fails', async () => {
    const showToast = vi.fn();
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: vi.fn().mockRejectedValue(new Error('boom'))
      }
    });

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { copyText } = withSetup(showToast);

    await copyText('hello');

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
    expect(showToast).toHaveBeenCalledWith('Failed to copy', 'error');
    expect(warnSpy).toHaveBeenCalled();
  });
});
