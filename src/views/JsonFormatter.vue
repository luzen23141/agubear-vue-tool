<template>
  <ToolPageLayout
    :title="t('json.title')"
    :history="history"
    tool-key="json"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <!-- Options Bar -->
    <div class="options-bar justify-end mb-4">
      <label class="checkbox-label mr-4">
        <input v-model="options.unescape" type="checkbox" />
        <span>{{ t('json.optionUnescape') }}</span>
      </label>
      <label class="checkbox-label">
        <input v-model="options.decodeUnicode" type="checkbox" />
        <span>{{ t('json.optionUnicode') }}</span>
      </label>
    </div>

    <!-- Main Actions -->
    <div class="action-buttons mb-6">
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

    <!-- Editor Grid -->
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
        <!-- Error Display -->
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
.options-bar {
  display: flex;
  align-items: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 8px 20px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--primary);
  color: white;
  border: none;
}

.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--primary-rgb), 0.3);
}

.btn-secondary {
  background: var(--surface);
  color: var(--primary);
  border: 1px solid var(--primary);
}

.btn-secondary:hover {
  background: var(--primary-soft);
}

.btn-text {
  background: transparent;
  color: var(--text-muted);
  border: none;
}

.btn-text:hover {
  color: #e05252;
}

.editor-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .editor-grid {
    grid-template-columns: 1fr 1fr;
    align-items: start;
  }
}

.pane-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.error-message {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(224, 82, 82, 0.1);
  border-left: 3px solid #e05252;
  border-radius: var(--radius-sm);
  color: #e05252;
  font-size: 0.85rem;
  line-height: 1.4;
}

:deep(.custom-textarea) {
  height: 400px;
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
  font-size: 0.9rem;
}
</style>
