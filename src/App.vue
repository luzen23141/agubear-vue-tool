<template>
  <div
    class="max-w-840px mx-auto my-0 p-[2rem_2rem_calc(2rem_+_env(safe-area-inset-bottom))] min-h-100dvh flex flex-col app-container"
    @click="closeLangMenu"
  >
    <AppHeader ref="headerRef" />

    <ToolNavigation />

    <!-- Tab Content -->
    <main class="flex-grow flex flex-col relative tab-content tool-container">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <keep-alive>
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </transition>
      </router-view>
    </main>

    <AppFooter />

    <Toast ref="toastRef" />
    <CommandPalette />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { useRoute } from 'vue-router';
import { SUPPORTED_LOCALES } from './i18n';

import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import ToolNavigation from './components/layout/ToolNavigation.vue';

import Toast from './components/common/Toast.vue';
import CommandPalette from './components/common/CommandPalette.vue';

const route = useRoute();
const { t, locale } = useI18n();

const headerRef = ref<InstanceType<typeof AppHeader> | null>(null);

// Global Toast logic
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toastRef.value?.show(message, type);
};
provide('showToast', showToast);

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
  computed(() => {
    const routeTitleKey = route.meta.title as string;
    const pageTitle = routeTitleKey ? t(routeTitleKey) : '';
    const appTitle = t('app.title');
    const fullTitle = pageTitle ? `${pageTitle} - ${appTitle}` : appTitle;

    return {
      title: fullTitle,
      htmlAttrs: { lang: locale.value },
      meta: [
        { name: 'description', content: t('seo.description') },
        { name: 'keywords', content: t('seo.keywords') },
        { property: 'og:title', content: fullTitle },
        { property: 'og:description', content: t('seo.ogDescription') },
        { property: 'og:type', content: 'website' }
      ]
    };
  })
);

const closeLangMenu = () => {
  headerRef.value?.closeLangMenu();
};
</script>

<style scoped>
/* Keeping complex page transitions and media query fine-tuning */
.page-fade-enter-active,
.page-fade-leave-active {
  transition:
    opacity var(--transition-spring-smooth),
    transform var(--transition-spring-smooth),
    filter var(--transition-spring-smooth);
}

@media (prefers-reduced-motion: reduce) {
  .page-fade-enter-active,
  .page-fade-leave-active {
    transition: none !important;
  }
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px) scale(0.99);
  filter: blur(4px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.99);
  filter: blur(4px);
}

@media (max-width: 768px) {
  .app-container {
    padding-left: 1rem;
    padding-right: 1rem;
    padding-bottom: calc(80px + env(safe-area-inset-bottom));
  }
}
</style>
