<template>
  <TwoWayConverter
    :title="t('url.title')"
    :mode="mode"
    :encode-label="t('url.encode')"
    :decode-label="t('url.decode')"
    :input-label="mode === 'encode' ? t('url.inputLabel') : t('url.urlLabel')"
    :output-label="mode === 'encode' ? t('url.urlLabel') : t('url.inputLabel')"
    :input-placeholder="mode === 'encode' ? t('url.inputPlaceholder') : t('url.urlPlaceholder')"
    :input-text="inputText"
    :output-text="outputText"
    :history="history"
    name="url"
    encode-value="encode"
    decode-value="decode"
    output-placeholder=""
    @update:mode="mode = $event"
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
import TwoWayConverter from '@/components/common/TwoWayConverter.vue';
import { UseHistory } from '@/composables/use-history';
import { UseTwoWayConverter } from '@/composables/use-two-way-converter';
import { toUrl, fromUrl } from '@/utils/crypto';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.url')} - ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('seo.description'))
    }
  ]
});

const { history, clearHistory, removeFromHistory } = UseHistory();

const { mode, inputText, outputText, recordHistory } = UseTwoWayConverter(
  'url',
  (input) => toUrl(input),
  (input) => fromUrl(input)
);
</script>
