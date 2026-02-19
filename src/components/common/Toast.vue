<template>
  <Transition name="toast">
    <div
      v-if="visible"
      :class="type"
      class="fixed bottom-8 left-50% -translate-x-50% flex items-center gap-3 px-6 py-3 bg-[var(--surface-raised)] border border-[var(--border)] rounded-md shadow-lg z-9999 font-500 text-[var(--text-primary)] min-w-200px justify-center"
    >
      <span class="inline-flex items-center"><SvgIcon :name="icon" size="1.1rem" /></span>
      <span>{{ message }}</span>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import SvgIcon from '../icons/SvgIcon.vue';

const visible = ref(false);
const message = ref('');
const type = ref<'success' | 'error' | 'info'>('info');
const icon = ref('info');

let timer: number | null = null;

const show = (msg: string, toastType: 'success' | 'error' | 'info' = 'info', duration = 2000) => {
  message.value = msg;
  type.value = toastType;

  switch (toastType) {
    case 'success':
      icon.value = 'check-circle';
      break;
    case 'error':
      icon.value = 'x-circle';
      break;
    default:
      icon.value = 'info';
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
.success {
  border-color: var(--primary);
  color: var(--primary);
}
.error {
  border-color: #ef4444;
  color: #ef4444;
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
