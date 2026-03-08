<template>
  <TwoWayConverter
    :title="t('base64.title')"
    :mode="mode"
    :encode-label="t('base64.encode')"
    :decode-label="t('base64.decode')"
    :input-label="t('base64.inputLabel')"
    :output-label="t('base64.base64Label')"
    :input-placeholder="t('base64.inputPlaceholder')"
    :output-placeholder="t('base64.base64Placeholder')"
    :input-text="inputText"
    :output-text="outputText"
    :history="history"
    name="base64"
    @update:mode="mode = $event as 'encode' | 'decode'"
    @update:input-text="inputText = $event"
    @record="recordHistory"
    @clear-history="clearHistory"
    @remove-from-history="removeFromHistory"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import TwoWayConverter from '@/components/common/TwoWayConverter.vue';
import { useHistoryStore } from '@/stores/history';
import { UseTwoWayConverter } from '@/composables/use-two-way-converter';
import { toBase64, fromBase64 } from '@/utils/crypto';

const { t } = useI18n();
const historyStore = useHistoryStore();
const { history } = storeToRefs(historyStore);
const { clearHistory, removeFromHistory } = historyStore;

// Adapter for fromBase64 which returns string | null vs logic expectation
const { mode, inputText, outputText, recordHistory } = UseTwoWayConverter(
  'base64',
  (input) => toBase64(input), // Explicit wait to ensure async handling
  (input) => fromBase64(input)
);
</script>
