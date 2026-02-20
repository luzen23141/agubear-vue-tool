import { storeToRefs } from 'pinia';
import { useHistoryStore } from '@/stores/history';

export const UseHistory = () => {
  const store = useHistoryStore();
  const { history } = storeToRefs(store);

  return {
    history,
    addToHistory: store.addToHistory,
    clearHistory: store.clearHistory,
    removeFromHistory: store.removeFromHistory
  };
};
