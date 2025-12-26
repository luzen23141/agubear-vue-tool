import { ref } from 'vue';
import { format } from 'date-fns';

export interface HistoryItem {
  id: number;
  type: string;
  input: string;
  output: string | number;
  extra?: Record<string, unknown> | string | null;
  timestamp: string;
}

export const useHistory = () => {
  const history = ref<HistoryItem[]>([]);

  const addToHistory = (
    type: string,
    input: string,
    output: string | number | undefined | null,
    extra: Record<string, unknown> | string | null = null
  ) => {
    const outputStr = String(output);
    if (
      !input ||
      output === undefined ||
      output === null ||
      output === '' ||
      outputStr.includes('無效')
    ) {
      return;
    }

    const newItem: HistoryItem = {
      id: Date.now(),
      type, // 'ts2date' | 'date2ts' | 'md5' | 'unicode' | 'pinyin' | 'qrcode'
      input,
      output,
      extra, // 額外資資料，例如 QR Code 的圖片 DataURL
      timestamp: format(new Date(), 'HH:mm:ss')
    };

    // 加入開頭，限制 10 筆
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

  return { history, addToHistory, clearHistory, removeFromHistory };
};
