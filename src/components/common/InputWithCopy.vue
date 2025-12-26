<template>
  <div class="input-group">
    <div class="input-header">
      <label v-if="label" :for="id" class="input-label">{{ label }}</label>
      <button
        v-if="allowPaste && canPaste"
        :title="t('common.paste')"
        type="button"
        class="paste-btn"
        @click="handlePaste"
      >
        clipboard {{ t('common.paste') }}
      </button>
    </div>
    <textarea
      :id="id"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      :maxlength="maxlength"
      :class="{ 'is-readonly': readonly }"
      class="custom-textarea"
      @input="handleInput"
    />
    <button
      v-if="modelValue && allowCopy"
      type="button"
      class="copy-btn-overlay"
      @click="handleCopy"
    >
      {{ t('common.copy') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  id: string;
  modelValue: string;
  label?: string;
  placeholder?: string;
  readonly?: boolean;
  allowPaste?: boolean;
  allowCopy?: boolean;
  maxlength?: number | string;
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: string): void;
  (_e: 'paste', _value: string): void;
  (_e: 'copy', _value: string): void;
}>();

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
  }
};

const handleCopy = async () => {
  if (!props.modelValue) return;
  try {
    await navigator.clipboard.writeText(props.modelValue);
    emit('copy', props.modelValue);
  } catch (err) {
    console.warn('Clipboard write failed:', err);
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
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.paste-btn,
.copy-btn-overlay {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-primary);
}
.paste-btn:hover,
.copy-btn-overlay:hover {
  background: var(--surface-hover);
  color: var(--primary);
}

.copy-btn-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: var(--surface-overlay);
  border: 1px solid var(--border);
}

.custom-textarea {
  display: block;
  width: 100%;
  height: 120px;
  padding: 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  background: var(--surface);
  color: var(--text-primary);
  resize: vertical;
  box-sizing: border-box;
}

.custom-textarea:focus {
  border-color: var(--primary);
  outline: none;
}

.custom-textarea.is-readonly {
  background: var(--surface-hover);
  color: var(--text-secondary);
}
</style>
