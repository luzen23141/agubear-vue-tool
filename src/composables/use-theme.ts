import { ref } from 'vue';

export type Theme = 'light' | 'dark' | 'high-contrast' | 'system';

type ResolvedTheme = Exclude<Theme, 'system'>;

const STORAGE_KEY = 'agubear-theme';
const theme = ref<Theme>('system');

const isClient = () => globalThis.window !== undefined;

const getSystemTheme = (): ResolvedTheme => {
  if (!isClient() || !globalThis.window.matchMedia) return 'light';
  return globalThis.window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const resolveTheme = (value: Theme): ResolvedTheme => {
  if (value === 'system') return getSystemTheme();
  return value;
};

const applyTheme = (nextTheme: Theme = theme.value) => {
  if (!isClient()) return;

  const resolved = resolveTheme(nextTheme);
  const root = document.documentElement;

  root.dataset.theme = resolved;
  root.classList.toggle('dark', resolved === 'dark');
};

const persistTheme = (value: Theme) => {
  if (!isClient() || !globalThis.localStorage) return;
  globalThis.localStorage.setItem(STORAGE_KEY, value);
};

const initTheme = () => {
  if (!isClient()) return;

  const storedTheme = globalThis.localStorage?.getItem(STORAGE_KEY) as Theme | null;
  theme.value =
    storedTheme === 'light' ||
    storedTheme === 'dark' ||
    storedTheme === 'high-contrast' ||
    storedTheme === 'system'
      ? storedTheme
      : 'system';

  applyTheme(theme.value);
};

const setTheme = (nextTheme: Theme) => {
  theme.value = nextTheme;
  persistTheme(nextTheme);
  applyTheme(nextTheme);
};

const toggleTheme = () => {
  const resolved = resolveTheme(theme.value);
  setTheme(resolved === 'dark' ? 'light' : 'dark');
};

const applySystemThemeIfNeeded = () => {
  if (theme.value === 'system') {
    applyTheme('system');
  }
};

if (isClient() && globalThis.window.matchMedia) {
  globalThis.window
    .matchMedia('(prefers-color-scheme: dark)')
    .addEventListener('change', applySystemThemeIfNeeded);
}

export function UseTheme() {
  return {
    theme,
    initTheme,
    setTheme,
    toggleTheme,
    applyTheme
  };
}
