<template>
  <div class="app-container" @click="closeLangMenu">
    <!-- App Header -->
    <header class="app-header">
      <h1 class="app-title">🐻 AguBear Tools</h1>
      <div class="header-actions">
        <button
          :title="t('app.theme_' + theme)"
          :aria-label="t('app.theme_' + theme)"
          type="button"
          class="theme-toggle"
          @click="toggleTheme"
        >
          <span v-if="theme === 'light'">☀️</span>
          <span v-else-if="theme === 'dark'">🌙</span>
          <span v-else>🖥️</span>
        </button>

        <div class="lang-switcher" @click.stop>
          <button
            :aria-label="t('app.ariaLabels.languageSwitch')"
            type="button"
            class="lang-btn"
            @click="showLangMenu = !showLangMenu"
          >
            <span class="lang-flag">{{ currentLocale.icon }}</span>
            <span class="lang-name">{{ currentLocale.name }}</span>
            <span :class="{ open: showLangMenu }" class="lang-arrow">▾</span>
          </button>
          <Transition name="lang-menu">
            <div v-if="showLangMenu" class="lang-dropdown">
              <button
                v-for="loc in SUPPORTED_LOCALES"
                :key="loc.code"
                :class="[{ active: locale === loc.code }]"
                :aria-pressed="locale === loc.code"
                type="button"
                class="lang-option"
                @click="changeLocale(loc.code)"
              >
                <span class="lang-option-flag">{{ loc.icon }}</span>
                <span>{{ loc.name }}</span>
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- Tab Navigation & Filters -->
    <section class="nav-section">
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
            <span class="star-icon">{{ showFavoritesOnly ? '★' : '☆' }}</span>
            <span>{{ t('app.favorites.showOnly') }}</span>
          </button>
        </div>
      </div>

      <!-- Tool Tabs -->
      <nav :aria-label="t('app.ariaLabels.toolSwitch')" class="tab-nav">
        <div class="tab-list-container" role="tablist">
          <div v-for="tool in filteredTools" :key="tool.id" class="tab-item-wrapper">
            <button
              :class="[{ active: activeTab === tool.id }]"
              :aria-label="tool.ariaLabel"
              :aria-selected="activeTab === tool.id"
              type="button"
              class="tab-btn"
              role="tab"
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
              {{ favorites.includes(tool.id) ? '★' : '☆' }}
            </button>
          </div>

          <div v-if="filteredTools.length === 0" class="no-tools-msg">
            {{ t('app.favorites.empty') }}
          </div>
        </div>
      </nav>
    </section>

    <!-- Tab Content -->
    <main class="tab-content tool-container">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" />
        </keep-alive>
      </router-view>
    </main>

    <footer class="app-footer">
      <p class="footer-copyright">
        {{ t('app.footer.copyright') }}
      </p>
    </footer>

    <Toast ref="toastRef" />
    <CommandPalette />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { useRouter, useRoute } from 'vue-router';
import { SUPPORTED_LOCALES, type LocaleInfo } from './i18n';
import { useTheme } from './composables/useTheme';

// Components are loaded via router, manual imports removed for performance.
import Toast from './components/common/Toast.vue'; // Import Toast container
import CommandPalette from './components/common/CommandPalette.vue'; // Import Command Palette

// Global Toast logic
const toastRef = ref<InstanceType<typeof Toast> | null>(null);

const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
  toastRef.value?.show(msg, type);
};

provide('showToast', showToast);

const { t, locale } = useI18n(); // Back to local useI18n (safe now with fresh instance)
const router = useRouter();
const route = useRoute();
const { theme, toggleTheme } = useTheme();

// Sync locale from route immediately (Fix for SSG)
watch(
  () => route.params.lang,
  (newLang) => {
    if (newLang && typeof newLang === 'string') {
      const supported = SUPPORTED_LOCALES.find((l) => l.code === newLang);
      if (supported && locale.value !== supported.code) {
        locale.value = supported.code;
      }
    }
  },
  { immediate: true }
);

// SEO and Meta configuration
useHead(
  computed(() => ({
    title: t('app.title'),
    htmlAttrs: {
      lang: locale.value
    },
    meta: [
      { name: 'description', content: t('seo.description') },
      { name: 'keywords', content: t('seo.keywords') },
      { property: 'og:title', content: t('seo.title') },
      { property: 'og:description', content: t('seo.ogDescription') },
      { property: 'og:type', content: 'website' }
    ],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: t('app.title'),
          description: t('seo.description'),
          inLanguage: locale.value
        })
      }
    ]
  }))
);
// Component definitions removed as they are handled by router now

interface ToolDef {
  id: string;
  nameKey: string;
  ariaKey: string;
  category: string;
}

