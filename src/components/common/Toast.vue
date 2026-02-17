<template>
  <Transition name="toast">
    <div v-if="visible" :class="type" class="toast">
      <span class="toast-icon">{{ icon }}</span>
      <span class="toast-message">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const visible = ref(false);
const message = ref('');
const type = ref<'success' | 'error' | 'info'>('info');
const icon = ref('ℹ️');

let timer: number | null = null;

const show = (msg: string, toastType: 'success' | 'error' | 'info' = 'info', duration = 2000) => {
  message.value = msg;
  type.value = toastType;

  switch (toastType) {
    case 'success':
      icon.value = '✅';
      break;
    case 'error':
      icon.value = '❌';
      break;
    default:
      icon.value = 'ℹ️';
  }

  visible.value = true;

  if (timer) clearTimeout(timer);
  timer = window.setTimeout(() => {
    visible.value = false;
  }, duration);
};

defineExpose({ show });
</script>

<style scoped>
.toast {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 9999;
  font-weight: 500;
  color: var(--text-primary);
  min-width: 200px;
  justify-content: center;
}

.toast.success {
  border-color: var(--primary);
  color: var(--primary);
}

.toast.error {
  border-color: #ef4444;
  color: #ef4444;
}

/* Transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 20px);
}
</style>
