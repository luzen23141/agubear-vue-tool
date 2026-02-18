<template>
  <div class="timestamp-converter">
    <!-- 時區選擇 -->
    <div class="timezone-bar">
      <label for="tz-select">{{ t('timestamp.timezone') }}</label>
      <select id="tz-select" v-model.number="utcOffset" :aria-label="t('timestamp.timezoneAria')">
        <option :value="-12">UTC-12</option>
        <option :value="-11">UTC-11</option>
        <option :value="-10">UTC-10 ({{ t('timestamp.tzHawaii') }})</option>
        <option :value="-9">UTC-9 ({{ t('timestamp.tzAlaska') }})</option>
        <option :value="-8">UTC-8 ({{ t('timestamp.tzPacific') }})</option>
        <option :value="-7">UTC-7 ({{ t('timestamp.tzMountain') }})</option>
        <option :value="-6">UTC-6 ({{ t('timestamp.tzCentral') }})</option>
        <option :value="-5">UTC-5 ({{ t('timestamp.tzEastern') }})</option>
        <option :value="-4">UTC-4 ({{ t('timestamp.tzAtlantic') }})</option>
        <option :value="-3">UTC-3 ({{ t('timestamp.tzBrazil') }})</option>
        <option :value="-2">UTC-2</option>
        <option :value="-1">UTC-1</option>
        <option :value="0">UTC+0 ({{ t('timestamp.tzLondon') }})</option>
        <option :value="1">UTC+1 ({{ t('timestamp.tzParis') }})</option>
        <option :value="2">UTC+2 ({{ t('timestamp.tzCairo') }})</option>
        <option :value="3">UTC+3 ({{ t('timestamp.tzMoscow') }})</option>
        <option :value="4">UTC+4 ({{ t('timestamp.tzDubai') }})</option>
        <option :value="5">UTC+5 ({{ t('timestamp.tzPakistan') }})</option>
        <option :value="5.5">UTC+5:30 ({{ t('timestamp.tzIndia') }})</option>
        <option :value="6">UTC+6 ({{ t('timestamp.tzBangladesh') }})</option>
        <option :value="7">UTC+7 ({{ t('timestamp.tzBangkok') }})</option>
        <option :value="8">UTC+8 ({{ t('timestamp.tzTaipei') }})</option>
        <option :value="9">UTC+9 ({{ t('timestamp.tzTokyo') }})</option>
        <option :value="9.5">UTC+9:30 ({{ t('timestamp.tzAustraliaCentral') }})</option>
        <option :value="10">UTC+10 ({{ t('timestamp.tzSydney') }})</option>
        <option :value="11">UTC+11</option>
        <option :value="12">UTC+12 ({{ t('timestamp.tzNewZealand') }})</option>
      </select>
    </div>

    <div class="converter-grid">
      <!-- Timestamp -> Date -->
      <BaseCard :title="t('timestamp.title')">
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
              📋 {{ t('common.paste') }}
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
              @keyup.enter="convertToDate"
            />
            <button
              :aria-label="t('timestamp.convertToDateAria')"
              type="button"
              @click="convertToDate"
            >
              {{ t('timestamp.convertButton') }}
            </button>
          </div>
          <div v-if="timestampLength > 0" class="input-hint">
            {{ t('timestamp.currentDigits', { n: timestampLength }) }}
          </div>
        </div>
        <div class="result-container">
          <div class="result">{{ dateResult }}</div>
          <button
            v-if="dateResult"
            :title="t('common.copy')"
            type="button"
            class="copy-btn"
            @click="copyText(dateResult)"
          >
            📋
          </button>
        </div>
      </BaseCard>

      <!-- Date -> Timestamp -->
      <BaseCard :title="t('timestamp.titleReverse')">
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
            📋 {{ t('common.paste') }}
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
            @keyup.enter="convertToTimestamp"
          />
          <button
            :aria-label="t('timestamp.convertToTimestampAria')"
            type="button"
            @click="convertToTimestamp"
          >
            {{ t('timestamp.convertButton') }}
          </button>
        </div>
        <div class="result-container">
          <div class="result">{{ timestampResult }}</div>
          <button
            v-if="timestampResult"
            :title="t('common.copy')"
            type="button"
            class="copy-btn"
            @click="copyText(timestampResult)"
          >
            📋
          </button>
        </div>
      </BaseCard>
    </div>

    <!-- 歷史紀錄 -->
    <HistoryList :history="history" @clear="clearHistory" @remove="removeFromHistory" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, inject, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import BaseCard from './common/BaseCard.vue';
import HistoryList from './common/HistoryList.vue';
import { useHistory } from '../composables/useHistory';
import { useTimestampConverter } from '../composables/useTimestampConverter';

type ToastFunction = (_msg: string, _type: 'success' | 'error' | 'info') => void;
const showToast = inject('showToast', (() => {}) as ToastFunction);

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.timestamp')} - ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('seo.description')) // Consider specialized description if available
    }
  ]
});

// --- Main Setup ---
const { history, addToHistory, clearHistory, removeFromHistory } = useHistory();

// 將 addToHistory 傳入轉換邏輯，讓轉換成功時自動記錄
const {
  timestampInput,
  dateResult,
  dateInput,
  timestampResult,
  useMilliseconds,
  timestampMode,
  timestampLength,
  utcOffset,
  convertToDate,
  convertToTimestamp
} = useTimestampConverter(addToHistory);

// Copy/Paste Logic
const canPaste = ref(false);

const copyText = async (text: string | number) => {
  if (!text) return;
  try {
    await navigator.clipboard.writeText(String(text));
    showToast(t('common.copied') || 'Copied!', 'success');
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    showToast('Failed to copy', 'error');
  }
};

const pasteToTimestamp = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      // Simple validation or cleanup if needed
      timestampInput.value = text.trim();
      convertToDate();
    }
  } catch (e) {
    console.warn('Clipboard read failed:', e);
  }
};

const pasteToDate = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      dateInput.value = text.trim();
      convertToTimestamp();
    }
  } catch (e) {
    console.warn('Clipboard read failed:', e);
  }
};

// 初始化
onMounted(() => {
  if (navigator.clipboard) {
    canPaste.value = true;
  }
  performance.mark('TimestampConverter-mounted');
  convertToDate();
  convertToTimestamp();
});
</script>

<style scoped>
.timestamp-converter {
  width: 100%;
  padding: 0;
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
  flex-grow: 1;
}

.converter-grid > .card {
  display: flex;
  flex-direction: column;
  flex: 1; /* Allow cards to grow equally on mobile if space permits */
}

.converter-grid .result-container {
  margin-top: auto; /* Push result to bottom of card */
}

@media (min-width: 768px) {
  .converter-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

/* History Styles - Handled by common components */
</style>
