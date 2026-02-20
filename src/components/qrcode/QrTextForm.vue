<template>
  <div class="input-group">
    <div class="input-header">
      <label for="qr-input" class="input-label">{{ t('qrcode.contentLabel') }}</label>
      <button
        v-if="canPaste"
        :title="t('common.paste')"
        type="button"
        class="paste-btn"
        @click="emit('paste')"
      >
        <SvgIcon name="clipboard-paste" /> {{ t('common.paste') }}
      </button>
    </div>
    <textarea
      id="qr-input"
      :value="modelValue"
      :placeholder="t('qrcode.placeholder')"
      :aria-label="t('qrcode.inputAria')"
      maxlength="2048"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import SvgIcon from '@/components/icons/SvgIcon.vue';

defineProps<{
  modelValue: string;
  canPaste: boolean;
}>();

const emit = defineEmits(['update:modelValue', 'paste']);
const { t } = useI18n();
</script>

<style scoped>
.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}
.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-secondary);
}
.input-group textarea {
  display: block;
  width: 100%;
  height: 100px;
  min-height: 80px;
  max-height: 150px;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-family: inherit;
  background: var(--surface);
  color: var(--text-primary);
  resize: vertical;
  box-sizing: border-box;
  transition: border-color var(--transition-fast);
}
.input-group textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: var(--shadow-focus);
}
.paste-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 4px;
}
.paste-btn:hover {
  background: var(--surface-hover);
  color: var(--primary);
}
</style>
