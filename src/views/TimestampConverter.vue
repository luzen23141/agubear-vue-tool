<template>
  <div class="timestamp-converter">
    <!-- 時區選擇 -->
    <div class="timezone-bar reveal-delay-1">
      <label for="tz-select">{{ t('timestamp.timezone') }}</label>
      <select id="tz-select" v-model.number="utcOffset" :aria-label="t('timestamp.timezoneAria')">
        <option v-for="tz in TIMEZONE_OPTIONS" :key="tz.value" :value="tz.value">
          {{ tz.prefix ? `${tz.prefix} (${t(tz.labelKey)})` : t(tz.labelKey) }}
        </option>
      </select>
    </div>

    <div class="converter-grid">
      <!-- Timestamp -> Date -->
      <BaseCard :title="t('timestamp.title')" heading-tag="h2" class="reveal-delay-2">
        <!-- 輸入模式切換 -->
        <div class="mode-toggle">
          <label for="ts-mode-auto">
            <input
              id="ts-mode-auto"
              v-model="timestampMode"
              type="radio"
              name="timestampMode"
              value="auto"
            />
            <span>{{ t('timestamp.modeAuto') }}</span>
          </label>
          <label for="ts-mode-s">
            <input
              id="ts-mode-s"
              v-model="timestampMode"
              type="radio"
              name="timestampMode"
              value="s"
            />
            <span>{{ t('timestamp.modeSeconds') }}</span>
          </label>
          <label for="ts-mode-ms">
            <input
              id="ts-mode-ms"
              v-model="timestampMode"
              type="radio"
              name="timestampMode"
              value="ms"
            />
            <span>{{ t('timestamp.modeMilliseconds') }}</span>
          </label>
        </div>

        <div class="input-wrapper">
          <div class="input-header">
            <button
              v-if="canPaste"
              :title="t('common.paste')"
              type="button"
              class="paste-btn"
              @click="pasteToTimestamp"
            >
              <SvgIcon name="clipboard-paste" /> {{ t('common.paste') }}
            </button>
          </div>
          <div class="input-group">
            <input
              id="timestamp-input"
              v-model="timestampInput"
              :placeholder="t('timestamp.inputPlaceholder')"
              :aria-label="t('timestamp.inputAria')"
              name="timestampInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              maxlength="15"
              autofocus
              @keyup.enter="() => convertToDate()"
              @keyup.esc="clearTimestampInput"
            />
            <button
              :aria-label="t('timestamp.convertToDateAria')"
              type="button"
              @click="() => convertToDate()"
            >
              {{ t('timestamp.convertButton') }}
            </button>
          </div>
          <div v-if="timestampLength > 0" class="input-hint">
            {{ t('timestamp.currentDigits', { n: timestampLength }) }}
          </div>
        </div>
        <div class="result-container">
          <div :class="{ 'result-flash': dateResult }" class="result-group">
            <div class="result">{{ dateResult }}</div>
            <div v-if="relativeTime" class="relative-time">({{ relativeTime }})</div>
          </div>
          <button
            v-if="dateResult"
            :title="t('common.copy')"
            type="button"
            class="copy-btn"
            @click="copyText(dateResult)"
          >
            <SvgIcon name="copy" />
          </button>
        </div>
      </BaseCard>

      <!-- Date -> Timestamp -->
      <BaseCard :title="t('timestamp.titleReverse')" class="reveal-delay-3">
        <!-- 格式切換 -->
        <div class="format-toggle">
          <span :class="{ active: !useMilliseconds }">{{ t('timestamp.modeSeconds') }}</span>
          <label class="switch">
            <input
              id="ms-switch"
              v-model="useMilliseconds"
              :aria-label="t('timestamp.switchSecOrMs')"
              :aria-checked="useMilliseconds ? 'true' : 'false'"
              name="msSwitch"
              type="checkbox"
              role="switch"
            />
            <span class="slider" />
          </label>
          <span :class="{ active: useMilliseconds }">{{ t('timestamp.modeMilliseconds') }}</span>
        </div>

        <div class="input-header">
          <button
            v-if="canPaste"
            :title="t('common.paste')"
            type="button"
            class="paste-btn"
            @click="pasteToDate"
          >
            <SvgIcon name="clipboard-paste" /> {{ t('common.paste') }}
          </button>
        </div>
        <div class="input-group">
          <input
            id="date-input"
            v-model="dateInput"
            :placeholder="t('timestamp.datePlaceholder')"
            :aria-label="t('timestamp.dateInputAria')"
            name="dateInput"
            type="text"
            @keyup.enter="() => convertToTimestamp()"
            @keyup.esc="clearDateInput"
          />
          <button
            :aria-label="t('timestamp.convertToTimestampAria')"
            type="button"
            @click="() => convertToTimestamp()"
          >
            {{ t('timestamp.convertButton') }}
          </button>
        </div>
        <div class="result-container">
          <div :class="{ 'result-flash': timestampResult }" class="result">
            {{ timestampResult }}
          </div>
          <button
            v-if="timestampResult"
            :title="t('common.copy')"
            type="button"
            class="copy-btn"
            @click="copyText(timestampResult)"
          >
            <SvgIcon name="copy" />
          </button>
        </div>
      </BaseCard>

      <DurationCalculator />
    </div>

    <HistoryList :history="history" @clear="clearHistory" @remove="removeFromHistory" />
    <ToolContext tool-key="timestamp" />
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import BaseCard from '@/components/common/BaseCard.vue';
import HistoryList from '@/components/common/HistoryList.vue';
import ToolContext from '@/components/common/ToolContext.vue';
import { UseHistory } from '@/composables/use-history';
import { UseTimestampConverter } from '@/composables/use-timestamp-converter';
import DurationCalculator from '@/components/DurationCalculator.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import { TIMEZONE_OPTIONS } from '@/utils/constants';

