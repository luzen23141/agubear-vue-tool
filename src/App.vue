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
          <keep-alive :max="5">
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
import { ref, watch, provide } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { SUPPORTED_LOCALES } from './i18n';
import { TOAST_KEY } from './composables/use-toast-key';
import { useSeo } from './composables/use-seo';

import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import ToolNavigation from './components/layout/ToolNavigation.vue';

import Toast from './components/common/Toast.vue';
import CommandPalette from './components/common/CommandPalette.vue';

const route = useRoute();
const { locale } = useI18n();
const { setMeta } = useSeo();

const headerRef = ref<InstanceType<typeof AppHeader> | null>(null);

// Global Toast logic
const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toastRef.value?.show(message, type);
};
provide(TOAST_KEY, showToast);

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

// SEO and Meta configuration (Default)
setMeta({});

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
