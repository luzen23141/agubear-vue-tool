<template>
  <ToolPageLayout
    :title="t('app.tabs.timestamp')"
    :history="history"
    tool-key="timestamp"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <div class="timezone-bar">
      <label for="tz-select" class="timezone-label">{{ t('timestamp.timezone') }}</label>
      <select id="tz-select" v-model.number="utcOffset" :aria-label="t('timestamp.timezoneAria')">
        <option v-for="tz in TIMEZONE_OPTIONS" :key="tz.value" :value="tz.value">
          {{ tz.prefix ? `${tz.prefix} (${t(tz.labelKey)})` : t(tz.labelKey) }}
        </option>
      </select>
    </div>

    <div class="converter-grid">
      <BaseCard :title="t('timestamp.title')" heading-tag="h2" class="tool-card">
        <div class="mode-toggle">
          <label
            v-for="mode in modeOptions"
            :key="mode.value"
            :class="{ active: timestampMode === mode.value }"
            class="mode-btn"
          >
            <input
              v-model="timestampMode"
              :value="mode.value"
              type="radio"
              name="timestampMode"
              class="sr-only"
            />
            <span>{{ t(mode.labelKey) }}</span>
          </label>
        </div>

        <div class="input-section">
          <InputWithCopy
            id="timestamp-input"
            v-model="timestampInput"
            :placeholder="t('timestamp.inputPlaceholder')"
            inputmode="numeric"
            allow-paste
            @enter="() => convertToDate()"
          />
          <div v-if="timestampLength > 0" class="input-hint">
            {{ t('timestamp.currentDigits', { n: timestampLength }) }}
          </div>
          <button type="button" class="btn-primary timestamp-submit" @click="() => convertToDate()">
            <SvgIcon name="refresh-cw" /> {{ t('timestamp.convertButton') }}
          </button>
        </div>

        <div class="result-section">
          <div class="pane-label">{{ t('timestamp.resultLabel') }}</div>
          <div :class="{ 'result-flash': dateResult }" class="result-panel timestamp-result-panel">
            <div class="result-text">{{ dateResult || '---' }}</div>
            <div v-if="relativeTime" class="relative-time">({{ relativeTime }})</div>
            <button
              v-if="dateResult"
              :aria-label="t('common.copy')"
              type="button"
              class="copy-icon-btn"
              @click="copyText(dateResult)"
            >
              <SvgIcon name="copy" />
            </button>
          </div>
        </div>
      </BaseCard>

      <BaseCard :title="t('timestamp.titleReverse')" heading-tag="h2" class="tool-card">
        <div class="format-toggle">
          <span :class="{ active: !useMilliseconds }" class="format-toggle__label">
            {{ t('timestamp.modeSeconds') }}
          </span>
          <label class="switch">
            <input
              v-model="useMilliseconds"
              :aria-label="t('timestamp.switchSecOrMs')"
              :aria-checked="useMilliseconds"
              type="checkbox"
            />
            <span class="slider" />
          </label>
          <span :class="{ active: useMilliseconds }" class="format-toggle__label">
            {{ t('timestamp.modeMilliseconds') }}
          </span>
        </div>

        <div class="input-section">
          <InputWithCopy
            id="date-input"
            v-model="dateInput"
            :placeholder="t('timestamp.datePlaceholder')"
            allow-paste
            @enter="() => convertToTimestamp()"
          />
          <button
            type="button"
            class="btn-primary timestamp-submit"
            @click="() => convertToTimestamp()"
          >
            <SvgIcon name="refresh-cw" /> {{ t('timestamp.convertButton') }}
          </button>
        </div>

        <div class="result-section">
          <div class="pane-label">{{ t('timestamp.resultLabel') }}</div>
          <div
            :class="{ 'result-flash': hasTimestampResult }"
            class="result-panel timestamp-result-panel"
          >
            <div class="result-text font-mono">
              {{ hasTimestampResult ? timestampResult : '---' }}
            </div>
            <button
              v-if="hasTimestampResult"
              :aria-label="t('common.copy')"
              type="button"
              class="copy-icon-btn"
              @click="copyText(timestampResult)"
            >
              <SvgIcon name="copy" />
            </button>
          </div>
        </div>
      </BaseCard>
    </div>

    <DurationCalculator class="timestamp-duration" />
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import BaseCard from '@/components/common/BaseCard.vue';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import { useHistoryStore } from '@/stores/history';
import { UseTimestampConverter } from '@/composables/use-timestamp-converter';
import { useCopyToClipboard } from '@/composables/use-copy-to-clipboard';
import DurationCalculator from '@/components/DurationCalculator.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import { TIMEZONE_OPTIONS } from '@/utils/constants';

const { t } = useI18n();
const historyStore = useHistoryStore();
const { history } = storeToRefs(historyStore);
const { addToHistory, clearHistory, removeFromHistory } = historyStore;

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
  convertToDate,
  convertToTimestamp
} = UseTimestampConverter(addToHistory);

const { copyText } = useCopyToClipboard();
const hasTimestampResult = computed(() => timestampResult.value !== '');

const modeOptions = [
  { value: 'auto', labelKey: 'timestamp.modeAuto' },
  { value: 's', labelKey: 'timestamp.modeSeconds' },
  { value: 'ms', labelKey: 'timestamp.modeMilliseconds' }
];

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
  convertToDate,
  convertToTimestamp,
  copyText
});
</script>

<style scoped>
.timezone-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.timezone-label {
  font-weight: 700;
  color: var(--text-secondary);
}

.timezone-bar select {
  min-height: 44px;
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
}

.converter-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .converter-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.tool-card,
.input-section,
.result-section {
  display: grid;
  gap: 1rem;
}

.mode-toggle {
  display: flex;
  gap: 0.35rem;
  padding: 0.3rem;
  background: var(--surface-hover);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.mode-btn {
  flex: 1;
  text-align: center;
  padding: 0.7rem 0.8rem;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: calc(var(--radius-md) - 6px);
  transition:
    background-color var(--transition-fast),
    color var(--transition-fast),
    box-shadow var(--transition-fast);
}

.mode-btn.active {
  background: var(--gradient-primary);
  color: var(--text-on-primary);
  box-shadow: var(--shadow-glow);
}

.input-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: right;
}

.timestamp-submit {
  width: 100%;
}

.timestamp-result-panel {
  padding-right: 4rem;
}

.result-text {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  word-break: break-all;
}

.relative-time {
  margin-top: 0.35rem;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.format-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.format-toggle__label {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
}

.format-toggle__label.active {
  color: var(--primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  inset: 0;
  cursor: pointer;
  background-color: var(--border);
  transition: background-color var(--transition-fast);
  border-radius: 999px;
}

.slider::before {
  position: absolute;
  content: '';
  width: 18px;
  height: 18px;
  left: 3px;
  top: 3px;
  background-color: var(--text-on-primary);
  transition: transform var(--transition-fast);
  border-radius: 50%;
}

.switch input:checked + .slider {
  background-color: var(--primary);
}

.switch input:checked + .slider::before {
  transform: translateX(20px);
}

.result-flash {
  animation: resultFlash 0.8s var(--transition-spring-smooth);
}

.timestamp-duration {
  margin-top: 0.5rem;
}

@keyframes resultFlash {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.02);
    filter: brightness(1.08);
    border-color: var(--primary);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}

@media (max-width: 768px) {
  .mode-toggle,
  .format-toggle {
    flex-wrap: wrap;
  }
}
</style>
