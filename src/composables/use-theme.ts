import { ref } from 'vue';

type Theme = 'light';

const applyTheme = () => {
  if (globalThis.window === undefined) return;
  document.documentElement.classList.remove('dark');
};

const toggleTheme = () => {};

export function UseTheme() {
  const theme = ref<Theme>('light');

  return {
    theme,
    toggleTheme,
    applyTheme
  };
}
