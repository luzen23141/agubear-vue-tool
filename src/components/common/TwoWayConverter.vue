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
      <div class="direction-arrow"><SvgIcon name="arrow-down" size="1.2rem" /></div>

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
import SvgIcon from '../icons/SvgIcon.vue';

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
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 4px;
  border-radius: var(--radius-md);
  border: 1px solid var(--glass-border);
}

.mode-select label {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-normal);
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.mode-select label:has(input:checked) {
  background: var(--gradient-primary);
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow-glow);
}

.mode-select input {
  display: none;
}

.direction-arrow {
  text-align: center;
  font-size: 1.2rem;
  color: var(--primary);
  margin: 0.75rem 0;
  opacity: 0.6;
  transition: opacity var(--transition-normal);
}

.action-group {
  margin-top: 1.25rem;
  display: flex;
  justify-content: center;
}

.record-btn {
  padding: 10px 28px;
  background: var(--gradient-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-glow);
}

.record-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(45, 157, 106, 0.3);
}
</style>
