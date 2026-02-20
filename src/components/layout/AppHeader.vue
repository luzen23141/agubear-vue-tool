<template>
  <header class="flex items-center justify-between mb-8 pb-5 border-none relative">
    <div class="flex flex-col">
      <h1 class="app-title-h1">
        <span class="title-text">
          <span class="title-icon"><SvgIcon name="bear" size="1.4rem" /></span> AguBear Tools
        </span>
      </h1>
      <span class="sr-only">{{ t('seo.description') }}</span>
    </div>
    <div class="flex items-center gap-2">
      <LanguageSwitcher ref="langSwitcherRef" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import SvgIcon from '../icons/SvgIcon.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';

const { t } = useI18n();

const langSwitcherRef = ref<InstanceType<typeof LanguageSwitcher> | null>(null);

defineExpose({
  closeLangMenu: () => {
    langSwitcherRef.value?.close();
  }
});
</script>

<style scoped>
.app-title-h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--primary); /* Solid color fallback */
}

.title-text {
  background: var(--gradient-primary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

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