type ToastFunction = (_message: string, _type: 'success' | 'error' | 'info') => void;
const showToast = inject('showToast', (() => {}) as ToastFunction);

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.timestamp')} - ${t('app.title')}`),
  meta: [
    { name: 'description', content: computed(() => t('seo.description')) },
    {
      property: 'og:title',
      content: computed(() => `${t('app.tabs.timestamp')} - ${t('app.title')}`)
    }
  ]
});

const { history, addToHistory, clearHistory, removeFromHistory } = UseHistory();

const {
  timestampInput,
  dateResult,
  dateInput,
  timestampResult,
  useMilliseconds,
  timestampMode,
  timestampLength,
  utcOffset,
  relativeTime,
  canPaste,
  convertToDate,
  convertToTimestamp,
  clearTimestampInput,
  clearDateInput,
  pasteToTimestamp,
  pasteToDate
} = UseTimestampConverter(addToHistory);

const copyText = async (text: string | number) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(String(text));
    showToast(t('common.copied') || 'Copied!', 'success');
  } catch (error) {
    console.warn('Clipboard write failed:', error);
    showToast('Failed to copy', 'error');
  }
};

// Provide properties to the tests
defineExpose({
  TIMEZONE_OPTIONS,
  timestampInput,
  dateResult,
  dateInput,
  timestampResult,
  useMilliseconds,
  timestampMode,
  timestampLength,
  utcOffset,
  relativeTime,
  canPaste,
  convertToDate,
  convertToTimestamp,
  clearTimestampInput,
  clearDateInput,
  pasteToTimestamp,
  pasteToDate,
  copyText
});
</script>

<style scoped>
.timestamp-converter {
  width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* 時區選擇列 */
.timezone-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 1.5rem;
  padding: 10px 16px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  font-size: 0.92rem;
  flex-shrink: 0;
}

.timezone-bar label {
  font-weight: 600;
  color: var(--text-primary);
}

.timezone-bar select {
  padding: 6px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  background: var(--surface);
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color var(--transition-fast);
  font-family: inherit;
}

.timezone-bar select:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: var(--shadow-focus);
}

/* Grid Layout */
.converter-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-shrink: 0;
}

.converter-grid > .card {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.converter-grid .result-container {
  margin-top: auto;
}

@media (min-width: 768px) {
  .converter-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: stretch;
  }
}

/* History Styles - Handled by common components */
:deep(.history-card) {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

:deep(.history-list) {
  flex-grow: 1;
  overflow-y: auto;
}

.result-group {
  display: flex;
  flex-direction: column;
  transition: all var(--transition-normal);
}

.result-flash {
  animation: resultFlash 1s var(--transition-spring-smooth);
}

@keyframes resultFlash {
  0% {
    filter: brightness(1);
  }
  20% {
    filter: brightness(1.5) drop-shadow(0 0 8px var(--primary));
    transform: scale(1.02);
  }
  100% {
    filter: brightness(1);
    transform: scale(1);
  }
}

.reveal-delay-1 {
  animation: pageReveal var(--transition-fluid) 0.1s backwards;
}
.reveal-delay-2 {
  animation: pageReveal var(--transition-fluid) 0.2s backwards;
}
.reveal-delay-3 {
  animation: pageReveal var(--transition-fluid) 0.3s backwards;
}
</style>
