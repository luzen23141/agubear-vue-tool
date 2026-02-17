import { ref, watch, onMounted } from 'vue';

type Theme = 'light' | 'dark' | 'auto';

// eslint-disable-next-line max-lines-per-function
export function useTheme() {
  const theme = ref<Theme>('auto');

  // Load saved theme
  const loadTheme = () => {
    if (globalThis.window === undefined) return;
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved && ['light', 'dark', 'auto'].includes(saved)) {
      theme.value = saved;
    }
  };

  // Apply theme to document
  const applyTheme = () => {
    if (globalThis.window === undefined) return;

    const root = document.documentElement;
    const isDark =
      theme.value === 'dark' ||
      (theme.value === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Persist preference
    if (theme.value === 'auto') {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', theme.value);
    }
  };

  // Watch for changes
  watch(theme, applyTheme);

  // Listen to system changes if in auto mode
  onMounted(() => {
    loadTheme();
    applyTheme();

    if (globalThis.window !== undefined) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (theme.value === 'auto') {
          applyTheme();
        }
      });
    }
  });

  const toggleTheme = () => {
    const modes: Theme[] = ['auto', 'light', 'dark'];
    const nextIndex = (modes.indexOf(theme.value) + 1) % modes.length;
    // eslint-disable-next-line security/detect-object-injection
    const nextTheme = modes[nextIndex];
    if (nextTheme) {
      theme.value = nextTheme;
    }
  };

  return {
    theme,
    toggleTheme,
    applyTheme
  };
}
