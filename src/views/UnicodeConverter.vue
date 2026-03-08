<template>
  <ToolPageLayout
    :title="t('unicode.title')"
    :history="history"
    tool-key="unicode"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <div class="tool-toolbar unicode-toolbar">
      <div class="unicode-format-select">
        <label class="unicode-format-option">
          <input
            id="unicode-mode-unicode"
            v-model="format"
            type="radio"
            name="unicodeMode"
            value="unicode"
          />
          <span>\uXXXX</span>
        </label>
        <label class="unicode-format-option">
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

    <div class="tool-actions unicode-actions">
      <button
        :aria-label="t('unicode.toUnicodeAria')"
        type="button"
        class="btn-primary"
        @click="convertToUnicode"
      >
        {{ t('unicode.toUnicode') }}
      </button>
      <button
        :aria-label="t('unicode.toTextAria')"
        type="button"
        class="btn-secondary"
        @click="convertToText"
      >
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
import { storeToRefs } from 'pinia';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import { useHistoryStore } from '@/stores/history';
import { textToUnicode, unicodeToText, textToHtmlEntity, htmlEntityToText } from '@/utils/unicode';

const { t } = useI18n();
const historyStore = useHistoryStore();
const { history } = storeToRefs(historyStore);
const { addToHistory, clearHistory, removeFromHistory } = historyStore;

const textInput = ref('');
const unicodeInput = ref('');
const skipAscii = ref(true);
const format = ref<'unicode' | 'html'>('unicode');

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
.unicode-toolbar {
  align-items: center;
}

.unicode-format-select {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.unicode-format-option {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.unicode-format-option input[type='radio'] {
  accent-color: var(--primary);
}

.unicode-actions {
  justify-content: center;
}
</style>
