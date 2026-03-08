<template>
  <Transition name="toast">
    <div v-if="visible" :class="[`toast--${type}`]" class="toast">
      <span class="toast-icon"><SvgIcon :name="icon" size="1.1rem" /></span>
      <span class="toast-message">{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SvgIcon from '../icons/SvgIcon.vue';

type ToastType = 'success' | 'error' | 'info';

function getToastIcon(toastType: ToastType) {
  switch (toastType) {
    case 'success': {
      return 'check-circle';
    }
    case 'error': {
      return 'x-circle';
    }
    case 'info': {
      return 'info';
    }
  }
}

const visible = ref(false);
const message = ref('');
const type = ref<ToastType>('info');
const icon = ref('info');

let timer: ReturnType<typeof setTimeout> | null = null;

const show = (message_: string, toastType: ToastType = 'info', duration = 2000) => {
  message.value = message_;
  type.value = toastType;
  icon.value = getToastIcon(toastType);
  visible.value = true;

  if (timer) clearTimeout(timer);
  timer = globalThis.setTimeout(() => {
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
  justify-content: center;
  gap: 12px;
  min-width: 200px;
  padding: 12px 24px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface-raised);
  color: var(--text-primary);
  box-shadow: var(--shadow-lg);
  z-index: 9999;
  font-weight: 500;
}

.toast-icon {
  display: inline-flex;
  align-items: center;
}

.toast-message {
  line-height: 1.4;
}

.toast--success {
  border-color: var(--primary);
  color: var(--primary);
}

.toast--error {
  border-color: var(--status-danger);
  color: var(--status-danger);
}
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
