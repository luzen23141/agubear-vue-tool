<template>
  <ToolPageLayout :title="t('diff.title')" tool-key="diff">
    <!-- Action Bar -->
    <div class="action-buttons mb-8">
      <button type="button" class="btn-primary" @click="computeDiff">
        <SvgIcon name="search" /> {{ t('diff.compare') }}
      </button>
      <button type="button" class="btn-secondary" @click="swapInputs">
        <SvgIcon name="arrow-down" /> {{ t('diff.swap') }}
      </button>
      <button type="button" class="btn-text" @click="clearAll">
        <SvgIcon name="trash" /> {{ t('common.clear') }}
      </button>
    </div>

    <!-- Inputs Grid -->
    <div class="editor-grid mb-8">
      <div class="editor-pane">
        <div class="pane-label">{{ t('diff.original') }}</div>
        <InputWithCopy
          id="diff-original"
          v-model="text1"
          :placeholder="t('diff.pasteOriginal')"
          allow-paste
        />
      </div>
      <div class="editor-pane">
        <div class="pane-label">{{ t('diff.modified') }}</div>
        <InputWithCopy
          id="diff-modified"
          v-model="text2"
          :placeholder="t('diff.pasteModified')"
          allow-paste
        />
      </div>
    </div>

    <!-- Result Display -->
    <div v-if="diffResult.length > 0" class="result-section">
      <h2 class="text-center text-1.1rem font-600 mb-4">{{ t('diff.result') }}</h2>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div class="diff-output" v-html="diffHtml" />
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { TOAST_KEY } from '@/composables/use-toast-key';
import { useI18n } from 'vue-i18n';
import { diff_match_patch as DiffMatchPatch, type Diff } from 'diff-match-patch';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';

const { t } = useI18n();
const showToast = inject(TOAST_KEY, () => {});

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
  return diffResult.value
    .map(([op, text]: Diff) => {
      const safeText = text
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('\n', '<br/>');

      if (op === 1) return `<ins>${safeText}</ins>`;
      if (op === -1) return `<del>${safeText}</del>`;
      return `<span>${safeText}</span>`;
    })
    .join('');
});
</script>

<style scoped>
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-buttons button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--primary);
  color: var(--text-on-primary);
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
  color: var(--status-danger);
}

.editor-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 1024px) {
  .editor-grid {
    grid-template-columns: 1fr 1fr;
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

.result-section {
  padding: 1.5rem;
  background: var(--background-alt);
  border-radius: var(--radius-md);
}

.diff-output {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 0.9rem;
  color: var(--text-primary);
}

:deep(ins) {
  background-color: var(--status-success-soft);
  color: var(--text-primary);
  text-decoration: none;
  border-bottom: 2px solid var(--primary);
}

:deep(del) {
  background-color: var(--status-danger-soft);
  color: var(--text-muted);
  text-decoration: line-through;
}

:deep(.custom-textarea) {
  height: 250px;
}
</style>
