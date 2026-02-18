<template>
  <div class="input-group">
    <div class="input-header">
      <label v-if="label" :for="id" class="input-label">{{ label }}</label>
      <button
        v-if="allowPaste && canPaste"
        :title="t('common.paste')"
        type="button"
        class="action-btn paste-btn"
        @click="handlePaste"
      >
        📋 {{ t('common.paste') }}
      </button>
    </div>
    <div class="textarea-wrapper">
      <textarea
        :id="id"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        :maxlength="maxlength"
        :inputmode="inputmode"
        :spellcheck="spellcheck"
        :class="{ 'is-readonly': readonly }"
        class="custom-textarea"
        @input="handleInput"
      />
      <button
        v-if="modelValue && allowCopy"
        type="button"
        class="action-btn copy-btn-overlay"
        @click="handleCopy"
      >
        📋 {{ t('common.copy') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, inject } from 'vue';
import { useI18n } from 'vue-i18n';

type ToastFunction = (_msg: string, _type: 'success' | 'error' | 'info') => void;

const props = withDefaults(
  defineProps<{
    id: string;
    modelValue: string;
    label?: string;
    placeholder?: string;
    readonly?: boolean;
    allowPaste?: boolean;
    allowCopy?: boolean;
    maxlength?: number | string;
    inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
    spellcheck?: boolean;
  }>(),
  {
    label: '',
    placeholder: '',
    maxlength: undefined,
    inputmode: 'text'
  }
);

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: string): void;
  (_e: 'paste', _value: string): void;
  (_e: 'copy', _value: string): void;
}>();

const showToast = inject('showToast', (() => {}) as ToastFunction);
const { t } = useI18n();

const canPaste = ref(false);

onMounted(() => {
  if (navigator.clipboard) {
    canPaste.value = true;
  }
});

const handleInput = (event: Event) => {
  const { value } = event.target as HTMLTextAreaElement;
  emit('update:modelValue', value);
};

const handlePaste = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      emit('update:modelValue', text);
      emit('paste', text);
    }
  } catch (err) {
    console.warn('Clipboard read failed:', err);
    showToast('Failed to paste', 'error');
  }
};

const handleCopy = async () => {
  if (!props.modelValue) return;
  try {
    await navigator.clipboard.writeText(props.modelValue);
    emit('copy', props.modelValue);
    showToast(t('common.copied') || 'Copied!', 'success');
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    showToast('Failed to copy', 'error');
  }
};
</script>

<style scoped>
.input-group {
  position: relative;
  margin-bottom: 0.5rem;
}

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.input-label {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--glass-bg);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.78rem;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all var(--transition-normal);
}

.action-btn:hover {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: var(--primary);
  transform: scale(1.02);
}

.textarea-wrapper {
  position: relative;
}

.copy-btn-overlay {
  position: absolute;
  bottom: 10px;
  right: 10px;
}

.custom-textarea {
  display: block;
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-family: var(--font-mono);
  background: var(--surface);
  color: var(--text-primary);
  resize: vertical;
  box-sizing: border-box;
  transition:
    border-color var(--transition-normal),
    box-shadow var(--transition-normal);
}

.custom-textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow:
    var(--shadow-focus),
    inset 0 1px 3px rgba(0, 0, 0, 0.03);
}

.custom-textarea.is-readonly {
  background: var(--surface-hover);
  color: var(--text-secondary);
}

.custom-textarea::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}
</style>
