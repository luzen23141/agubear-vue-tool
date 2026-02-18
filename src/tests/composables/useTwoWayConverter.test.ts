import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTwoWayConverter } from '@/composables/useTwoWayConverter';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';

const mockAddToHistory = vi.fn();

vi.mock('@/composables/useHistory', () => ({
  useHistory: () => ({
    addToHistory: mockAddToHistory,
    history: ref([]),
    clearHistory: vi.fn(),
    removeFromHistory: vi.fn()
  })
}));

describe('useTwoWayConverter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { mode, inputText, outputText } = useTwoWayConverter(
      'test',
      (i) => i,
      (i) => i
    );
    expect(mode.value).toBe('encode');
    expect(inputText.value).toBe('');
    expect(outputText.value).toBe('');
  });

  it('encodes input correctly', async () => {
    const encode = vi.fn((i: string) => `encoded-${i}`);
    const decode = vi.fn((i: string) => i);
    const { inputText, outputText } = useTwoWayConverter('test', encode, decode);

    inputText.value = 'abc';
    await flushPromises();
    expect(outputText.value).toBe('encoded-abc');
    expect(encode).toHaveBeenCalledWith('abc');
  });

  it('decodes input correctly when mode is decode', async () => {
    const encode = vi.fn((i: string) => i);
    const decode = vi.fn((i: string) => `decoded-${i}`);
    const { inputText, outputText, mode } = useTwoWayConverter('test', encode, decode);

    mode.value = 'decode';
    inputText.value = 'abc';
    await flushPromises();
    expect(outputText.value).toBe('decoded-abc');
    expect(decode).toHaveBeenCalledWith('abc');
  });

  it('updates output when input changes', async () => {
    const encode = vi.fn((i: string) => `encoded-${i}`);
    const decode = vi.fn((i: string) => i);
    const { inputText, outputText } = useTwoWayConverter('test', encode, decode);

    inputText.value = 'abc';
    await flushPromises();
    expect(outputText.value).toBe('encoded-abc');

    inputText.value = 'def';
    await flushPromises();
    expect(outputText.value).toBe('encoded-def');
  });

  it('swaps input and output when switching modes', async () => {
    const encode = (i: string) => `encoded-${i}`;
    const decode = (i: string) => i.replace('encoded-', '');
    const { inputText, outputText, mode } = useTwoWayConverter('test', encode, decode);

    inputText.value = 'abc';
    // outputText is 'encoded-abc'
    await flushPromises();

    mode.value = 'decode';
    await flushPromises();

    expect(inputText.value).toBe('encoded-abc');
    expect(outputText.value).toBe('abc');
  });

  it('records history correctly', async () => {
    const { inputText, recordHistory } = useTwoWayConverter(
      'test',
      (i) => `encoded-${i}`, // Changed to match expected output in assertion
      (i) => i
    );

    inputText.value = 'test-input';
    await flushPromises(); // Ensure outputText is updated before recording

    recordHistory();
    await flushPromises(); // Ensure history is added

    expect(mockAddToHistory).toHaveBeenCalledWith('test', 'test-input', 'encoded-test-input');
  });

  it('does not record history if output is empty', async () => {
    const { inputText, recordHistory } = useTwoWayConverter(
      'test',
      (_) => '',
      (_) => ''
    );

    inputText.value = 'nothing';
    recordHistory();

    expect(mockAddToHistory).not.toHaveBeenCalled();
  });
});
