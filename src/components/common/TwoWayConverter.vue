<template>
  <div class="w-full">
    <BaseCard :title="title">
      <!-- Mode Selection -->
      <div class="flex justify-center mb-6">
        <div class="mode-select">
          <label class="mode-label">
            <input
              :name="name"
              :value="encodeValue"
              :checked="mode === encodeValue"
              type="radio"
              class="hidden"
              @change="$emit('update:mode', encodeValue)"
            />
            <span>{{ encodeLabel }}</span>
          </label>
          <label class="mode-label">
            <input
              :name="name"
              :value="decodeValue"
              :checked="mode === decodeValue"
              type="radio"
              class="hidden"
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
        <div v-if="outputText" class="mt-5 flex justify-center">
          <button type="button" class="btn-primary" @click="$emit('record')">
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
import type { HistoryItem } from '@/stores/history';

withDefaults(
  defineProps<{
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
  }>(),
  {
    encodeValue: 'encode',
    decodeValue: 'decode',
    inputmode: 'text'
  }
);

defineEmits<{
  (_event: 'update:mode', _value: string): void;
  (_event: 'update:inputText', _value: string): void;
  (_event: 'record'): void;
  (_event: 'clearHistory'): void;
  (_event: 'removeFromHistory', _id: number): void;
}>();

const { t } = useI18n();
</script>

<style scoped>
.mode-label {
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
.mode-label:has(input:checked) {
  background: var(--gradient-primary);
  color: white;
  font-weight: 600;
  box-shadow: var(--shadow-glow);
}
</style>
