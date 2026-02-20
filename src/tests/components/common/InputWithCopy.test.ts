import { render, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import InputWithCopy from '@/components/common/InputWithCopy.vue';

// Mock I18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}));

describe('InputWithCopy.vue', () => {
  const mockWriteText = vi.fn();
  const mockReadText = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: mockWriteText,
        readText: mockReadText
      },
      userAgent: 'node' // minimal mock
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders label and textarea with correct props', () => {
    const { getByLabelText, getByPlaceholderText } = render(InputWithCopy, {
      props: {
        id: 'test-input',
        modelValue: 'initial value',
        label: 'Test Label',
        placeholder: 'Test Placeholder'
      }
    });

    const textarea = getByLabelText('Test Label') as HTMLTextAreaElement;
    expect(textarea.value).toBe('initial value');
    expect(getByPlaceholderText('Test Placeholder')).toBeTruthy();
  });

  it('emits update:modelValue on input', async () => {
    const { getByLabelText, emitted } = render(InputWithCopy, {
      props: {
        id: 'test-input',
        modelValue: '',
        label: 'Test Label'
      }
    });

    const textarea = getByLabelText('Test Label');
    await fireEvent.update(textarea, 'new value');

    expect(emitted()['update:modelValue']).toBeTruthy();
    expect(emitted()['update:modelValue']?.[0]).toEqual(['new value']);
  });

  it('handles paste functionality', async () => {
    mockReadText.mockResolvedValue('pasted content');

    const { findByText, emitted } = render(InputWithCopy, {
      props: {
        id: 'test-input',
        modelValue: '',
        label: 'Test Label',
        allowPaste: true
      }
    });

    const pasteButton = await findByText(/common\.paste/);
    await fireEvent.click(pasteButton);

    expect(mockReadText).toHaveBeenCalled();
    // Wait for async paste
    await new Promise(process.nextTick);

    expect(emitted()['update:modelValue']).toBeTruthy();
    expect(emitted()['update:modelValue']?.[0]).toEqual(['pasted content']);
    expect(emitted().paste).toBeTruthy();
    expect(emitted().paste?.[0]).toEqual(['pasted content']);
  });

  it('handles copy functionality', async () => {
    const { getByText, emitted } = render(InputWithCopy, {
      props: {
        id: 'test-input',
        modelValue: 'content to copy',
        label: 'Test Label',
        allowCopy: true
      }
    });

    const copyButton = getByText(/common\.copy/);
    await fireEvent.click(copyButton);

    expect(mockWriteText).toHaveBeenCalledWith('content to copy');
    expect(emitted().copy).toBeTruthy();
    expect(emitted().copy?.[0]).toEqual(['content to copy']);
  });

  it('does not show paste button if allowPaste is false', () => {
    const { queryByText } = render(InputWithCopy, {
      props: {
        id: 'test-input',
        modelValue: '',
        allowPaste: false
      }
    });

    expect(queryByText(/common\.paste/)).toBeNull();
  });

  it('does not show copy button if content is empty', () => {
    const { queryByText } = render(InputWithCopy, {
      props: {
        id: 'test-input',
        modelValue: '',
        allowCopy: true
      }
    });

    expect(queryByText(/common\.copy/)).toBeNull();
  });
});
