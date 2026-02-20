import { defineStore } from 'pinia';
import { ref } from 'vue';
import { format } from 'date-fns';

let _historyIdCounter = 0;

export interface HistoryItem {
  id: number;
  type: string;
  input: string;
  output: string | number;
  extra?: Record<string, unknown> | string | null;
  timestamp: string;
  [key: string]: unknown;
}

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryItem[]>([]);

  const addToHistory = (
    type: string,
    input: string,
    output: string | number | undefined | null,
    extra: Record<string, unknown> | string | null = null
  ) => {
    const outputString = String(output);
    if (
      !input ||
      output === undefined ||
      output === null ||
      output === '' ||
      outputString.startsWith('INVALID_')
    ) {
      return;
    }

    _historyIdCounter += 1;
    const newItem: HistoryItem = {
      id: _historyIdCounter,
      type,
      input,
      output,
      extra,
      timestamp: format(new Date(), 'HH:mm:ss')
    };

    history.value.unshift(newItem);
    if (history.value.length > 10) {
      history.value.pop();
    }
  };

  const clearHistory = () => {
    history.value = [];
  };

  const removeFromHistory = (id: number) => {
    const index = history.value.findIndex((item) => item.id === id);
    if (index !== -1) {
      history.value.splice(index, 1);
    }
  };

  // Helper to filter history by type if needed
  const getByType = (type: string) => history.value.filter((item) => item.type === type);

  return { history, addToHistory, clearHistory, removeFromHistory, getByType };
});
