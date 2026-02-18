<template>
  <div class="two-way-converter">
    <BaseCard :title="title">
      <!-- Mode Selection -->
      <div class="options-bar">
        <div class="mode-select">
          <label>
            <input
              :name="name"
              :value="encodeValue"
              :checked="mode === encodeValue"
              type="radio"
              @change="$emit('update:mode', encodeValue)"
            />
            <span>{{ encodeLabel }}</span>
          </label>
          <label>
            <input
              :name="name"
              :value="decodeValue"
              :checked="mode === decodeValue"
              type="radio"
              @change="$emit('update:mode', decodeValue)"
            />
            <span>{{ decodeLabel }}</span>
          </label>
        </div>
      </div>

      <!-- Input Area -->
      <InputWithCopy
        :id="`${name}-input`"
        :model-value="inputText"
        :label="mode === encodeValue ? inputLabel : outputLabel"
        :placeholder="mode === encodeValue ? inputPlaceholder : outputPlaceholder"
        :inputmode="inputmode"
        :spellcheck="spellcheck"
        allow-paste
        allow-copy
        @update:model-value="$emit('update:inputText', $event)"
      />

      <!-- Arrow Indicator -->
      <div class="direction-arrow">⬇</div>

      <!-- Output Area -->
      <InputWithCopy
        :id="`${name}-output`"
        :model-value="outputText"
        :label="mode === encodeValue ? outputLabel : inputLabel"
        readonly
        allow-copy
      />

      <!-- History Action -->
      <template #footer>
        <div v-if="outputText" class="action-group">
          <button type="button" class="record-btn" @click="$emit('record')">
            {{ t('common.record') }}
          </button>
        </div>
      </template>
    </BaseCard>

    <!-- History -->
    <HistoryList
      :history="history"
      @clear="$emit('clearHistory')"
      @remove="(id) => $emit('removeFromHistory', id)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import BaseCard from './BaseCard.vue';
import HistoryList from './HistoryList.vue';
import InputWithCopy from './InputWithCopy.vue';

interface HistoryItem {
  id: number;
  timestamp: string;
  input: string;
  output: string | number;
  [key: string]: unknown;
}

/* eslint-disable @typescript-eslint/no-unused-vars */
const props = defineProps<{
  title: string;
  name: string;
  mode: string;
  encodeValue?: string;
  decodeValue?: string;
  encodeLabel: string;
  decodeLabel: string;
  inputLabel: string;
  outputLabel: string;
  inputPlaceholder: string;
  outputPlaceholder: string;
  inputText: string;
  outputText: string;
  history: HistoryItem[];
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  spellcheck?: boolean;
}>();

/* eslint-enable @typescript-eslint/no-unused-vars */

defineEmits<{
  (_e: 'update:mode', _value: string): void;
  (_e: 'update:inputText', _value: string): void;
  (_e: 'record'): void;
  (_e: 'clearHistory'): void;
  (_e: 'removeFromHistory', _id: number): void;
}>();

const { t } = useI18n();

// Interface moved up

// Default defaults for optional props if needed (using withDefaults is better usually but simple works)
const encodeValue = props.encodeValue || 'encode';
const decodeValue = props.decodeValue || 'decode';
</script>

<style scoped>
.two-way-converter {
  width: 100%;
}

.options-bar {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.mode-select {
  display: flex;
  background: var(--surface);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}

.mode-select label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.mode-select label:has(input:checked) {
  background: var(--primary);
  color: white;
  font-weight: 500;
}

.mode-select input {
  display: none;
}

.direction-arrow {
  text-align: center;
  font-size: 1.2rem;
  color: var(--text-muted);
  margin: 0.5rem 0;
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
}

.record-btn:hover {
  background: var(--primary-hover);
}
</style>
