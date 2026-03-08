<template>
  <header class="app-header">
    <div class="app-brand">
      <h1 class="app-title-h1">
        <span class="title-text">
          <span class="title-icon"><SvgIcon name="bear" size="1.4rem" /></span> AguBear Tools
        </span>
      </h1>
      <p class="app-subtitle">{{ t('seo.description') }}</p>
    </div>

    <div class="header-actions">
      <div class="theme-picker" @click.stop>
        <button
          :aria-expanded="isThemeMenuOpen ? 'true' : 'false'"
          :aria-label="t('cmd.actions.toggleTheme')"
          aria-haspopup="menu"
          type="button"
          class="theme-toggle"
          @click.stop="toggleThemeMenu"
        >
          <span class="theme-toggle__icon">
            <SvgIcon :name="currentThemeIcon" size="1rem" />
          </span>
          <span class="theme-toggle__label">{{ currentThemeLabel }}</span>
          <SvgIcon name="arrow-down" size="0.9rem" />
        </button>

        <div v-if="isThemeMenuOpen" class="theme-menu card" role="menu">
          <button
            v-for="option in themeOptions"
            :key="option.value"
            :class="{ 'is-active': option.value === theme }"
            :aria-checked="option.value === theme"
            class="theme-option"
            role="menuitemradio"
            type="button"
            @click="selectTheme(option.value)"
          >
            <span class="theme-option__main">
              <span class="theme-option__icon icon">
                <SvgIcon :name="option.icon" size="0.95rem" />
              </span>
              <span class="theme-option__text">
                <span class="theme-option__label">{{ option.label }}</span>
                <span class="theme-option__hint">{{ option.hint }}</span>
              </span>
            </span>
            <span v-if="option.value === theme" class="theme-option__check icon" aria-hidden="true">
              <SvgIcon name="check" size="0.95rem" />
            </span>
          </button>
        </div>
      </div>

      <LanguageSwitcher ref="langSwitcherRef" />
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { UseTheme, type Theme } from '@/composables/use-theme';
import SvgIcon from '../icons/SvgIcon.vue';
import LanguageSwitcher from './LanguageSwitcher.vue';

const { t } = useI18n();
const { theme, setTheme } = UseTheme();

const langSwitcherRef = ref<InstanceType<typeof LanguageSwitcher> | null>(null);
const isThemeMenuOpen = ref(false);

const themeOptions: Array<{
  value: Theme;
  label: string;
  hint: string;
  icon: 'sun' | 'moon' | 'monitor' | 'moon-star';
}> = [
  { value: 'light', label: 'Light', hint: 'Bright UI with soft surfaces', icon: 'sun' },
  { value: 'dark', label: 'Dark', hint: 'Low-glare UI for dim spaces', icon: 'moon' },
  {
    value: 'high-contrast',
    label: 'High Contrast',
    hint: 'Maximum contrast for readability',
    icon: 'moon-star'
  },
  { value: 'system', label: 'System', hint: 'Follow your device preference', icon: 'monitor' }
];

const currentThemeOption = computed(
  () =>
    themeOptions.find((option) => option.value === theme.value) ??
    themeOptions.at(-1) ??
    themeOptions[0]
);

const currentThemeLabel = computed(() => currentThemeOption.value.label);
const currentThemeIcon = computed(() => currentThemeOption.value.icon);

const toggleThemeMenu = () => {
  isThemeMenuOpen.value = !isThemeMenuOpen.value;
};

const selectTheme = (nextTheme: Theme) => {
  setTheme(nextTheme);
  isThemeMenuOpen.value = false;
};

const close = () => {
  isThemeMenuOpen.value = false;
  langSwitcherRef.value?.close();
};

defineExpose({ close });
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem 0 1.25rem;
  position: relative;
}

.app-header::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(var(--primary-rgb), 0.5), transparent);
}

.app-brand {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  min-width: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.theme-picker {
  position: relative;
}

.theme-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  min-height: 44px;
  padding: 0.65rem 0.9rem;
  border-radius: var(--radius-pill);
  background: var(--surface-overlay);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

.theme-toggle__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.theme-toggle__label {
  font-size: 0.9rem;
  font-weight: 700;
}

.theme-menu {
  position: absolute;
  top: calc(100% + 0.75rem);
  right: 0;
  z-index: 30;
  display: grid;
  gap: 0.35rem;
  min-width: min(320px, calc(100vw - 2rem));
  padding: 0.5rem;
  border-radius: var(--radius-lg);
}

.theme-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-height: 56px;
  padding: 0.8rem 0.9rem;
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-primary);
  box-shadow: none;
}

.theme-option:hover,
.theme-option.is-active {
  border-color: var(--border-hover);
  background: var(--primary-soft);
  box-shadow: none;
  transform: none;
}

.theme-option__main {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.theme-option__icon,
.theme-option__check {
  width: 2rem;
  height: 2rem;
  border-radius: 999px;
  background: var(--surface);
  color: var(--primary);
}

.theme-option__text {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
}

.theme-option__label {
  font-size: 0.94rem;
  font-weight: 700;
}

.theme-option__hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: left;
}

.app-title-h1 {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.7rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  color: var(--primary);
}

.app-subtitle {
  max-width: 48ch;
  font-size: 0.92rem;
  color: var(--text-muted);
}

.title-text {
  background: var(--gradient-primary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.title-icon {
  display: inline-flex;
  transition: transform var(--transition-spring);
  cursor: default;
  -webkit-text-fill-color: initial;
}

.title-icon:hover {
  transform: rotate(-12deg) scale(1.08);
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: space-between;
  }

  .theme-toggle {
    width: 100%;
    justify-content: space-between;
  }

  .theme-menu {
    left: 0;
    right: auto;
    min-width: 100%;
  }
}
</style>
