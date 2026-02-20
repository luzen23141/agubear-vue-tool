<template>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { SUPPORTED_LOCALES, type LocaleInfo } from '../../i18n';

const { t, locale } = useI18n();
const router = useRouter();
const route = useRoute();

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

// Expose close method for parent to handle click-outside
defineExpose({
  close: () => {
    showLangMenu.value = false;
  }
});
</script>

<style scoped>
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
</style>