// Tool definitions — names use i18n keys resolved in computed
// Tool definitions — names use i18n keys resolved in computed
const toolDefs: ToolDef[] = [
  {
    id: 'timestamp',
    nameKey: 'app.tabs.timestamp',
    ariaKey: 'app.ariaLabels.timestamp',
    category: 'conversion'
  },
  {
    id: 'hash',
    nameKey: 'app.tabs.hash',
    ariaKey: 'app.ariaLabels.hash',
    category: 'generators'
  },
  {
    id: 'base64',
    nameKey: 'app.tabs.base64',
    ariaKey: 'app.ariaLabels.base64',
    category: 'conversion'
  },
  {
    id: 'url',
    nameKey: 'app.tabs.url',
    ariaKey: 'app.ariaLabels.url',
    category: 'conversion'
  },
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
  {
    id: 'json',
    nameKey: 'app.tabs.json',
    ariaKey: 'app.ariaLabels.json',
    category: 'formatters'
  },
  {
    id: 'jwt',
    nameKey: 'app.tabs.jwt',
    ariaKey: 'app.ariaLabels.json' /* reusing json aria or make new */,
    category: 'formatters'
  },
  {
    id: 'uuid',
    nameKey: 'app.tabs.uuid',
    ariaKey: 'app.ariaLabels.uuid',
    category: 'generators'
  },
  {
    id: 'color',
    nameKey: 'app.tabs.color',
    ariaKey: 'app.ariaLabels.timestamp' /* reusing timestamp aria or make new */,
    category: 'conversion'
  },
  {
    id: 'diff',
    nameKey: 'app.tabs.diff',
    ariaKey: 'app.ariaLabels.json',
    category: 'generators'
  }
];

// Computed tools with translated names
const tools = computed(() =>
  toolDefs.map((td) => ({
    ...td,
    name: t(td.nameKey),
    ariaLabel: t(td.ariaKey)
  }))
);

// --- Favorites System ---
const favorites = ref<string[]>([]);

// Initialize favorites from localStorage
// Favorites loading moved to loadPreferences

const toggleFavorite = (toolId: string) => {
  const index = favorites.value.indexOf(toolId);
  if (index === -1) {
    favorites.value.push(toolId);
  } else {
    favorites.value.splice(index, 1);
  }
  if (globalThis.window !== undefined && globalThis.localStorage) {
    globalThis.localStorage.setItem('agubear-favorites', JSON.stringify(favorites.value));
  }
};

// --- Category & Filtering ---
const selectedCategory = ref('all');
const showFavoritesOnly = ref(false);

const filteredTools = computed(() =>
  tools.value.filter((tool) => {
    // 1. Filter by category
    if (selectedCategory.value !== 'all' && tool.category !== selectedCategory.value) {
      return false;
    }
    // 2. Filter by favorites
    if (showFavoritesOnly.value && !favorites.value.includes(tool.id)) {
      return false;
    }
    return true;
  })
);

const activeTab = computed(() => (route.name as string) || 'timestamp');

const switchTab = async (tool: ToolDef) => {
  await router.push({ name: tool.id, params: { lang: locale.value } });
};

const loadPreferences = () => {
  if (globalThis.window === undefined || !globalThis.localStorage) return;

  // Load Favorites
  try {
    const storedFavs = globalThis.localStorage.getItem('agubear-favorites');
    if (storedFavs) {
      const parsed = JSON.parse(storedFavs);
      if (Array.isArray(parsed)) favorites.value = parsed;
    }
  } catch (e) {
    console.error('Failed to load favorites:', e);
  }

  // Load Category
  const storedCat = globalThis.localStorage.getItem('agubear-category');
  if (storedCat) selectedCategory.value = storedCat;

  // Load Show Favorites Only
  const storedShowFav = globalThis.localStorage.getItem('agubear-show-fav-only');
  if (storedShowFav) showFavoritesOnly.value = storedShowFav === 'true';
};

// Watchers for persistence
watch(selectedCategory, (newVal) => {
  if (globalThis.window !== undefined && globalThis.localStorage) {
    globalThis.localStorage.setItem('agubear-category', newVal);
  }
});

watch(showFavoritesOnly, (newVal) => {
  if (globalThis.window !== undefined && globalThis.localStorage) {
    globalThis.localStorage.setItem('agubear-show-fav-only', String(newVal));
  }
});

onMounted(() => {
  loadPreferences();
});

// ...

// Language switcher
const showLangMenu = ref(false);
const currentLocale = computed<LocaleInfo>(
  () =>
    (SUPPORTED_LOCALES.find((l) => l.code === locale.value) || SUPPORTED_LOCALES[0]) as LocaleInfo
);

const changeLocale = (code: string) => {
  router.push({
    name: route.name as string,
    params: { ...route.params, lang: code },
    query: route.query
  });
  showLangMenu.value = false;
};

// Locale persistence is now handled by the router guard in main.ts
// We do not need to watch locale to set localStorage or URL here.

