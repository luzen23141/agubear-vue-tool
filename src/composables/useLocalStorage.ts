import { ref, watch, onMounted, type Ref } from 'vue';

export function useLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  const value = ref<T>(initialValue) as Ref<T>;

  const readValue = (): T | null => {
    if (typeof window === 'undefined') {
      return null;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return null;
      // Handle the case where the value might be a raw string instead of a valid JSON
      try {
        return JSON.parse(item) as T;
      } catch {
        // Fallback: If JSON.parse fails, return the string itself if T could be string
        // But for safety, let's treat it as possibly valid if we expect a string
        return item as unknown as T;
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return null;
    }
  };

  const writeValue = (val: T) => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      if (val === undefined || val === null) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(val));
      }
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  };

  onMounted(() => {
    const stored = readValue();
    if (stored !== null) {
      value.value = stored;
    }
  });

  watch(
    value,
    (newValue) => {
      writeValue(newValue);
    },
    { deep: true }
  );

  return value;
}
