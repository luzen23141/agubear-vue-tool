<template>
  <nav class="nav-section" :aria-label="t('app.ariaLabels.toolNavigation')">
    <!-- Filters Toolbar -->
    <div class="filters-bar">
      <!-- Category Dropdown -->
      <div class="filter-group">
        <select
          v-model="selectedCategory"
          :aria-label="t('app.ariaLabels.categorySelect')"
          class="category-select"
        >
          <option value="all">{{ t('app.categories.all') }}</option>
          <option value="conversion">{{ t('app.categories.conversion') }}</option>
          <option value="generators">{{ t('app.categories.generators') }}</option>
          <option value="formatters">{{ t('app.categories.formatters') }}</option>
        </select>
      </div>

      <!-- Favorites Toggle -->
      <div class="filter-group">
        <button
          :class="{ active: showFavoritesOnly }"
          :aria-label="t('app.ariaLabels.toggleFavorites')"
          :aria-pressed="showFavoritesOnly"
          type="button"
          class="filter-btn fav-toggle-btn"
          @click="showFavoritesOnly = !showFavoritesOnly"
        >
          <SvgIcon :name="showFavoritesOnly ? 'star' : 'star-off'" size="0.85rem" />
          <span>{{ t('app.favorites.showOnly') }}</span>
        </button>
      </div>
    </div>

    <!-- Tool Tabs -->
      <div class="tab-list-container">
        <div v-for="tool in filteredTools" :key="tool.id" class="tab-item-wrapper">
          <button
            :class="[{ active: activeTab === tool.id }]"
            :aria-label="tool.ariaLabel"
            :aria-current="activeTab === tool.id ? 'page' : undefined"
            type="button"
            class="tab-btn"
            @click="switchTab(tool)"
          >
            {{ tool.name }}
          </button>
          <button
            :class="{ starred: favorites.includes(tool.id) }"
            :aria-label="
              favorites.includes(tool.id) ? t('app.ariaLabels.unstar') : t('app.ariaLabels.star')
            "
            type="button"
            class="star-action-btn"
            @click.stop="toggleFavorite(tool.id)"
          >
            <SvgIcon :name="favorites.includes(tool.id) ? 'star' : 'star-off'" size="0.85rem" />
          </button>
        </div>

        <div v-if="filteredTools.length === 0" class="no-tools-msg">
          {{ t('app.favorites.empty') }}
        </div>
      </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/stores/app';
import SvgIcon from '@/components/icons/SvgIcon.vue';

interface ToolDefinition {
  id: string;
  nameKey: string;
  ariaKey: string;
  category: string;
}

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();
const appStore = useAppStore();

const { favorites, selectedCategory, showFavoritesOnly } = storeToRefs(appStore);

// Tool definitions
const toolDefs: ToolDefinition[] = [
  {
    id: 'timestamp',
    nameKey: 'app.tabs.timestamp',
    ariaKey: 'app.ariaLabels.timestamp',
    category: 'conversion'
  },
  { id: 'hash', nameKey: 'app.tabs.hash', ariaKey: 'app.ariaLabels.hash', category: 'generators' },
  {
    id: 'base64',
    nameKey: 'app.tabs.base64',
    ariaKey: 'app.ariaLabels.base64',
    category: 'conversion'
  },
  { id: 'url', nameKey: 'app.tabs.url', ariaKey: 'app.ariaLabels.url', category: 'conversion' },
  {
    id: 'unicode',
    nameKey: 'app.tabs.unicode',
    ariaKey: 'app.ariaLabels.unicode',
    category: 'conversion'
  },
  {
    id: 'pinyin',
    nameKey: 'app.tabs.pinyin',
    ariaKey: 'app.ariaLabels.pinyin',
    category: 'conversion'
  },
  {
    id: 'qrcode',
    nameKey: 'app.tabs.qrcode',
    ariaKey: 'app.ariaLabels.qrcode',
    category: 'generators'
  },
  { id: 'json', nameKey: 'app.tabs.json', ariaKey: 'app.ariaLabels.json', category: 'formatters' },
  { id: 'jwt', nameKey: 'app.tabs.jwt', ariaKey: 'app.ariaLabels.json', category: 'formatters' },
  { id: 'uuid', nameKey: 'app.tabs.uuid', ariaKey: 'app.ariaLabels.uuid', category: 'generators' },
  {
    id: 'color',
    nameKey: 'app.tabs.color',
    ariaKey: 'app.ariaLabels.timestamp',
    category: 'conversion'
  },
  { id: 'diff', nameKey: 'app.tabs.diff', ariaKey: 'app.ariaLabels.json', category: 'generators' }
];

