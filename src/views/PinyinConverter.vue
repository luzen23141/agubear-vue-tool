<template>
  <div class="pinyin-converter">
    <BaseCard :title="t('pinyin.title')">
      <!-- 設定 -->
      <div class="options-bar">
        <label class="checkbox-label">
          <input
            id="show-tone"
            v-model="showTone"
            :aria-label="t('pinyin.showToneAria')"
            type="checkbox"
            name="showTone"
          />
          <span>{{ t('pinyin.showTone') }}</span>
        </label>
        <label class="checkbox-label">
          <input
            id="show-spaces"
            v-model="showSpaces"
            :aria-label="t('pinyin.showSpacesAria')"
            type="checkbox"
            name="showSpaces"
          />
          <span>{{ t('pinyin.showSpaces') }}</span>
        </label>
      </div>

      <!-- 輸入 -->
      <div class="input-group">
        <div class="input-header">
          <button
            v-if="canPaste"
            :title="t('common.paste')"
            type="button"
            class="paste-btn"
            @click="pasteInput"
          >
            <SvgIcon name="clipboard-paste" /> {{ t('common.paste') }}
          </button>
        </div>
        <textarea
          id="pinyin-input"
          v-model="inputText"
          :placeholder="t('pinyin.placeholder')"
          :aria-label="t('pinyin.inputAria')"
          maxlength="5000"
          @keyup.enter="convertToPinyin"
        />
      </div>

      <!-- 轉換按鈕 -->
      <div class="action-buttons">
        <button :aria-label="t('pinyin.convertAria')" type="button" @click="convertToPinyin">
          {{ t('pinyin.convert') }}
        </button>
      </div>

      <!-- 結果 -->
      <div v-if="pinyinResult" class="result-group">
        <h2>{{ t('pinyin.resultLabel') }}</h2>
        <div :title="t('pinyin.copyTitle')" class="result-box" @click="copyResult">
          {{ pinyinResult }}
        </div>
        <p class="hint">{{ t('pinyin.copyHint') }}</p>
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
import BaseCard from '@/components/common/BaseCard.vue';
import HistoryList from '@/components/common/HistoryList.vue';
import { pinyin } from 'pinyin-pro';
import { UseHistory } from '@/composables/use-history';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.pinyin')} - ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('seo.description'))
    }
  ]
});

const { history, addToHistory, clearHistory, removeFromHistory } = UseHistory();

const inputText = ref('');
const showTone = ref(false);
const showSpaces = ref(true);
const pinyinResult = ref('');

const convertToPinyin = () => {
  if (!inputText.value.trim()) return;

  const options = {
    toneType: (showTone.value ? 'symbol' : 'none') as 'symbol' | 'none',
    nonZh: 'consecutive' as const,
    v: true
  };

  const result = pinyin(inputText.value, options);
  pinyinResult.value = showSpaces.value
    ? (result as string)
    : (result as string).replaceAll(/\s+/g, '');

  const displayInput =
    inputText.value.length > 15 ? `${inputText.value.slice(0, 15)}...` : inputText.value;
  addToHistory('pinyin', displayInput, pinyinResult.value);
};

const copyResult = async () => {
  if (!pinyinResult.value) return;
  try {
    await navigator.clipboard.writeText(pinyinResult.value);
  } catch (error) {
    console.warn('Clipboard write failed:', error);
  }
};

const canPaste = ref(false);

const pasteInput = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) inputText.value = text;
  } catch (error) {
    console.warn('Clipboard read failed:', error);
  }
};

onMounted(() => {
  performance.mark('PinyinConverter-mounted');
  if (navigator.clipboard) {
    canPaste.value = true;
  }
});
</script>

<style scoped>
.pinyin-converter {
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
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.checkbox-label:hover {
  color: var(--primary);
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
  font-size: 1.1rem;
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
  margin: 1.5rem 0;
}

.action-buttons button {
  padding: 10px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  gap: 6px;
}

.action-buttons button:hover {
  transform: translateY(-1px);
  background: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(45, 157, 106, 0.3);
}

.result-section {
  margin-top: 1.5rem;
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  position: relative;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.result-header h3 {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.copy-btn {
  padding: 4px 10px;
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
  background: var(--surface);
  border-color: var(--border);
  opacity: 1;
}

.pinyin-output {
  font-size: 1.25rem;
  line-height: 1.6;
  color: var(--primary);
  font-weight: 500;
  word-break: break-all;
  white-space: pre-wrap;
}

/* History Styles - Handled by common components */

.input-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 4px;
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
</style>
