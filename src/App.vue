<template>
  <div class="app-container" @click="closeLangMenu">
    <!-- App Header -->
    <header class="app-header">
      <h1 class="app-title">
        <span class="title-icon"><SvgIcon name="bear" size="1.4rem" /></span> AguBear Tools
      </h1>
      <div class="header-actions">
        <button
          :title="t('app.theme_' + theme)"
          :aria-label="t('app.theme_' + theme)"
          type="button"
          class="theme-toggle"
          @click="toggleTheme"
        >
          <SvgIcon v-if="theme === 'light'" name="sun" />
          <SvgIcon v-else-if="theme === 'dark'" name="moon" />
          <SvgIcon v-else name="monitor" />
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
            <SvgIcon :name="showFavoritesOnly ? 'star' : 'star-off'" size="0.85rem" />
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
              <SvgIcon :name="favorites.includes(tool.id) ? 'star' : 'star-off'" size="0.85rem" />
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
      <div class="footer-divider" />
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
import Toast from './components/common/Toast.vue';
import CommandPalette from './components/common/CommandPalette.vue';
import SvgIcon from './components/icons/SvgIcon.vue';

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
// SEO and Meta configuration
useHead(
  computed(() => {
    const routeTitleKey = route.meta.title as string;
    const pageTitle = routeTitleKey ? t(routeTitleKey) : '';
    const appTitle = t('app.title');
    const fullTitle = pageTitle ? `${pageTitle} - ${appTitle}` : appTitle;

    return {
      title: fullTitle,
      htmlAttrs: {
        lang: locale.value
      },
      meta: [
        { name: 'description', content: t('seo.description') },
        { name: 'keywords', content: t('seo.keywords') },
        { property: 'og:title', content: fullTitle },
        { property: 'og:description', content: t('seo.ogDescription') },
        { property: 'og:type', content: 'website' }
      ],
      script: [
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: appTitle,
            description: t('seo.description'),
            inLanguage: locale.value
          })
        }
      ]
    };
  })
);
// Component definitions removed as they are handled by router now

interface ToolDef {
  id: string;
  nameKey: string;
  ariaKey: string;
  category: string;
}

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
  max-width: 840px;
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
  border-bottom: none;
  position: relative;
}

.app-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-accent);
  background-size: 200% 100%;
  animation: shimmer 4s ease-in-out infinite;
  border-radius: 1px;
  opacity: 0.6;
}

.app-title {
  font-size: 1.35rem;
  font-weight: 700;
  background: var(--gradient-accent);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  letter-spacing: -0.03em;
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  display: inline-block;
  font-size: 1.4rem;
  transition: transform var(--transition-spring);
  cursor: default;
  -webkit-text-fill-color: initial;
}

.title-icon:hover {
  transform: rotate(-15deg) scale(1.2);
  animation: titleBounce 0.5s ease;
}

@keyframes titleBounce {
  0%,
  100% {
    transform: rotate(-15deg) scale(1.2);
  }
  50% {
    transform: rotate(-10deg) scale(1.3);
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── Theme Toggle ── */
.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all var(--transition-normal);
  color: var(--text-secondary);
}

.theme-toggle:hover {
  background: var(--primary-soft);
  border-color: var(--primary);
  box-shadow: var(--shadow-glow-strong);
  transform: scale(1.1) rotate(15deg);
  color: var(--primary);
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
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--primary);
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.lang-flag {
  font-size: 1.1rem;
  line-height: 1;
}

.lang-name {
  font-weight: 500;
}

.lang-arrow {
  font-size: 0.7rem;
  transition: transform var(--transition-normal);
  opacity: 0.5;
}

.lang-arrow.open {
  transform: rotate(180deg);
}

.lang-btn:hover {
  background: var(--primary-glow);
  border-color: var(--primary);
  box-shadow: var(--shadow-glow);
}

.lang-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: var(--glass-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid var(--glass-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 8px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  max-height: 360px;
  overflow-y: auto;
  min-width: 280px;
}

.lang-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--text-secondary);
  text-align: left;
  transition: all var(--transition-normal);
  white-space: nowrap;
}

.lang-option-flag {
  font-size: 1.15rem;
  line-height: 1;
}

.lang-option:hover {
  background: var(--primary-soft);
  color: var(--primary);
  transform: translateX(2px);
}

.lang-option.active {
  background: var(--gradient-primary);
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow-glow);
}

/* ── Language menu transition ── */
.lang-menu-enter-active,
.lang-menu-leave-active {
  transition:
    opacity var(--transition-normal),
    transform var(--transition-normal);
}
.lang-menu-enter-from,
.lang-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.95);
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
  background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
  color: white;
  border-color: #f59e0b;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
}

.star-icon {
  font-size: 1.1em;
  line-height: 1;
}

/* ── Tab Navigation ── */
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

@media (max-width: 640px) {
  .tab-nav {
    justify-content: flex-start;
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 4px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none; /* Firefox */
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .tab-nav::-webkit-scrollbar {
    display: none; /* Chrome/Safari */
  }
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
  padding: 10px 32px 10px 16px;
  background: transparent;
  border-radius: var(--radius-pill);
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: all var(--transition-normal);
  position: relative;
  border: 1px solid transparent;
}

.tab-btn:hover {
  background: var(--primary-soft);
  color: var(--primary);
  transform: scale(1.02);
}

.tab-btn.active {
  background: var(--gradient-primary);
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow-glow-strong);
  transform: scale(1);
  border-color: transparent;
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

/* ── Footer ── */
.app-footer {
  margin-top: 3rem;
  padding-top: 1.5rem;
}

.footer-divider {
  height: 2px;
  background: var(--gradient-accent);
  background-size: 200% 100%;
  animation: shimmer 6s ease-in-out infinite;
  opacity: 0.25;
  margin-bottom: 1rem;
  border-radius: 1px;
}

.footer-copyright {
  text-align: center;
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
  letter-spacing: 0.01em;
}

/* ── Mobile Optimization ── */
@media (max-width: 768px) {
  .app-container {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }

  .app-header {
    margin-bottom: 1rem;
  }

  .app-title {
    font-size: 1.15rem;
  }

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

  .tool-container {
    width: 100%;
  }
}
</style>
