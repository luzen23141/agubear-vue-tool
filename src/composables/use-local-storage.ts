import { ref, watch, onMounted, getCurrentInstance, type Ref } from 'vue';

function getStorage() {
  if (typeof window !== 'undefined') {
    return window.localStorage;
  }

  return globalThis.localStorage;
}

function parseStoredValue<T>(item: string) {
  try {
    return JSON.parse(item) as T;
  } catch {
    return item as unknown as T;
  }
}

function readStoredValue<T>(key: string): T | null {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const item = storage.getItem(key);
    if (item === null) return null;
    return parseStoredValue<T>(item);
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return null;
  }
}

function writeStoredValue<T>(key: string, value: T) {
  const storage = getStorage();
  if (!storage) {
    return;
  }

  try {
    if (value !== undefined && value !== null) {
      storage.setItem(key, JSON.stringify(value));
      return;
    }

    storage.removeItem(key);
  } catch (error) {
    console.warn(`Error writing localStorage key "${key}":`, error);
  }
}

function syncStoredValue<T>(key: string, value: Ref<T>) {
  const stored = readStoredValue<T>(key);
  if (stored !== null) {
    value.value = stored;
  }
}

export function UseLocalStorage<T>(key: string, initialValue: T): Ref<T> {
  const value = ref<T>(initialValue) as Ref<T>;

  if (getCurrentInstance()) {
    onMounted(() => {
      syncStoredValue(key, value);
    });
  } else {
    syncStoredValue(key, value);
  }

  watch(
    value,
    (newValue) => {
      writeStoredValue(key, newValue);
    },
    { deep: true }
  );

  return value;
}
