import { render, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import TwoWayConverter from '@/components/common/TwoWayConverter.vue';

// Mock I18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}));

// Mock composables if needed, or let them run if they are simple logic
// useTwoWayConverter is simple logic. useHistory uses localStorage which might need mocking or JSDOM handles it.
// mocking useHistory to avoid side effects
vi.mock('@/composables/useHistory', () => ({
  useHistory: () => ({
    history: [],
    addToHistory: vi.fn(),
    removeFromHistory: vi.fn(),
    clearHistory: vi.fn()
  })
}));

describe('TwoWayConverter.vue', () => {
  const defaultProps = {
    name: 'test-converter',
    title: 'Test Converter',
    inputLabel: 'Input',
    outputLabel: 'Output',
    inputPlaceholder: 'Enter text',
    outputPlaceholder: 'Result',
    mode: 'encode' as const,
    inputText: '',
    outputText: '',
    encodeValue: 'encode',
    decodeValue: 'decode',
    encodeLabel: 'Encode Checkbox',
    decodeLabel: 'Decode Checkbox',
    history: []
  };

  it('renders with correct title and labels', () => {
    const { getByText, getByPlaceholderText } = render(TwoWayConverter, {
      props: defaultProps
    });

    expect(getByText('Test Converter')).toBeTruthy();
    expect(getByText('Encode Checkbox')).toBeTruthy();
    expect(getByText('Decode Checkbox')).toBeTruthy();
    expect(getByText('Input')).toBeTruthy(); // input label
    expect(getByPlaceholderText('Enter text')).toBeTruthy();
  });

  it('switches mode when radio clicked', async () => {
    const { getByLabelText, emitted } = render(TwoWayConverter, {
      props: defaultProps
    });

    const decodeRadio = getByLabelText('Decode Checkbox');
    await fireEvent.click(decodeRadio);

    expect(emitted()['update:mode']).toBeTruthy();
    expect(emitted()['update:mode'][0]).toEqual(['decode']);
  });

  it('emits update:inputText on typing', async () => {
    const { getByLabelText, emitted } = render(TwoWayConverter, {
      props: defaultProps
    });

    const input = getByLabelText('Input');
    await fireEvent.update(input, 'new input');

    expect(emitted()['update:inputText']).toBeTruthy();
    expect(emitted()['update:inputText'][0]).toEqual(['new input']);
  });

  it('emits record event', async () => {
    const { getByText, emitted } = render(TwoWayConverter, {
      props: {
        ...defaultProps,
        inputText: 'something',
        outputText: 'result'
      }
    });

    const recordBtn = getByText('common.record');
    await fireEvent.click(recordBtn);

    expect(emitted().record).toBeTruthy();
  });
});
