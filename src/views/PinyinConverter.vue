<template>
  <ToolPageLayout
    :title="t('pinyin.title')"
    :history="history"
    tool-key="pinyin"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <!-- 設定 -->
    <div class="options-bar justify-end mb-4">
      <label class="checkbox-label mr-4">
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

    <InputWithCopy
      id="pinyin-input"
      v-model="inputText"
      :placeholder="t('pinyin.placeholder')"
      :aria-label="t('pinyin.inputAria')"
      :maxlength="5000"
      allow-paste
      @enter="convertToPinyin"
    />

    <!-- 轉換按鈕 -->
    <div class="action-buttons">
      <button :aria-label="t('pinyin.convertAria')" type="button" @click="convertToPinyin">
        {{ t('pinyin.convert') }}
      </button>
    </div>

    <!-- 結果 -->
    <div v-if="pinyinResult" class="mt-6">
      <h2 class="text-0.9rem text-[var(--text-muted)] mb-2 font-500">
        {{ t('pinyin.resultLabel') }}
      </h2>
      <InputWithCopy id="pinyin-output" :model-value="pinyinResult" readonly allow-copy />
      <p class="text-0.8rem text-[var(--text-muted)] text-center mt-2">
        {{ t('pinyin.copyHint') }}
      </p>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import { pinyin } from 'pinyin-pro';
import { UseHistory } from '@/composables/use-history';

const { t } = useI18n();

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

onMounted(() => {
  performance.mark('PinyinConverter-mounted');
});
</script>

<style scoped>
.options-bar {
  display: flex;
  align-items: center;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
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
  transition: all var(--transition-fast);
}

.action-buttons button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}
</style>
