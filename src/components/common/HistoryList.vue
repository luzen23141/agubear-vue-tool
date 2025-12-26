<template>
  <div v-if="history.length > 0" class="card history-card">
    <div class="history-header">
      <h2>{{ t('common.history') }}</h2>
      <button type="button" class="clear-btn" @click="$emit('clear')">
        {{ t('common.clear') }}
      </button>
    </div>
    <div class="history-list">
      <div v-for="item in history" :key="item.id" class="history-item">
        <div class="history-time">{{ item.timestamp }}</div>
        <div class="history-content">
          <slot :item="item" name="item">
            <span class="val">{{ item.input }}</span>
            <span class="arrow">➜</span>
            <span class="val">{{ item.output }}</span>
          </slot>
        </div>
        <button
          :aria-label="t('timestamp.deleteAria')"
          class="delete-btn"
          type="button"
          @click="$emit('remove', item.id)"
        >
          ✕
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

interface HistoryItem {
  id: number;
  timestamp: string;
  input: string;
  output: string | number;
  [key: string]: unknown;
}

defineProps<{
  history: HistoryItem[];
}>();

defineEmits<{
  (_e: 'clear'): void;
  (_e: 'remove', _id: number): void;
}>();

const { t } = useI18n();
</script>

<style scoped>
.history-card {
  margin-top: 1.5rem;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.history-header h2 {
  margin: 0;
  font-size: 1rem;
  color: var(--text-primary);
}

.clear-btn {
  padding: 4px 12px;
  font-size: 0.82rem;
  background: transparent;
  color: #c81e1e;
  border: 1px solid rgba(200, 30, 30, 0.3);
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.clear-btn:hover {
  background: #c81e1e;
  color: white;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 10px;
  background: var(--primary-soft);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
}

.history-time {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-right: 12px;
  min-width: 55px;
}

.history-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.history-content :deep(.val) {
  font-family: monospace;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40%;
}

.delete-btn {
  padding: 4px 8px;
  background: transparent;
  color: var(--text-muted);
  border: none;
  cursor: pointer;
}

.delete-btn:hover {
  background: #c81e1e;
  color: white;
  border-radius: 4px;
}

@media (max-width: 500px) {
  .history-item {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 8px !important;
    padding: 12px !important;
  }
  .history-time {
    margin-bottom: 4px;
  }
  .history-content {
    width: 100%;
    flex-wrap: wrap;
  }
  .history-content :deep(.val) {
    max-width: 100%;
    white-space: normal;
    word-break: break-all;
  }
  .delete-btn {
    align-self: flex-end;
  }
}
</style>
