<template>
  <TwoWayConverter
    :title="t('base64.title')"
    :mode="mode"
    :encode-label="t('base64.encode')"
    :decode-label="t('base64.decode')"
    :input-label="mode === 'encode' ? t('base64.inputLabel') : t('base64.base64Label')"
    :output-label="mode === 'encode' ? t('base64.base64Label') : t('base64.inputLabel')"
    :input-placeholder="
      mode === 'encode' ? t('base64.inputPlaceholder') : t('base64.base64Placeholder')
    "
    :input-text="inputText"
    :output-text="outputText"
    :history="history"
    :spellcheck="false"
    name="base64"
    encode-value="encode"
    decode-value="decode"
    output-placeholder=""
    @update:mode="mode = $event as 'encode' | 'decode'"
    @update:input-text="inputText = $event"
    @record="recordHistory"
    @clear-history="clearHistory"
    @remove-from-history="removeFromHistory"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import TwoWayConverter from './common/TwoWayConverter.vue';
import { useHistory } from '../composables/useHistory';
import { useTwoWayConverter } from '../composables/useTwoWayConverter';
import { toBase64, fromBase64 } from '../utils/crypto';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.base64')} - ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('seo.description'))
    }
  ]
});

const { history, clearHistory, removeFromHistory } = useHistory();

// Adapter for fromBase64 which returns string | null vs logic expectation
const { mode, inputText, outputText, recordHistory } = useTwoWayConverter(
  'base64',
  (input) => toBase64(input), // Explicit wait to ensure async handling
  (input) => fromBase64(input)
);
</script>