// Close language menu on outside click
const closeLangMenu = () => {
  showLangMenu.value = false;
};
</script>

<style scoped>
.app-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 2rem calc(2rem + env(safe-area-inset-bottom));
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

.tool-container {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

/* ── Header ── */
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}

.app-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
  margin: 0;
  letter-spacing: -0.03em;
}

/* ── Language Switcher ── */
.lang-switcher {
  position: relative;
  z-index: 100;
}

.lang-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border: 1px solid var(--border);
  background: var(--primary-soft);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--primary);
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.lang-flag {
  font-size: 1.1rem;
  line-height: 1;
}

.lang-arrow {
  font-size: 0.7rem;
  transition: transform var(--transition-fast);
  opacity: 0.6;
}

.lang-arrow.open {
  transform: rotate(180deg);
}

.lang-btn:hover {
  background: var(--primary-glow);
  border-color: var(--primary);
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--surface-overlay);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 6px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  max-height: 360px;
  overflow-y: auto;
  min-width: 280px;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--text-secondary);
  text-align: left;
  transition: all var(--transition-fast);
  white-space: nowrap;
}

.lang-option-flag {
  font-size: 1.1rem;
  line-height: 1;
}

.lang-option:hover {
  background: var(--primary-soft);
  color: var(--primary);
}

.lang-option.active {
  background: var(--primary);
  color: white;
  font-weight: 600;
}

/* ── Language menu transition ── */
.lang-menu-enter-active,
.lang-menu-leave-active {
  transition:
    opacity var(--transition-fast),
    transform var(--transition-fast);
}
.lang-menu-enter-from,
.lang-menu-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

/* ── Filters & Navigation ── */
.nav-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.filters-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
}

.category-select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;
  transition: all var(--transition-fast);
}

.category-select:hover,
.category-select:focus {
  border-color: var(--primary);
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.filter-btn:hover {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: var(--primary);
}

.filter-btn.active {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.star-icon {
  font-size: 1.1em;
  line-height: 1;
}

/* ── Tab Navigation ── */
.tab-nav {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  padding: 8px;
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  min-height: 50px; /* Prevent collapse if empty */
}

.tab-list-container {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  width: 100%;
}

.tab-item-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.tab-btn {
  padding: 10px 32px 10px 18px; /* Extra padding right for star */
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: all var(--transition-normal);
  position: relative;
  border: 1px solid transparent; /* Prevent layout shift on active */
}

.tab-btn:hover {
  background: var(--primary-glow);
  color: var(--primary);
}

.tab-btn.active {
  background: var(--primary);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(45, 157, 106, 0.25);
}

/* Star Action on Tab */
.star-action-btn {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 2px;
  border-radius: 50%;
  transition: all var(--transition-fast);
  opacity: 0.5;
  z-index: 2;
}

.star-action-btn:hover {
  transform: translateY(-50%) scale(1.2);
  opacity: 1;
  color: #fbbf24;
}

.star-action-btn.starred {
  color: #fbbf24;
  opacity: 1;
}

/* Adjust star color when tab is active */
.tab-btn.active + .star-action-btn {
  color: rgba(255, 255, 255, 0.7);
}

.tab-btn.active + .star-action-btn:hover,
.tab-btn.active + .star-action-btn.starred {
  color: #fbbf24; /* Keep yellow even on active tab? Or white? Let's use Gold */
  text-shadow: 0 0 2px rgba(0, 0, 0, 0.2);
}

.no-tools-msg {
  width: 100%;
  text-align: center;
  padding: 1rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

/* ── Mobile Optimization (Thumb Zone) ── */
@media (max-width: 768px) {
  .app-container {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom)); /* Space for bottom nav */
  }

  .app-header {
    margin-bottom: 1rem;
  }

  /* Filters remain at top but compacted */
  .filters-bar {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px; /* Scrollbar space */
    scrollbar-width: none; /* Hide scrollbar Firefox */
  }
  .filters-bar::-webkit-scrollbar {
    display: none;
  }

  /* Move Tabs to Bottom */
  .tab-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    margin: 0;
    border-radius: 16px 16px 0 0;
    border: 1px solid var(--border);
    border-bottom: none;
    background: var(--surface-overlay);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    padding: 12px 12px calc(12px + env(safe-area-inset-bottom));
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.08);

    /* Horizontal Scroll */
    overflow-x: auto;
    flex-wrap: nowrap;
    justify-content: flex-start;
  }

  .tab-list-container {
    flex-wrap: nowrap;
    gap: 8px;
  }

  .tab-item-wrapper {
    flex-shrink: 0;
  }

  .tab-btn {
    padding: 8px 28px 8px 14px; /* Slightly smaller padding */
    font-size: 0.9rem;
    white-space: nowrap;
  }

  /* Stack tool content */
  .tool-container {
    width: 100%;
  }
}
</style>
```
