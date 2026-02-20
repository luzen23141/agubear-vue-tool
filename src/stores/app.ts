import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

// eslint-disable-next-line max-lines-per-function
export const useAppStore = defineStore('app', () => {
  const favorites = ref<string[]>([]);
  const selectedCategory = ref('all');
  const showFavoritesOnly = ref(false);

  // Persistence
  const loadPreferences = () => {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) return;
    try {
      const storedFavs = localStorage.getItem('agubear-favorites');
      if (storedFavs) {
        const parsed = JSON.parse(storedFavs);
        if (Array.isArray(parsed)) favorites.value = parsed;
      }

      const storedCat = globalThis.window.localStorage.getItem('agubear-category');
      if (storedCat) selectedCategory.value = storedCat;

      const storedShowFav = globalThis.window.localStorage.getItem('agubear-show-fav-only');
      if (storedShowFav) showFavoritesOnly.value = storedShowFav === 'true';
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const toggleFavorite = (toolId: string) => {
    const index = favorites.value.indexOf(toolId);
    if (index === -1) {
      favorites.value.push(toolId);
    } else {
      favorites.value.splice(index, 1);
    }
  };

  // Watchers for immediate persistence
  watch(
    favorites,
    (newValue) => {
      if (typeof globalThis === 'undefined' || !globalThis.localStorage) return;
      globalThis.localStorage.setItem('agubear-favorites', JSON.stringify(newValue));
    },
    { deep: true }
  );

  watch(selectedCategory, (newValue) => {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) return;
    globalThis.window.localStorage.setItem('agubear-category', newValue);
  });

  watch(showFavoritesOnly, (newValue) => {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) return;
    globalThis.localStorage.setItem('agubear-show-fav-only', String(newValue));
  });

  return {
    favorites,
    selectedCategory,
    showFavoritesOnly,
    toggleFavorite,
    loadPreferences
  };
});
