<template>
  <div class="unicode-converter">
    <BaseCard :title="t('unicode.title')">
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

      <!-- 文字輸入 -->
      <div class="input-group">
        <div class="input-header">
          <label class="field-label" for="unicode-text-input">{{ t('unicode.fieldText') }}</label>
          <button
            v-if="canPaste"
            :title="t('common.paste')"
            type="button"
            class="paste-btn"
            @click="pasteToText"
          >
            <SvgIcon name="clipboard-paste" /> {{ t('common.paste') }}
          </button>
        </div>
        <textarea
          id="unicode-text-input"
          v-model="textInput"
          :placeholder="t('unicode.textPlaceholder')"
          :aria-label="t('unicode.textAria')"
          maxlength="5000"
        />
        <button
          v-if="textInput"
          :title="t('common.copy')"
          type="button"
          class="copy-btn-overlay"
          @click="copyResult(textInput)"
        >
          <SvgIcon name="copy" />
        </button>
      </div>

      <!-- 轉換按鈕 -->
      <div class="action-buttons">
        <button :aria-label="t('unicode.toUnicodeAria')" type="button" @click="convertToUnicode">
          {{ t('unicode.toUnicode') }}
        </button>
        <button :aria-label="t('unicode.toTextAria')" type="button" @click="convertToText">
          {{ t('unicode.toText') }}
        </button>
      </div>

      <!-- Unicode 輸入/輸出 -->
      <div class="input-group">
        <div class="input-header">
          <label class="field-label" for="unicode-raw-input">{{ t('unicode.fieldUnicode') }}</label>
          <button
            v-if="canPaste"
            :title="t('common.paste')"
            type="button"
            class="paste-btn"
            @click="pasteToUnicode"
          >
            <SvgIcon name="clipboard-paste" /> {{ t('common.paste') }}
          </button>
        </div>
        <textarea
          id="unicode-raw-input"
          v-model="unicodeInput"
          :placeholder="t('unicode.unicodePlaceholder')"
          :aria-label="t('unicode.unicodeAria')"
          maxlength="5000"
        />
        <button
          v-if="unicodeInput"
          :title="t('common.copy')"
          type="button"
          class="copy-btn-overlay"
          @click="copyResult(unicodeInput)"
        >
          <SvgIcon name="copy" />
        </button>
      </div>
    </BaseCard>

    <!-- 歷史紀錄 -->
    <HistoryList :history="history" @clear="clearHistory" @remove="removeFromHistory" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import BaseCard from './common/BaseCard.vue';
import HistoryList from './common/HistoryList.vue';
import { textToUnicode, unicodeToText, textToHtmlEntity, htmlEntityToText } from '../utils/unicode';
import { useHistory } from '../composables/useHistory';
import SvgIcon from './icons/SvgIcon.vue';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.unicode')} - ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('seo.description'))
    }
  ]
});

const { history, addToHistory, clearHistory, removeFromHistory } = useHistory();

const textInput = ref('');
const unicodeInput = ref('');
const skipAscii = ref(true);
const format = ref<'unicode' | 'html'>('unicode');

// 文字 → Unicode
const convertToUnicode = () => {
  if (!textInput.value) return;
  if (format.value === 'html') {
    unicodeInput.value = textToHtmlEntity(textInput.value, skipAscii.value);
  } else {
    unicodeInput.value = textToUnicode(textInput.value, skipAscii.value);
  }
  const displayInput =
    textInput.value.length > 20 ? `${textInput.value.slice(0, 20)}...` : textInput.value;
  const displayOutput =
    unicodeInput.value.length > 30 ? `${unicodeInput.value.slice(0, 30)}...` : unicodeInput.value;
  addToHistory('unicode', displayInput, displayOutput);
};

// Unicode → 文字
const convertToText = () => {
  if (!unicodeInput.value) return;
  if (format.value === 'html') {
    textInput.value = htmlEntityToText(unicodeInput.value);
  } else {
    textInput.value = unicodeToText(unicodeInput.value);
  }
  const displayInput =
    unicodeInput.value.length > 30 ? `${unicodeInput.value.slice(0, 30)}...` : unicodeInput.value;
  addToHistory('unicode', displayInput, textInput.value);
};

const copyResult = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.warn('Clipboard write failed:', err);
  }
};

const canPaste = ref(false);

const pasteToText = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) textInput.value = text;
  } catch (e) {
    console.warn('Clipboard read failed:', e);
  }
};

const pasteToUnicode = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) unicodeInput.value = text;
  } catch (e) {
    console.warn('Clipboard read failed:', e);
  }
};

onMounted(() => {
  performance.mark('UnicodeConverter-mounted');
  if (navigator.clipboard) {
    canPaste.value = true;
  }
});
</script>

<style scoped>
.unicode-converter {
  width: 100%;
}

.card {
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  letter-spacing: -0.01em;
}

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
  transition: color var(--transition-fast);
}

.format-select label:hover {
  color: var(--primary);
}

.format-select input[type='radio'] {
  accent-color: var(--primary);
  width: 1.1em;
  height: 1.1em;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.checkbox-label:hover {
  color: var(--primary);
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.input-group textarea {
  display: block;
  width: 100%;
  height: 120px;
  min-height: 120px;
  max-height: 150px;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-family: inherit;
  background: var(--surface);
  color: var(--text-primary);
  resize: none;
  overflow-y: auto;
  word-wrap: break-word;
  white-space: pre-wrap;
  box-sizing: border-box;
  transition: border-color var(--transition-fast);
}

.input-group textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: var(--shadow-focus);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 1rem 0;
}

.action-buttons button {
  padding: 10px 20px;
  background: var(--primary-color, #1e6e44);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

.action-buttons button:hover {
  transform: translateY(-2px);
  background: var(--primary-hover, #257e55);
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.4);
}

.copy-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 1rem;
}

.copy-btn {
  margin-top: 0.5rem;
  padding: 4px 8px;
  font-size: 0.8rem;
  background: transparent;
  color: var(--primary);
  border: 1px solid transparent;
  border-radius: 4px;
  cursor: pointer;
  transition: all var(--transition-fast);
  opacity: 0.8;
}

.copy-btn:hover {
  background: var(--primary-soft);
  opacity: 1;
}

/* History Styles - Handled by common components */

.input-group {
  position: relative;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.paste-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-primary);
}
.paste-btn:hover {
  background: var(--surface-hover);
  color: var(--primary);
}

.copy-btn-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: var(--surface-overlay);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-primary);
  opacity: 0.8;
}
.copy-btn-overlay:hover {
  opacity: 1;
  color: var(--primary);
}
</style>
