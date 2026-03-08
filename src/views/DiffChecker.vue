<template>
  <ToolPageLayout :title="t('diff.title')" tool-key="diff">
    <div class="tool-actions diff-actions">
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

    <div class="editor-grid">
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

    <div v-if="diffResult.length > 0" class="result-section">
      <h2 class="result-title">{{ t('diff.result') }}</h2>
      <div class="diff-output">
        <template v-for="(segment, index) in diffSegments" :key="`${segment.type}-${index}`">
          <ins v-if="segment.type === 'insert'">{{ segment.text }}</ins>
          <del v-else-if="segment.type === 'delete'">{{ segment.text }}</del>
          <span v-else>{{ segment.text }}</span>
        </template>
      </div>
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

type DiffSegment = {
  type: 'insert' | 'delete' | 'equal';
  text: string;
};

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

const diffSegments = computed<DiffSegment[]>(() => {
  if (diffResult.value.length === 0) return [];

  return diffResult.value.map(([op, text]: Diff) => {
    let type: DiffSegment['type'] = 'equal';

    if (op === 1) {
      type = 'insert';
    } else if (op === -1) {
      type = 'delete';
    }

    return {
      type,
      text
    };
  });
});
</script>

<style scoped>
.diff-actions {
  justify-content: center;
}

.result-section {
  display: grid;
  gap: 1rem;
}

.result-title {
  text-align: center;
  font-size: 1.1rem;
  font-weight: 700;
}

.diff-output {
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  font-family: var(--font-mono);
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
