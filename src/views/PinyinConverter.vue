<template>
  <ToolPageLayout
    :title="t('pinyin.title')"
    :history="history"
    tool-key="pinyin"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <div class="tool-toolbar pinyin-toolbar">
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

    <InputWithCopy
      id="pinyin-input"
      v-model="inputText"
      :placeholder="t('pinyin.placeholder')"
      :aria-label="t('pinyin.inputAria')"
      :maxlength="5000"
      allow-paste
      @enter="convertToPinyin"
    />

    <div class="tool-actions pinyin-actions">
      <button
        :aria-label="t('pinyin.convertAria')"
        type="button"
        class="btn-primary"
        @click="convertToPinyin"
      >
        {{ t('pinyin.convert') }}
      </button>
    </div>

    <div v-if="pinyinResult" class="pinyin-result">
      <div class="pane-label">{{ t('pinyin.resultLabel') }}</div>
      <InputWithCopy id="pinyin-output" :model-value="pinyinResult" readonly allow-copy />
      <p class="pinyin-hint">{{ t('pinyin.copyHint') }}</p>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import { pinyin } from 'pinyin-pro';
import { useHistoryStore } from '@/stores/history';

const { t } = useI18n();
const historyStore = useHistoryStore();
const { history } = storeToRefs(historyStore);
const { addToHistory, clearHistory, removeFromHistory } = historyStore;

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
.pinyin-toolbar {
  justify-content: flex-end;
}

.pinyin-actions {
  justify-content: center;
}

.pinyin-result {
  display: grid;
  gap: 0.75rem;
}

.pinyin-hint {
  font-size: 0.8rem;
  text-align: center;
  color: var(--text-muted);
}
</style>
