<template>
  <header class="flex items-center justify-between mb-8 pb-5 border-none relative">
    <div class="flex flex-col">
      <h2
        class="text-1.5rem font-800 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] bg-clip-text text-transparent m-0 tracking--0.04em flex items-center gap-2"
      >
        <span class="title-icon"><SvgIcon name="bear" size="1.4rem" /></span> AguBear Tools
      </h2>
      <span class="sr-only">{{ t('seo.description') }}</span>
    </div>
    <div class="flex items-center gap-2">
      <button
        :title="t('app.theme_' + theme)"
        :aria-label="t('app.theme_' + theme)"
        type="button"
        class="theme-toggle flex items-center justify-center w-10 h-10 p-0 rounded-full border-1 border-solid border-[var(--border)] bg-[var(--glass-bg)] backdrop-blur-12 transition-all duration-300 text-[var(--text-secondary)] hover:bg-[var(--primary-soft)] hover:border-[var(--primary)] hover:shadow-[var(--shadow-glow-strong)] hover:scale-110 hover:rotate-15 hover:text-[var(--primary)]"
        @click="toggleTheme"
      >
        <SvgIcon v-if="theme === 'light'" name="sun" />
        <SvgIcon v-else-if="theme === 'dark'" name="moon" />
        <SvgIcon v-else name="monitor" />
      </button>

      <LanguageSwitcher ref="langSwitcherRef" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { UseTheme } from '@/composables/use-theme';
import SvgIcon from '../icons/SvgIcon.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';

const { t } = useI18n();
const { theme, toggleTheme } = UseTheme();

const langSwitcherRef = ref<InstanceType<typeof LanguageSwitcher> | null>(null);

defineExpose({
  closeLangMenu: () => {
    langSwitcherRef.value?.close();
  }
});
</script>

<style scoped>
/* Only keeping complex animations/pseudo-elements here */
header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-primary);
  background-size: 200% 100%;
  animation: shimmer 4s ease-in-out infinite;
  border-radius: 1px;
  opacity: 0.4;
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

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 1.15rem;
  }
}
</style>
