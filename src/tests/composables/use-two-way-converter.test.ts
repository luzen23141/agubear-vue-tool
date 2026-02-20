import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UseTwoWayConverter } from '@/composables/use-two-way-converter';
import { ref } from 'vue';
import { flushPromises } from '@vue/test-utils';

const mockAddToHistory = vi.fn();

vi.mock('@/composables/use-history', () => ({
  UseHistory: () => ({
    addToHistory: mockAddToHistory,
    history: ref([]),
    clearHistory: vi.fn(),
    removeFromHistory: vi.fn()
  })
}));

describe('use-two-way-converter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { mode, inputText, outputText } = UseTwoWayConverter(
      'test',
      (index) => index,
      (index) => index
    );
    expect(mode.value).toBe('encode');
    expect(inputText.value).toBe('');
    expect(outputText.value).toBe('');
  });

  it('encodes input correctly', async () => {
    const encode = vi.fn((index: string) => `encoded-${index}`);
    const decode = vi.fn((index: string) => index);
    const { inputText, outputText } = UseTwoWayConverter('test', encode, decode);

    inputText.value = 'abc';
    await flushPromises();
    expect(outputText.value).toBe('encoded-abc');
    expect(encode).toHaveBeenCalledWith('abc');
  });

  it('decodes input correctly when mode is decode', async () => {
    const encode = vi.fn((index: string) => index);
    const decode = vi.fn((index: string) => `decoded-${index}`);
    const { inputText, outputText, mode } = UseTwoWayConverter('test', encode, decode);

    mode.value = 'decode';
    inputText.value = 'abc';
    await flushPromises();
    expect(outputText.value).toBe('decoded-abc');
    expect(decode).toHaveBeenCalledWith('abc');
  });

  it('updates output when input changes', async () => {
    const encode = vi.fn((index: string) => `encoded-${index}`);
    const decode = vi.fn((index: string) => index);
    const { inputText, outputText } = UseTwoWayConverter('test', encode, decode);

    inputText.value = 'abc';
    await flushPromises();
    expect(outputText.value).toBe('encoded-abc');

    inputText.value = 'def';
    await flushPromises();
    expect(outputText.value).toBe('encoded-def');
  });

  it('swaps input and output when switching modes', async () => {
    const encode = (index: string) => `encoded-${index}`;
    const decode = (index: string) => index.replace('encoded-', '');
    const { inputText, outputText, mode } = UseTwoWayConverter('test', encode, decode);

    inputText.value = 'abc';
    // outputText is 'encoded-abc'
    await flushPromises();

    mode.value = 'decode';
    await flushPromises();

    expect(inputText.value).toBe('encoded-abc');
    expect(outputText.value).toBe('abc');
  });

  it('records history correctly', async () => {
    const { inputText, recordHistory } = UseTwoWayConverter(
      'test',
      (index) => `encoded-${index}`, // Changed to match expected output in assertion
      (index) => index
    );

    inputText.value = 'test-input';
    await flushPromises(); // Ensure outputText is updated before recording

    recordHistory();
    await flushPromises(); // Ensure history is added

    expect(mockAddToHistory).toHaveBeenCalledWith('test', 'test-input', 'encoded-test-input');
  });

  it('does not record history if output is empty', async () => {
    const { inputText, recordHistory } = UseTwoWayConverter(
      'test',
      (_) => '',
      (_) => ''
    );

    inputText.value = 'nothing';
    recordHistory();

    expect(mockAddToHistory).not.toHaveBeenCalled();
  });
});
