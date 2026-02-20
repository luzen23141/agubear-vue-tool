import { ref, watch, onMounted, type Ref } from 'vue';

export function UseLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  const value = ref<T>(initialValue) as Ref<T>;

  const readValue = (): T | null => {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) {
      return null;
    }
    try {
      const item = globalThis.localStorage.getItem(key);
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

  const writeValue = (value_: T) => {
    const isClient = globalThis?.localStorage !== undefined;
    if (!isClient) {
      return;
    }
    try {
      if (value_ === undefined || value_ === null) {
        globalThis.localStorage.removeItem(key);
      } else {
        globalThis.window.localStorage.setItem(key, JSON.stringify(value_));
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
