<template>
  <div class="hash-generator">
    <BaseCard :title="t('hash.title')">
      <div class="controls-bar">
        <div class="select-wrapper">
          <label for="algo-select">{{ t('hash.algorithm') }}</label>
          <select id="algo-select" v-model="algo">
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
        allow-paste
        allow-copy
        @paste="inputText = $event"
      />

      <div v-if="hashResult" class="result-group">
        <h3>{{ t('hash.resultLabel') }} ({{ algo }})</h3>
        <InputWithCopy id="hash-output" :model-value="hashResult" readonly allow-copy />
        <p class="hint">{{ t('hash.copyHint') }}</p>
      </div>

      <template #footer>
        <div v-if="hashResult" class="action-group">
          <button
            :aria-label="t('hash.recordAria')"
            type="button"
            class="record-btn"
            @click="generateAndRecord"
          >
            {{ t('hash.record') }}
          </button>
        </div>
      </template>
    </BaseCard>

    <!-- 歷史紀錄 -->
    <HistoryList :history="history" @clear="clearHistory" @remove="removeFromHistory">
      <template #item="{ item }">
        <span class="val">{{ item.input }}</span>
        <span class="arrow">➜</span>
        <span class="val hash-val">{{ item.output }}</span>
      </template>
    </HistoryList>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from './common/BaseCard.vue';
import HistoryList from './common/HistoryList.vue';
import InputWithCopy from './common/InputWithCopy.vue';
import { useHistory } from '../composables/useHistory';
import { computeHash } from '../utils/crypto';

const { t } = useI18n();
const { history, addToHistory, clearHistory, removeFromHistory } = useHistory();

const inputText = ref('');
const isUpperCase = ref(false);
const algo = ref('MD5');

const hashResult = computed(() => {
  if (!inputText.value) return '';
  const hash = computeHash(inputText.value, algo.value);
  return isUpperCase.value && hash ? hash.toUpperCase() : hash || '';
});

const generateAndRecord = () => {
  if (!hashResult.value) return;
  const displayInput =
    inputText.value.length > 20 ? `${inputText.value.slice(0, 20)}...` : inputText.value;
  // Maybe better to include algo in history display?
  // Current history structure is simple input/output.
  // We'll stick to that for now. The output length/format hints at algo.
  addToHistory('hash', displayInput, hashResult.value);
};

onMounted(() => {
  performance.mark('HashGenerator-mounted');
});
</script>

<style scoped>
.hash-generator {
  width: 100%;
}

.controls-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 12px;
}

.select-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.select-wrapper select {
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
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

.action-group {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.record-btn {
  padding: 10px 24px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.92rem;
  transition: all var(--transition-fast);
}

.record-btn:hover {
  transform: translateY(-1px);
  background: var(--primary-hover);
  box-shadow: 0 4px 12px rgba(45, 157, 106, 0.3);
}

.result-group {
  margin-top: 1.5rem;
}

.result-group h3 {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.hint {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: 0.5rem;
}

/* History Styles - Handled by common components */
.hash-val {
  color: var(--primary) !important;
}
</style>
