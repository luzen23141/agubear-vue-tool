<template>
  <TwoWayConverter
    :title="t('url.title')"
    :mode="mode"
    :encode-label="t('url.encode')"
    :decode-label="t('url.decode')"
    :input-label="t('url.inputLabel')"
    :output-label="t('url.urlLabel')"
    :input-placeholder="t('url.inputPlaceholder')"
    :output-placeholder="t('url.urlPlaceholder')"
    :input-text="inputText"
    :output-text="outputText"
    :history="history"
    name="url"
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
import { toUrl, fromUrl } from '@/utils/crypto';

const { t } = useI18n();
const historyStore = useHistoryStore();
const { history } = storeToRefs(historyStore);
const { clearHistory, removeFromHistory } = historyStore;

const { mode, inputText, outputText, recordHistory } = UseTwoWayConverter(
  'url',
  (input) => toUrl(input),
  (input) => fromUrl(input)
);
</script>
