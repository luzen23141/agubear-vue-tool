<template>
  <div class="w-full reveal-delay-100">
    <BaseCard :title="title" :heading-tag="headingTag">
      <slot />

      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
    </BaseCard>

    <!-- History section (optional) -->
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

    <!-- SEO/GEO/AEO Context -->
    <ToolContext :tool-key="toolKey" />
  </div>
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
