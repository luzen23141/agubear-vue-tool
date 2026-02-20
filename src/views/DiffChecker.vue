<template>
  <div class="diff-checker">
    <div class="description-card">
      <p>{{ t('diff.description') }}</p>
    </div>

    <BaseCard :title="t('diff.title')">
      <div class="diff-actions">
        <button type="button" class="action-btn" @click="computeDiff">
          <SvgIcon name="search" /> {{ t('diff.compare') }}
        </button>
        <button type="button" class="action-btn secondary" @click="swapInputs">
          <SvgIcon name="arrow-down" /> {{ t('diff.swap') }}
        </button>
        <button type="button" class="action-btn secondary" @click="clearAll">
          <SvgIcon name="trash" /> {{ t('common.clear') }}
        </button>
      </div>

      <div class="inputs-grid">
        <div class="input-col">
          <label>{{ t('diff.original') }}</label>
          <textarea v-model="text1" :placeholder="t('diff.pasteOriginal')" class="diff-input" />
        </div>
        <div class="input-col">
          <label>{{ t('diff.modified') }}</label>
          <textarea v-model="text2" :placeholder="t('diff.pasteModified')" class="diff-input" />
        </div>
      </div>

      <div v-if="diffResult.length > 0" class="diff-output-container">
        <h3>{{ t('diff.result') }}</h3>
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="diff-output" v-html="diffHtml" />
      </div>
    </BaseCard>

    <ToolContext tool-key="diff" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { diff_match_patch as DiffMatchPatch, type Diff } from 'diff-match-patch';
import BaseCard from '@/components/common/BaseCard.vue';
import ToolContext from '@/components/common/ToolContext.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.diff')} - ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('seo.diffDescription'))
    }
  ]
});

type ToastFunction = (_message: string, _type: 'success' | 'error' | 'info') => void;
const showToast = inject('showToast', (() => {}) as ToastFunction);

const text1 = ref('');
const text2 = ref('');
const diffResult = ref<Diff[]>([]);

const dmp = new DiffMatchPatch();

const computeDiff = () => {
  if (!text1.value && !text2.value) {
    showToast(t('diff.noInput'), 'info');
    return;
  }
  const diffs = dmp.diff_main(text1.value, text2.value);
  dmp.diff_cleanupSemantic(diffs);
  diffResult.value = diffs;
};

const swapInputs = () => {
  const temporary = text1.value;
  text1.value = text2.value;
  text2.value = temporary;
  if (diffResult.value.length > 0) computeDiff();
};

const clearAll = () => {
  text1.value = '';
  text2.value = '';
  diffResult.value = [];
};

const diffHtml = computed(() => {
  if (diffResult.value.length === 0) return '';
  // Custom HTML generation for better styling
  // Standard dmp.diff_prettyHtml is okay but we might want custom classes
  return diffResult.value
    .map(([op, text]) => {
      // Escape HTML to prevent XSS
      const safeText = text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('\n', '<br/>');

      if (op === 1) {
        // Insert
        return `<ins>${safeText}</ins>`;
      } else if (op === -1) {
        // Delete
        return `<del>${safeText}</del>`;
      } // Equal
      return `<span>${safeText}</span>`;
    })
    .join('');
});
</script>

<style scoped>
.diff-checker {
  width: 100%;
}

.description-card {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.diff-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.action-btn {
  padding: 8px 16px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--primary-hover);
}

.action-btn.secondary {
  background: var(--surface-raised);
  color: var(--text-primary);
  border: 1px solid var(--border);
}

.action-btn.secondary:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.inputs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

@media (min-width: 768px) {
  .inputs-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.input-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-col label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.diff-input {
  width: 100%;
  height: 200px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-family: 'SF Mono', monospace;
  font-size: 0.85rem;
  line-height: 1.5;
  resize: vertical;
}

.diff-input:focus {
  outline: 2px solid var(--primary-soft);
  border-color: var(--primary);
}

.diff-output-container h3 {
  font-size: 1rem;
  margin-bottom: 10px;
  color: var(--text-primary);
}

.diff-output {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface-raised);
  font-family: 'SF Mono', monospace;
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 0.9rem;
  color: var(--text-primary); /* Default text color */
}

/* Deep selection for v-html content */
:deep(ins) {
  background-color: rgba(45, 157, 106, 0.25); /* Greenish bg */
  color: var(--text-primary); /* Keep text readable */
  text-decoration: none;
  border-bottom: 2px solid var(--primary);
}

:deep(del) {
  background-color: rgba(239, 68, 68, 0.25); /* Reddish bg */
  color: var(--text-muted);
  text-decoration: line-through;
}
</style>
