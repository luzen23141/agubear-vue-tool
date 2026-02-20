import { defineStore } from 'pinia';
import { ref, watch } from 'vue';

export const useAppStore = defineStore('app', () => {
  const favorites = ref<string[]>([]);
  const selectedCategory = ref('all');
  const showFavoritesOnly = ref(false);

  // Persistence
  const loadPreferences = () => {
    if (typeof window === 'undefined') return;
    try {
      const storedFavs = localStorage.getItem('agubear-favorites');
      if (storedFavs) favorites.value = JSON.parse(storedFavs);

      const storedCat = localStorage.getItem('agubear-category');
      if (storedCat) selectedCategory.value = storedCat;

      const storedShowFav = localStorage.getItem('agubear-show-fav-only');
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
      localStorage.setItem('agubear-favorites', JSON.stringify(newValue));
    },
    { deep: true }
  );

  watch(selectedCategory, (newValue) => {
    localStorage.setItem('agubear-category', newValue);
  });

  watch(showFavoritesOnly, (newValue) => {
    localStorage.setItem('agubear-show-fav-only', String(newValue));
  });

  return {
    favorites,
    selectedCategory,
    showFavoritesOnly,
    toggleFavorite,
    loadPreferences
  };
});
