<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="isOpen" class="cmd-overlay" @click="close">
        <div class="cmd-modal" @click.stop>
          <div class="cmd-header">
            <input
              ref="inputRef"
              v-model="searchQuery"
              :placeholder="t('cmd.placeholder')"
              type="text"
              class="cmd-input"
              @keydown="onKeydown"
            />
            <span class="cmd-badge">ESC</span>
          </div>
          <div class="cmd-body">
            <div v-if="results.length === 0" class="cmd-empty">
              {{ t('cmd.noResults') }}
            </div>
            <ul v-else class="cmd-list" role="listbox">
              <li
                v-for="(item, index) in results"
                :key="item.item.id"
                :class="[{ active: selectedIndex === index }]"
                :aria-selected="selectedIndex === index"
                class="cmd-item"
                role="option"
                @click="execute(item.item)"
                @mouseenter="selectedIndex = index"
              >
                <div class="cmd-icon">{{ item.item.icon }}</div>
                <div class="cmd-content">
                  <div class="cmd-title">{{ item.item.title }}</div>
                  <div class="cmd-desc">{{ item.item.description || item.item.category }}</div>
                </div>
                <div v-if="item.item.shortcut" class="cmd-shortcut">
                  {{ item.item.shortcut }}
                </div>
              </li>
            </ul>
          </div>
          <div class="cmd-footer">
            <span>{{ t('cmd.navHint') }}</span>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';

import { useMagicKeys, whenever } from '@vueuse/core';
import Fuse from 'fuse.js';

import { useCommands } from '@/composables/useCommands';

const { t } = useI18n();
const { commands } = useCommands();

// ── State ──
const isOpen = ref(false);
const searchQuery = ref('');
const selectedIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);

// ── Fuse.js ──
const fuse = computed(
  () =>
    new Fuse(commands.value, {
      keys: ['title', 'category', 'description'],
      threshold: 0.3
    })
);

const results = computed(() => {
  if (!searchQuery.value) {
    return commands.value.map((item) => ({ item }));
  }
  return fuse.value.search(searchQuery.value);
});

// ── Keyboard Shortcuts ──
const { Meta_K: metaK, Ctrl_K: ctrlK, Escape } = useMagicKeys();

whenever(
  () => metaK?.value || ctrlK?.value,
  () => {
    isOpen.value = true;
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
);

if (Escape) {
  whenever(Escape, () => {
    close();
  });
}

// ── Navigation Logic ──
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value + 1) % results.value.length;
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length;
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const selected = results.value[selectedIndex.value];
    if (selected) {
      execute(selected.item);
    }
  }
};

const execute = (command: Command) => {
  command.action();
  close();
};

const close = () => {
  isOpen.value = false;
  searchQuery.value = '';
  selectedIndex.value = 0;
};

// Reset selection on search
watch(searchQuery, () => {
  selectedIndex.value = 0;
});
</script>

<style scoped>
.cmd-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20vh;
}

.cmd-modal {
  width: 100%;
  max-width: 600px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideIn 0.2s ease-out;
}

.cmd-header {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.cmd-input {
  flex: 1;
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: var(--text-primary);
  outline: none;
}

.cmd-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  background: var(--surface-hover);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-weight: 600;
}

.cmd-body {
  max-height: 400px;
  overflow-y: auto;
}

.cmd-empty {
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
}

.cmd-list {
  list-style: none;
  margin: 0;
  padding: 8px;
}

.cmd-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.1s;
}

.cmd-item.active {
  background: var(--primary-soft);
}

.cmd-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.cmd-content {
  flex: 1;
}

.cmd-title {
  font-weight: 500;
  color: var(--text-primary);
}

.cmd-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.cmd-shortcut {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.cmd-footer {
  padding: 8px 16px;
  background: var(--surface-hover);
  border-top: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 0.8rem;
  text-align: right;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
