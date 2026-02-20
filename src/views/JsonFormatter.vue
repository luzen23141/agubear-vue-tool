<template>
  <div class="json-formatter">
    <!-- Context / Description -->
    <div class="description-card">
      <p>{{ t('json.description') }}</p>
    </div>

    <BaseCard>
      <!-- Controls Toolbar -->
      <div class="controls-bar">
        <div class="action-group">
          <button
            :aria-label="t('json.formatAria')"
            class="btn-primary btn-format"
            type="button"
            @click="handleFormat"
          >
            {{ t('json.format') }}
          </button>
          <button
            :aria-label="t('json.minifyAria')"
            class="btn-secondary btn-minify"
            type="button"
            @click="handleMinify"
          >
            {{ t('json.minify') }}
          </button>
          <button
            :aria-label="t('json.toTsAria')"
            class="btn-secondary btn-ts"
            type="button"
            @click="handleToTs"
          >
            {{ t('json.toTs') }}
          </button>
        </div>

        <div class="options-group">
          <label class="checkbox-label">
            <input v-model="options.unescape" type="checkbox" class="toggle-unescape" />
            {{ t('json.optionUnescape') }}
          </label>
          <label class="checkbox-label">
            <input v-model="options.decodeUnicode" type="checkbox" class="toggle-unicode" />
            {{ t('json.optionUnicode') }}
          </label>
        </div>
      </div>

      <!-- Editor Grid -->
      <div class="editor-grid">
        <!-- Input Area -->
        <div class="editor-pane input-pane">
          <div class="pane-header">
            <h3>{{ t('json.inputLabel') }}</h3>
            <div class="pane-controls">
              <button
                v-if="canPaste"
                :title="t('common.paste')"
                class="icon-btn"
                type="button"
                @click="pasteInput"
              >
                <SvgIcon name="clipboard-paste" /> {{ t('common.paste') }}
              </button>
              <button class="clear-btn" type="button" @click="handleClear">
                {{ t('json.clear') }}
              </button>
            </div>
          </div>
          <textarea
            v-model="inputJson"
            :placeholder="t('json.inputPlaceholder')"
            class="json-input"
            spellcheck="false"
            maxlength="1000000"
          />
          <!-- Error Display -->
          <div v-if="error" class="error-message">
            <span class="error-icon"><SvgIcon name="alert-triangle" size="0.9rem" /></span>
            <span class="error-text">
              {{ t('json.error') }}: {{ error.message }} ({{ t('json.line') }} {{ error.line }},
              {{ t('json.column') }} {{ error.column }})
            </span>
          </div>
        </div>

        <!-- Output Area -->
        <div class="editor-pane output-pane">
          <div class="pane-header">
            <h3>{{ t('json.outputLabel') }}</h3>
            <button :disabled="!outputJson" class="copy-btn" type="button" @click="copyOutput">
              {{ t('json.copy') }}
            </button>
          </div>
          <div class="json-output-container">
            <textarea
              :value="outputJson"
              :placeholder="t('json.outputPlaceholder')"
              class="json-output"
              readonly
            />
          </div>
        </div>
      </div>
    </BaseCard>
  </div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import BaseCard from '@/components/common/BaseCard.vue';
import { UseJsonFormatter } from '@/composables/use-json-formatter';
import SvgIcon from '@/components/icons/SvgIcon.vue';

type ToastFunction = (_message: string, _type: 'success' | 'error' | 'info') => void;
const showToast = inject('showToast', (() => {}) as ToastFunction);

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.json')} - ${t('app.title')}`),
  meta: [{ name: 'description', content: computed(() => t('seo.description')) }]
});

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

const copyOutput = async () => {
  if (!outputJson.value) return;
  try {
    await navigator.clipboard.writeText(outputJson.value);
    showToast(t('common.copied') || 'Copied!', 'success');
  } catch (error_) {
    console.error('Failed to copy', error_);
    showToast('Failed to copy', 'error');
  }
};
</script>

<style scoped>
.json-formatter {
  width: 100%;
}
.description-card {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}
.controls-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  background: var(--surface);
  padding: 12px 0;
}
.action-group {
  display: flex;
  gap: 10px;
}
.options-group {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}
.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}
.btn-primary {
  background: var(--primary);
  color: white;
}
.btn-primary:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}
.btn-secondary {
  background: var(--surface);
  color: var(--primary);
  border: 1px solid var(--primary);
}
.btn-secondary:hover {
  background: var(--primary-soft);
}
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  color: var(--text-primary);
  user-select: none;
}
.checkbox-label input {
  accent-color: var(--primary);
  width: 1rem;
  height: 1rem;
}
.editor-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  height: 600px;
}
@media (min-width: 768px) {
  .editor-grid {
    grid-template-columns: 1fr 1fr;
  }
}
.editor-pane {
  display: flex;
  flex-direction: column;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}
.pane-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.pane-header h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.pane-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}
.icon-btn,
.clear-btn,
.copy-btn {
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: color var(--transition-fast);
  padding: 4px 8px;
}
.clear-btn:hover {
  color: #e05252;
}
.icon-btn:hover,
.copy-btn:hover {
  color: var(--primary);
}
.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.json-input,
.json-output {
  flex: 1;
  width: 100%;
  padding: 12px;
  border: none;
  resize: none;
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.5;
  background: var(--surface-raised);
  color: var(--text-primary);
  outline: none;
}
.json-output {
  background: var(--primary-soft);
  color: var(--text-primary);
}
.json-output-container {
  flex: 1;
  display: flex;
  flex-direction: column;
}
.error-message {
  padding: 10px 16px;
  background: #fef2f2;
  border-top: 1px solid #fee2e2;
  color: #b91c1c;
  font-size: 0.85rem;
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.error-icon {
  font-size: 1.1em;
}
</style>
