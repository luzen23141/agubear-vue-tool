<template>
  <ToolPageLayout
    :title="t('json.title')"
    :history="history"
    tool-key="json"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <div class="tool-toolbar json-toolbar">
      <div class="json-options">
        <label class="checkbox-label">
          <input v-model="options.unescape" type="checkbox" />
          <span>{{ t('json.optionUnescape') }}</span>
        </label>
        <label class="checkbox-label">
          <input v-model="options.decodeUnicode" type="checkbox" />
          <span>{{ t('json.optionUnicode') }}</span>
        </label>
      </div>
    </div>

    <div class="tool-actions">
      <button class="btn-primary" type="button" @click="handleFormat">
        {{ t('json.format') }}
      </button>
      <button class="btn-secondary" type="button" @click="handleMinify">
        {{ t('json.minify') }}
      </button>
      <button class="btn-secondary" type="button" @click="handleToTs">
        {{ t('json.toTs') }}
      </button>
      <button class="btn-text" type="button" @click="handleClear">
        {{ t('json.clear') }}
      </button>
      <button
        v-if="canPaste"
        :title="t('common.paste')"
        class="btn-text icon-btn"
        type="button"
        @click="pasteInput"
      >
        <SvgIcon name="clipboard" size="1rem" />
      </button>
    </div>

    <div class="editor-grid">
      <div class="editor-pane">
        <div class="pane-label">{{ t('json.inputLabel') }}</div>
        <InputWithCopy
          id="json-input"
          v-model="inputJson"
          :placeholder="t('json.inputPlaceholder')"
          :maxlength="1000000"
          allow-paste
        />
        <div v-if="error" class="error-message mt-2">
          <SvgIcon name="alert-triangle" size="0.9rem" />
          <span>
            {{ t('json.error') }}: {{ error.message }} ({{ t('json.line') }} {{ error.line }},
            {{ t('json.column') }} {{ error.column }})
          </span>
        </div>
      </div>

      <div class="editor-pane">
        <div class="pane-label">{{ t('json.outputLabel') }}</div>
        <InputWithCopy
          id="json-output"
          :model-value="outputJson"
          :placeholder="t('json.outputPlaceholder')"
          readonly
          allow-copy
        />
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import { UseJsonFormatter } from '@/composables/use-json-formatter';
import { UseHistory } from '@/composables/use-history';

const { t } = useI18n();
const { history, clearHistory, removeFromHistory } = UseHistory();

const {
  inputJson,
  outputJson,
  error,
  options,
  canPaste,
  handleFormat,
  handleMinify,
  handleToTs,
  handleClear,
  pasteInput
} = UseJsonFormatter();
</script>

<style scoped>
.json-toolbar {
  justify-content: flex-end;
}

.json-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 1rem;
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.75rem 0.9rem;
  background: var(--status-danger-soft);
  border-left: 3px solid var(--status-danger);
  border-radius: var(--radius-sm);
  color: var(--status-danger);
  font-size: 0.85rem;
  line-height: 1.4;
}

:deep(.custom-textarea) {
  height: 400px;
  font-family: var(--font-mono);
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .json-toolbar,
  .json-options {
    justify-content: flex-start;
  }
}
</style>
