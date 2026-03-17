import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { nextTick, ref } from 'vue';
import { flushPromises } from '@vue/test-utils';
import { UseQrCode } from '../../composables/use-qr-code';

// Mock qrcode module
vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue()
  }
}));

describe('UseQrCode', () => {
  let canvasReference: any;
  let addToHistory: any;

  beforeEach(() => {
    canvasReference = ref(document.createElement('canvas'));
    addToHistory = vi.fn();
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.stubGlobal('navigator', {
      clipboard: {
        readText: vi.fn().mockResolvedValue('pasted qr text')
      }
    });
  });

  afterEach(async () => {
    await flushPromises();
    await nextTick();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('should initialize with default values', () => {
    const { mode, inputText, hasQrCode } = UseQrCode(canvasReference, addToHistory);
    expect(mode.value).toBe('text');
    expect(inputText.value).toBe('');
    expect(hasQrCode.value).toBe(false);
  });

  it('should update finalQrText based on mode: text', () => {
    const { inputText, finalQrText } = UseQrCode(canvasReference, addToHistory);
    inputText.value = 'Hello World';
    expect(finalQrText.value).toBe('Hello World');
  });

  it('should update finalQrText based on mode: wifi', () => {
    const { mode, wifi, finalQrText } = UseQrCode(canvasReference, addToHistory);
    mode.value = 'wifi';
    wifi.value.ssid = 'Home';
    // eslint-disable-next-line sonarjs/no-hardcoded-passwords
    wifi.value.password = 'WIFI_PWD_TEST_ONLY';
    expect(finalQrText.value).toContain('WIFI:T:WPA;S:Home;P:WIFI_PWD_TEST_ONLY;H:false;;');
  });

  it('should update finalQrText based on mode: contact', () => {
    const { mode, contact, finalQrText } = UseQrCode(canvasReference, addToHistory);
    mode.value = 'contact';
    contact.value.name = 'Alex';
    expect(finalQrText.value).toContain('BEGIN:VCARD');
    expect(finalQrText.value).toContain('Alex');
  });

  it('should initialize canPaste from clipboard support', () => {
    const { canPaste } = UseQrCode(canvasReference, addToHistory);
    expect(canPaste.value).toBe(true);
  });

  it('should paste clipboard text into input', async () => {
    const { inputText, pasteInput } = UseQrCode(canvasReference, addToHistory);

    await pasteInput();

    expect(inputText.value).toBe('pasted qr text');
  });

  it('should keep input when clipboard paste fails', async () => {
    const { inputText, pasteInput } = UseQrCode(canvasReference, addToHistory);
    inputText.value = 'keep-me';

    vi.stubGlobal('navigator', {
      clipboard: {
        readText: vi.fn().mockRejectedValue(new Error('paste fail'))
      }
    });

    await pasteInput();

    expect(inputText.value).toBe('keep-me');
  });

  it('should record to history', () => {
    const { inputText, hasQrCode, recordToHistory } = UseQrCode(canvasReference, addToHistory);
    inputText.value = 'history test';
    hasQrCode.value = true; // Manually set to true since we're mocking the generation
    recordToHistory();
    expect(addToHistory).toHaveBeenCalledWith(
      'qrcode',
      'history test',
      expect.any(String),
      expect.any(Object)
    );
  });
});
