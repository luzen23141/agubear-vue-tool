<template>
  <ToolPageLayout
    :title="t('app.tabs.timestamp')"
    :history="history"
    tool-key="timestamp"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <!-- 時區選擇 -->
    <div class="timezone-bar mb-8">
      <label for="tz-select" class="mr-4 font-600">{{ t('timestamp.timezone') }}</label>
      <select id="tz-select" v-model.number="utcOffset" :aria-label="t('timestamp.timezoneAria')">
        <option v-for="tz in TIMEZONE_OPTIONS" :key="tz.value" :value="tz.value">
          {{ tz.prefix ? `${tz.prefix} (${t(tz.labelKey)})` : t(tz.labelKey) }}
        </option>
      </select>
    </div>

    <div class="converter-grid">
      <!-- Timestamp -> Date -->
      <BaseCard :title="t('timestamp.title')" heading-tag="h2" class="tool-card">
        <div class="mode-toggle mb-4">
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

        <div class="input-section mb-6">
          <InputWithCopy
            id="timestamp-input"
            v-model="timestampInput"
            :placeholder="t('timestamp.inputPlaceholder')"
            inputmode="numeric"
            allow-paste
            @enter="() => convertToDate()"
          />
          <div v-if="timestampLength > 0" class="input-hint mt-2">
            {{ t('timestamp.currentDigits', { n: timestampLength }) }}
          </div>
          <button type="button" class="btn-primary w-full mt-4" @click="() => convertToDate()">
            <SvgIcon name="refresh-cw" /> {{ t('timestamp.convertButton') }}
          </button>
        </div>

        <div class="result-section">
          <div class="pane-label">{{ t('timestamp.resultLabel') }}</div>
          <div :class="{ 'result-flash': dateResult }" class="result-display">
            <div class="result-text">{{ dateResult || '---' }}</div>
            <div v-if="relativeTime" class="relative-time">({{ relativeTime }})</div>
            <button
              v-if="dateResult"
              type="button"
              class="copy-icon-btn"
              @click="copyText(dateResult)"
            >
              <SvgIcon name="copy" />
            </button>
          </div>
        </div>
      </BaseCard>

      <!-- Date -> Timestamp -->
      <BaseCard :title="t('timestamp.titleReverse')" heading-tag="h2" class="tool-card">
        <div class="format-toggle mb-4">
          <span :class="{ active: !useMilliseconds }" class="text-0.85rem font-600">{{
            t('timestamp.modeSeconds')
          }}</span>
          <label class="switch mx-3">
            <input
              v-model="useMilliseconds"
              :aria-label="t('timestamp.switchSecOrMs')"
              :aria-checked="useMilliseconds"
              type="checkbox"
            />
            <span class="slider" />
          </label>
          <span :class="{ active: useMilliseconds }" class="text-0.85rem font-600">{{
            t('timestamp.modeMilliseconds')
          }}</span>
        </div>

        <div class="input-section mb-6">
          <InputWithCopy
            id="date-input"
            v-model="dateInput"
            :placeholder="t('timestamp.datePlaceholder')"
            allow-paste
            @enter="() => convertToTimestamp()"
          />
          <button type="button" class="btn-primary w-full mt-4" @click="() => convertToTimestamp()">
            <SvgIcon name="refresh-cw" /> {{ t('timestamp.convertButton') }}
          </button>
        </div>

        <div class="result-section">
          <div class="pane-label">{{ t('timestamp.resultLabel') }}</div>
          <div :class="{ 'result-flash': timestampResult }" class="result-display">
            <div class="result-text font-mono">{{ timestampResult || '---' }}</div>
            <button
              v-if="timestampResult"
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

    <DurationCalculator class="mt-8" />
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import BaseCard from '@/components/common/BaseCard.vue';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import { UseHistory } from '@/composables/use-history';
import { UseTimestampConverter } from '@/composables/use-timestamp-converter';
import { useCopyToClipboard } from '@/composables/use-copy-to-clipboard';
import DurationCalculator from '@/components/DurationCalculator.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import { TIMEZONE_OPTIONS } from '@/utils/constants';

const { t } = useI18n();

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
  convertToDate,
  convertToTimestamp
} = UseTimestampConverter(addToHistory);

const { copyText } = useCopyToClipboard();

const modeOptions = [
  { value: 'auto', labelKey: 'timestamp.modeAuto' },
  { value: 's', labelKey: 'timestamp.modeSeconds' },
  { value: 'ms', labelKey: 'timestamp.modeMilliseconds' }
];

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
  convertToDate,
  convertToTimestamp,
  copyText
});
</script>

<style scoped>
.timezone-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: var(--background-alt);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.timezone-bar select {
  padding: 6px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.converter-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .converter-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.tool-card {
  height: 100%;
}

/* Mode Buttons */
.mode-toggle {
  display: flex;
  gap: 8px;
  background: var(--background-alt);
  padding: 4px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
}

.mode-btn {
  flex: 1;
  text-align: center;
  padding: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: 4px;
  transition: all var(--transition-fast);
}

.mode-btn.active {
  background: var(--primary);
  color: white;
  box-shadow: 0 2px 4px rgba(var(--primary-rgb), 0.2);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}

/* Input Hint */
.input-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: right;
}

/* Result Section */
.pane-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.result-display {
  position: relative;
  min-height: 80px;
  padding: 16px;
  background: var(--background-alt);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: all var(--transition-normal);
}

.result-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
}

.relative-time {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-top: 4px;
}

.copy-icon-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.copy-icon-btn:hover {
  color: var(--primary);
  border-color: var(--primary);
  background: var(--primary-soft);
}

.btn-primary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

/* Switch */
.format-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 22px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border);
  transition: 0.4s;
  border-radius: 22px;
}

.slider:before {
  position: absolute;
  content: '';
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: var(--primary);
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.result-flash {
  animation: resultFlash 0.8s var(--transition-spring-smooth);
}

@keyframes resultFlash {
  0% {
    transform: scale(1);
  }
  30% {
    transform: scale(1.02);
    filter: brightness(1.1);
    border-color: var(--primary);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}
</style>
