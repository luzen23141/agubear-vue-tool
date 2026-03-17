import { ref } from 'vue';

export type Theme = 'light' | 'dark' | 'high-contrast' | 'system';

type ResolvedTheme = Exclude<Theme, 'system'>;

const STORAGE_KEY = 'agubear-theme';
const theme = ref<Theme>('system');
const THEME_COLOR_MAP: Record<ResolvedTheme, string> = {
  light: '#f3f7fb',
  dark: '#020817',
  'high-contrast': '#000000'
};

let mediaListenerRegistered = false;

const isClient = () => globalThis.window !== undefined;
const getThemeMedia = () =>
  isClient() && globalThis.window.matchMedia
    ? globalThis.window.matchMedia('(prefers-color-scheme: dark)')
    : null;

const getSystemTheme = (): ResolvedTheme => {
  const media = getThemeMedia();
  if (!media) return 'light';
  return media.matches ? 'dark' : 'light';
};

const resolveTheme = (value: Theme): ResolvedTheme => {
  if (value === 'system') return getSystemTheme();
  return value;
};

const syncThemeColor = (resolvedTheme: ResolvedTheme) => {
  if (!isClient()) return;

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', THEME_COLOR_MAP[resolvedTheme]); // eslint-disable-line security/detect-object-injection
  }
};

const applyTheme = (nextTheme: Theme = theme.value) => {
  if (!isClient()) return;

  const resolved = resolveTheme(nextTheme);
  const root = document.documentElement;

  root.dataset.theme = resolved;
  root.classList.toggle('dark', resolved === 'dark');
  root.style.colorScheme = resolved === 'light' ? 'light' : 'dark';
  syncThemeColor(resolved);
};

const persistTheme = (value: Theme) => {
  if (!isClient() || !globalThis.localStorage) return;
  globalThis.localStorage.setItem(STORAGE_KEY, value);
};

const applySystemThemeIfNeeded = () => {
  if (theme.value === 'system') {
    applyTheme('system');
  }
};

const ensureSystemThemeListener = () => {
  const media = getThemeMedia();
  if (!media || mediaListenerRegistered) return;

  media.addEventListener('change', applySystemThemeIfNeeded);
  mediaListenerRegistered = true;
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

  ensureSystemThemeListener();
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

export function UseTheme() {
  return {
    theme,
    initTheme,
    setTheme,
    toggleTheme,
    applyTheme,
    resolveTheme
  };
}
