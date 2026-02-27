<template>
  <ToolPageLayout
    :title="t('hash.title')"
    :history="history"
    tool-key="hash"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <div class="flex justify-between items-center mb-4 flex-wrap gap-3">
      <div class="flex items-center gap-2">
        <label for="algo-select">{{ t('hash.algorithm') }}</label>
        <select
          id="algo-select"
          v-model="algo"
          class="px-2 py-1 rounded-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)]"
        >
          <option value="MD5">MD5</option>
          <option value="SHA1">SHA1</option>
          <option value="SHA256">SHA256</option>
          <option value="SHA512">SHA512</option>
        </select>
      </div>

      <label
        class="checkbox-label flex items-center gap-2 cursor-pointer text-0.9rem text-[var(--text-secondary)] hover:text-[var(--primary)] transition-colors"
      >
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

    <div v-if="hashResult" class="mt-6">
      <h2 class="text-0.9rem text-[var(--text-muted)] mb-2 font-500">
        {{ t('hash.resultLabel') }} ({{ algo }})
      </h2>
      <InputWithCopy id="hash-output" :model-value="hashResult" readonly allow-copy />
      <p class="text-0.8rem text-[var(--text-muted)] text-center mt-2">
        {{ t('hash.copyHint') }}
      </p>
    </div>

    <template #footer>
      <div v-if="hashResult" class="mt-4 flex justify-center">
        <button
          :aria-label="t('hash.recordAria')"
          type="button"
          class="btn-primary"
          @click="generateAndRecord"
        >
          {{ t('hash.record') }}
        </button>
      </div>
    </template>

    <template #history-item="{ item }">
      <span class="val">{{ item.input }}</span>
      <span class="arrow">➜</span>
      <span class="val text-[var(--primary)]!">{{ item.output }}</span>
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
