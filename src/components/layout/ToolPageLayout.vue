<template>
  <section class="tool-page-layout reveal-delay-100">
    <BaseCard :title="title" :heading-tag="headingTag" class="tool-page-layout__card">
      <div class="tool-page-layout__content">
        <slot />
      </div>

      <template v-if="$slots.footer" #footer>
        <div class="tool-page-layout__footer">
          <slot name="footer" />
        </div>
      </template>
    </BaseCard>

    <slot name="history">
      <HistoryList
        v-if="history && history.length > 0"
        :history="history"
        @clear="$emit('clear-history')"
        @remove="$emit('remove-history', $event)"
      >
        <template #item="slotProps">
          <slot name="history-item" v-bind="slotProps" />
        </template>
      </HistoryList>
    </slot>

    <ToolContext :tool-key="toolKey" />
  </section>
</template>

<script setup lang="ts">
import BaseCard from '@/components/common/BaseCard.vue';
import HistoryList from '@/components/common/HistoryList.vue';
import ToolContext from '@/components/common/ToolContext.vue';
import type { HistoryItem } from '@/stores/history';

interface Properties {
  title: string;
  toolKey: string;
  headingTag?: 'h1' | 'h2' | 'h3';
  history?: HistoryItem[];
}

defineProps<Properties>();

defineEmits<{
  (_event: 'clear-history'): void;
  (_event: 'remove-history', _id: number): void;
}>();
</script>

<style scoped>
.tool-page-layout {
  display: grid;
  gap: 1.25rem;
  width: 100%;
}

.tool-page-layout__card {
  width: 100%;
}

.tool-page-layout__content {
  display: grid;
  gap: 1.25rem;
}

.tool-page-layout__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: flex-start;
}

@media (max-width: 768px) {
  .tool-page-layout,
  .tool-page-layout__content {
    gap: 1rem;
  }
}
</style>
