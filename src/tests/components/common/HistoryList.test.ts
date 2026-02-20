import { render, fireEvent } from '@testing-library/vue';
import { describe, it, expect, vi } from 'vitest';
import HistoryList from '@/components/common/HistoryList.vue';

// Mock I18n
vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key
  })
}));

describe('HistoryList.vue', () => {
  const mockHistory = [
    { id: 1, timestamp: '2023-01-01', input: 'Input 1', output: 'Output 1' },
    { id: 2, timestamp: '2023-01-02', input: 'Input 2', output: 'Output 2' }
  ];

  it('renders nothing when history is empty', () => {
    const { queryByText } = render(HistoryList, {
      props: {
        history: []
      }
    });

    expect(queryByText('common.history')).toBeNull();
  });

  it('renders history items when provided', () => {
    const { getByText } = render(HistoryList, {
      props: {
        history: mockHistory
      }
    });

    expect(getByText('common.history')).toBeTruthy();
    expect(getByText('Input 1')).toBeTruthy();
    expect(getByText('Output 1')).toBeTruthy();
    expect(getByText('Input 2')).toBeTruthy();
    expect(getByText('Output 2')).toBeTruthy();
  });

  it('emits clear event when clear button clicked', async () => {
    const { getByText, emitted } = render(HistoryList, {
      props: {
        history: mockHistory
      }
    });

    const clearButton = getByText('common.clear');
    await fireEvent.click(clearButton);

    expect(emitted().clear).toBeTruthy();
  });

  it('emits remove event when delete button clicked', async () => {
    const { getAllByLabelText, emitted } = render(HistoryList, {
      props: {
        history: mockHistory
      }
    });

    const deleteBtns = getAllByLabelText('timestamp.deleteAria');
    if (deleteBtns[0]) {
      await fireEvent.click(deleteBtns[0]);
    }

    expect(emitted().remove).toBeTruthy();
    expect(emitted().remove?.[0]).toEqual([1]);
  });
});
