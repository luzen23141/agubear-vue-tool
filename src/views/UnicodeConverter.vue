<template>
  <ToolPageLayout
    :title="t('unicode.title')"
    :history="history"
    tool-key="unicode"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <!-- 格式與選項 -->
    <div class="options-bar">
      <div class="format-select">
        <label>
          <input
            id="unicode-mode-unicode"
            v-model="format"
            type="radio"
            name="unicodeMode"
            value="unicode"
          />
          <span>\uXXXX</span>
        </label>
        <label>
          <input
            id="unicode-mode-html"
            v-model="format"
            type="radio"
            name="unicodeMode"
            value="html"
          />
          <span>&amp;#xXXXX;</span>
        </label>
      </div>
      <label class="checkbox-label">
        <input
          id="skip-ascii"
          v-model="skipAscii"
          :aria-label="t('unicode.skipAsciiAria')"
          type="checkbox"
          name="skipAscii"
        />
        <span>{{ t('unicode.skipAscii') }}</span>
      </label>
    </div>

    <InputWithCopy
      id="unicode-text-input"
      v-model="textInput"
      :label="t('unicode.fieldText')"
      :placeholder="t('unicode.textPlaceholder')"
      :maxlength="5000"
      allow-paste
      allow-copy
    />

    <!-- 轉換按鈕 -->
    <div class="action-buttons">
      <button :aria-label="t('unicode.toUnicodeAria')" type="button" @click="convertToUnicode">
        {{ t('unicode.toUnicode') }}
      </button>
      <button :aria-label="t('unicode.toTextAria')" type="button" @click="convertToText">
        {{ t('unicode.toText') }}
      </button>
    </div>

    <InputWithCopy
      id="unicode-raw-input"
      v-model="unicodeInput"
      :label="t('unicode.fieldUnicode')"
      :placeholder="t('unicode.unicodePlaceholder')"
      :maxlength="5000"
      allow-paste
      allow-copy
    />
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import { textToUnicode, unicodeToText, textToHtmlEntity, htmlEntityToText } from '@/utils/unicode';
import { UseHistory } from '@/composables/use-history';

const { t } = useI18n();

const { history, addToHistory, clearHistory, removeFromHistory } = UseHistory();

const textInput = ref('');
const unicodeInput = ref('');
const skipAscii = ref(true);
const format = ref<'unicode' | 'html'>('unicode');

// 文字 → Unicode
const convertToUnicode = () => {
  if (!textInput.value) return;
  unicodeInput.value =
    format.value === 'html'
      ? textToHtmlEntity(textInput.value, skipAscii.value)
      : textToUnicode(textInput.value, skipAscii.value);
  const displayInput =
    textInput.value.length > 20 ? `${textInput.value.slice(0, 20)}...` : textInput.value;
  const displayOutput =
    unicodeInput.value.length > 30 ? `${unicodeInput.value.slice(0, 30)}...` : unicodeInput.value;
  addToHistory('unicode', displayInput, displayOutput);
};

// Unicode → 文字
const convertToText = () => {
  if (!unicodeInput.value) return;
  textInput.value =
    format.value === 'html'
      ? htmlEntityToText(unicodeInput.value)
      : unicodeToText(unicodeInput.value);
  const displayInput =
    unicodeInput.value.length > 30 ? `${unicodeInput.value.slice(0, 30)}...` : unicodeInput.value;
  addToHistory('unicode', displayInput, textInput.value);
};

onMounted(() => {
  performance.mark('UnicodeConverter-mounted');
});
</script>

<style scoped>
.options-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 1rem;
}

.format-select {
  display: flex;
  gap: 12px;
}

.format-select label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.format-select input[type='radio'] {
  accent-color: var(--primary);
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 1.5rem 0;
}

.action-buttons button {
  padding: 10px 20px;
  background: var(--primary);
  color: var(--text-on-primary);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.action-buttons button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}
</style>
