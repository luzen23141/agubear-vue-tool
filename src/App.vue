<template>
  <div class="app-shell app-container" @click="closeHeaderOverlays">
    <a class="skip-link" href="#app-main">{{ t('app.skipToContent') }}</a>

    <div class="app-shell__inner">
      <AppHeader ref="headerRef" />

      <div class="app-shell__nav">
        <ToolNavigation />
      </div>

      <main
        id="app-main"
        ref="mainRef"
        class="app-shell__main tool-container"
        role="main"
        tabindex="-1"
      >
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <keep-alive :max="5">
              <component :is="Component" :key="route.fullPath" />
            </keep-alive>
          </transition>
        </router-view>
      </main>

      <p class="route-live-region sr-only" aria-live="polite" aria-atomic="true">
        {{ routeAnnouncement }}
      </p>

      <AppFooter />
    </div>

    <Toast ref="toastRef" />
    <CommandPalette />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, provide, computed, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { SUPPORTED_LOCALES } from './i18n';
import { TOAST_KEY } from './composables/use-toast-key';
import { useSeo } from './composables/use-seo';
import { UseTheme } from './composables/use-theme';

import AppHeader from './components/layout/AppHeader.vue';
import AppFooter from './components/layout/AppFooter.vue';
import ToolNavigation from './components/layout/ToolNavigation.vue';

import Toast from './components/common/Toast.vue';
import CommandPalette from './components/common/CommandPalette.vue';

const route = useRoute();
const { locale, t } = useI18n();
const { setMeta } = useSeo();
const { initTheme } = UseTheme();

const headerRef = ref<InstanceType<typeof AppHeader> | null>(null);
const mainRef = ref<HTMLElement | null>(null);

const toastRef = ref<InstanceType<typeof Toast> | null>(null);
const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  toastRef.value?.show(message, type);
};
provide(TOAST_KEY, showToast);

const routeAnnouncement = computed(() => {
  const routeName = route.name;
  if (typeof routeName !== 'string') return t('app.title');
  return t(`app.tabs.${routeName}`);
});

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

watch(
  () => route.fullPath,
  async () => {
    await nextTick();
    mainRef.value?.focus();
  }
);

setMeta({});
initTheme();

const closeHeaderOverlays = () => {
  headerRef.value?.close();
};
</script>

<style scoped>
.app-shell {
  min-height: 100dvh;
  padding: 1.5rem 1.5rem calc(2rem + env(safe-area-inset-bottom));
}

.skip-link {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 200;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-pill);
  background: var(--surface);
  color: var(--text-primary);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-lg);
  transform: translateY(-150%);
  transition: transform var(--transition-fast);
}

.skip-link:focus {
  transform: translateY(0);
}

.app-shell__inner {
  width: min(100%, 1120px);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.app-shell__nav {
  position: relative;
  z-index: 5;
}

.app-shell__main {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 1.25rem;
  outline: none;
}

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
  .app-shell {
    padding: 1rem 1rem calc(88px + env(safe-area-inset-bottom));
  }

  .app-shell__inner {
    gap: 1.25rem;
  }
}
</style>
