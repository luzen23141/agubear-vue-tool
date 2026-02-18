<template>
  <div v-if="history.length > 0" class="history-card">
    <div class="history-header">
      <h2>{{ t('common.history') }}</h2>
      <button type="button" class="clear-btn" @click="$emit('clear')">
        {{ t('common.clear') }}
      </button>
    </div>
    <div class="history-list">
      <div
        v-for="(item, index) in history"
        :key="item.id"
        :style="{ animationDelay: `${index * 0.04}s` }"
        class="history-item"
      >
        <div class="timeline-dot" />
        <div class="history-body">
          <div class="history-time">{{ item.timestamp }}</div>
          <div class="history-content">
            <slot :item="item" name="item">
              <span class="val">{{ item.input }}</span>
              <span class="arrow">→</span>
              <span class="val">{{ item.output }}</span>
            </slot>
          </div>
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
  background: var(--glass-bg);
  backdrop-filter: blur(var(--glass-blur));
  -webkit-backdrop-filter: blur(var(--glass-blur));
  border: 1px solid var(--glass-border);
  border-top: 1px solid var(--glass-border-shine);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-elevated);
  position: relative;
  overflow: hidden;
}

.history-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-accent);
  background-size: 200% 100%;
  opacity: 0.5;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border);
}

.history-header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.clear-btn {
  padding: 5px 14px;
  font-size: 0.8rem;
  background: transparent;
  color: #e53e3e;
  border: 1px solid rgba(229, 62, 62, 0.2);
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.clear-btn:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 16px rgba(229, 62, 62, 0.25);
  transform: scale(1.04);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: var(--primary-soft);
  border-radius: var(--radius-sm);
  font-size: 0.88rem;
  transition: all var(--transition-normal);
  animation: slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  opacity: 0;
  position: relative;
  border-left: 2px solid transparent;
}

.history-item:hover {
  background: var(--primary-glow);
  transform: translateX(2px);
  border-left-color: var(--primary);
}

.timeline-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
  opacity: 0.8;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.4);
}

.history-body {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  overflow: hidden;
}

.history-time {
  font-size: 0.76rem;
  color: var(--text-muted);
  min-width: 52px;
  flex-shrink: 0;
}

.history-content {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  overflow: hidden;
}

.history-content :deep(.val) {
  font-family: var(--font-mono);
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 40%;
}

.history-content :deep(.arrow) {
  color: var(--primary);
  font-weight: 600;
  flex-shrink: 0;
}

.delete-btn {
  padding: 4px 8px;
  background: transparent;
  color: var(--text-muted);
  border: none;
  cursor: pointer;
  border-radius: var(--radius-pill);
  transition: all var(--transition-normal);
  opacity: 0.5;
  flex-shrink: 0;
}

.delete-btn:hover {
  background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
  color: white;
  opacity: 1;
  transform: scale(1.1);
}

@media (max-width: 500px) {
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 12px;
  }
  .timeline-dot {
    display: none;
  }
  .history-body {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
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
