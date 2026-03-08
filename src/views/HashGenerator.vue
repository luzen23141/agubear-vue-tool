<template>
  <ToolPageLayout
    :title="t('hash.title')"
    :history="history"
    tool-key="hash"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <div class="tool-toolbar hash-toolbar">
      <div class="hash-settings">
        <label for="algo-select" class="hash-label">{{ t('hash.algorithm') }}</label>
        <select id="algo-select" v-model="algo" class="hash-select">
          <option value="MD5">MD5</option>
          <option value="SHA1">SHA1</option>
          <option value="SHA256">SHA256</option>
          <option value="SHA512">SHA512</option>
        </select>
      </div>

      <label class="checkbox-label">
        <input
          id="hash-uppercase"
          v-model="isUpperCase"
          :aria-label="t('hash.uppercaseAria')"
          name="hashUppercase"
          type="checkbox"
        />
        <span>{{ t('hash.uppercase') }}</span>
      </label>
    </div>

    <InputWithCopy
      id="hash-input"
      v-model="inputText"
      :label="t('hash.inputLabel')"
      :placeholder="t('hash.placeholder')"
      :maxlength="5000"
      :spellcheck="false"
      allow-paste
      allow-copy
      @paste="inputText = $event"
    />

    <div v-if="hashResult" class="hash-result">
      <div class="pane-label">{{ t('hash.resultLabel') }} ({{ algo }})</div>
      <InputWithCopy id="hash-output" :model-value="hashResult" readonly allow-copy />
      <p class="hash-hint">{{ t('hash.copyHint') }}</p>
    </div>

    <template #footer>
      <button
        v-if="hashResult"
        :aria-label="t('hash.recordAria')"
        type="button"
        class="btn-primary"
        @click="generateAndRecord"
      >
        {{ t('hash.record') }}
      </button>
    </template>

    <template #history-item="{ item }">
      <span class="history-value">{{ item.input }}</span>
      <span class="history-separator" aria-hidden="true">→</span>
      <span class="history-value history-value--output">{{ item.output }}</span>
    </template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import { UseHistory } from '@/composables/use-history';
import { computeHash } from '@/utils/crypto';

const { t } = useI18n();

const { history, addToHistory, clearHistory, removeFromHistory } = UseHistory();

const inputText = ref('');
const isUpperCase = ref(false);
const algo = ref('MD5');

const hashResult = ref('');
const isComputing = ref(false);

watch(
  [inputText, algo, isUpperCase],
  async ([text, alg, upper]: [string, string, boolean]) => {
    if (!text) {
      hashResult.value = '';
      return;
    }
    isComputing.value = true;
    try {
      const hash = await computeHash(text, alg);
      hashResult.value = upper && hash ? hash.toUpperCase() : hash || '';
    } catch (error) {
      console.error(error);
      hashResult.value = '';
    } finally {
      isComputing.value = false;
    }
  },
  { immediate: true }
);

const generateAndRecord = () => {
  if (!hashResult.value) return;
  const displayInput =
    inputText.value.length > 20 ? `${inputText.value.slice(0, 20)}...` : inputText.value;
  addToHistory('hash', displayInput, hashResult.value);
};

onMounted(() => {
  performance.mark('HashGenerator-mounted');
});
</script>

<style scoped>
.hash-toolbar {
  align-items: center;
}

.hash-settings {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.hash-label {
  font-weight: 700;
  color: var(--text-secondary);
}

.hash-select {
  min-height: 44px;
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
}

.hash-result {
  display: grid;
  gap: 0.75rem;
}

.hash-hint {
  font-size: 0.8rem;
  text-align: center;
  color: var(--text-muted);
}

.history-value {
  word-break: break-all;
}

.history-value--output {
  color: var(--primary);
}

.history-separator {
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .hash-toolbar,
  .hash-settings {
    align-items: flex-start;
  }
}
</style>