const tools = computed(() =>
  toolDefs.map((td) => ({
    ...td,
    name: t(td.nameKey),
    ariaLabel: t(td.ariaKey)
  }))
);

const activeTab = computed(() => (route.name as string) || 'timestamp');

const filteredTools = computed(() =>
  tools.value.filter((tool) => {
    if (selectedCategory.value !== 'all' && tool.category !== selectedCategory.value) return false;
    if (showFavoritesOnly.value && !favorites.value.includes(tool.id)) return false;
    return true;
  })
);

const switchTab = async (tool: ToolDefinition) => {
  await router.push({ name: tool.id, params: { lang: locale.value } });
};

const toggleFavorite = (toolId: string) => {
  appStore.toggleFavorite(toolId);
};

onMounted(() => {
  appStore.loadPreferences();
});
</script>

<style scoped>
.nav-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filters-bar {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
}

.category-select {
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--text-primary);
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  outline: none;
  transition: all var(--transition-normal);
}

.category-select:hover,
.category-select:focus {
  border-color: var(--primary);
  box-shadow: var(--shadow-focus);
}

.fav-toggle-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-normal);
}

.fav-toggle-btn:hover {
  background: rgba(251, 191, 36, 0.08);
  color: #f59e0b;
  border-color: rgba(251, 191, 36, 0.3);
}

.fav-toggle-btn.active {
  background: var(--gradient-accent);
  color: white;
  border-color: transparent;
  box-shadow: var(--shadow-glow);
}

.tab-nav {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 10px;
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  border-top: 1px solid var(--glass-border-shine);
  border-radius: var(--radius-xl);
  min-height: 52px;
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  box-shadow: var(--shadow-elevated);
  margin-bottom: 2rem;
  position: relative;
  z-index: 10;
}

.tab-list-container {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  width: 100%;
}

.tab-item-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.tab-btn {
  padding: 10px 24px;
  background: transparent;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: all var(--transition-normal);
  position: relative;
  border: 1px solid transparent;
}

.tab-btn:hover {
  background: var(--surface-hover);
  color: var(--primary);
  transform: translateY(-1px);
}

.tab-btn.active {
  background: var(--gradient-primary);
  color: white;
  font-weight: 700;
  box-shadow: var(--shadow-glow-strong);
  transform: scale(1.05);
  border-color: transparent;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 40%;
  height: 3px;
  background: var(--gradient-primary);
  border-radius: var(--radius-pill);
  box-shadow: var(--shadow-glow);
  animation: tabIndicatorPulse 2s ease-in-out infinite;
}

@keyframes tabIndicatorPulse {
  0%,
  100% {
    width: 40%;
    opacity: 0.8;
  }
  50% {
    width: 60%;
    opacity: 1;
  }
}

.star-action-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  line-height: 1;
  padding: 2px;
  border-radius: 50%;
  transition: all var(--transition-spring);
  opacity: 0.4;
  z-index: 2;
}

.star-action-btn:hover {
  transform: translateY(-50%) scale(1.3);
  opacity: 1;
  color: #fbbf24;
}

.star-action-btn.starred {
  color: #fbbf24;
  opacity: 1;
}

.tab-btn.active + .star-action-btn {
  color: rgba(255, 255, 255, 0.6);
}

.tab-btn.active + .star-action-btn:hover,
.tab-btn.active + .star-action-btn.starred {
  color: #fbbf24;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.no-tools-msg {
  width: 100%;
  text-align: center;
  padding: 1.5rem;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-style: italic;
}

@media (max-width: 768px) {
  .filters-bar {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
    scrollbar-width: none;
  }
  .filters-bar::-webkit-scrollbar {
    display: none;
  }

  .tab-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    margin: 0;
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    border: 1px solid var(--glass-border);
    border-bottom: none;
    background: var(--glass-bg);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.08);
    overflow-x: auto;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .tab-list-container {
    flex-wrap: nowrap;
    gap: 6px;
  }

  .tab-item-wrapper {
    flex-shrink: 0;
  }

  .tab-btn {
    padding: 8px 28px 8px 12px;
    font-size: 0.88rem;
    white-space: nowrap;
  }
}
</style>
