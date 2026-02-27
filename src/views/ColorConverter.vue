<template>
  <ToolPageLayout :title="t('color.title')" tool-key="color">
    <div class="converter-grid">
      <!-- Color Picker & Preview -->
      <div class="picker-section">
        <div :style="{ backgroundColor: hexValue }" class="color-preview" />
        <input v-model="hexValue" type="color" class="native-picker" @input="updateFromPicker" />
        <div class="hex-label">{{ hexValue.toUpperCase() }}</div>
      </div>

      <!-- Inputs -->
      <div class="inputs-section">
        <!-- HEX -->
        <InputWithCopy
          id="color-hex"
          v-model="hexInput"
          label="HEX"
          placeholder="#000000"
          allow-copy
          @update:model-value="updateFromHex"
        />

        <!-- RGB -->
        <InputWithCopy
          id="color-rgb"
          v-model="rgbInput"
          label="RGB"
          placeholder="rgb(0, 0, 0)"
          allow-copy
          @update:model-value="updateFromRgb"
        />

        <!-- HSL -->
        <InputWithCopy
          id="color-hsl"
          v-model="hslInput"
          label="HSL"
          placeholder="hsl(0, 0%, 0%)"
          allow-copy
          @update:model-value="updateFromHsl"
        />

        <!-- CMYK -->
        <InputWithCopy
          id="color-cmyk"
          v-model="cmykInput"
          label="CMYK"
          placeholder="cmyk(0%, 0%, 0%, 100%)"
          allow-copy
          @update:model-value="updateFromCmyk"
        />
      </div>
    </div>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import { UseColorConverter } from '@/composables/use-color-converter';

const { t } = useI18n();

const {
  hexValue,
  hexInput,
  rgbInput,
  hslInput,
  cmykInput,
  updateFromPicker,
  updateFromHex,
  updateFromRgb,
  updateFromHsl,
  updateFromCmyk
} = UseColorConverter();
</script>

<style scoped>
.converter-grid {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  padding: 1rem 0;
}

@media (min-width: 768px) {
  .converter-grid {
    flex-direction: row;
    align-items: flex-start;
  }
}

/* Picker */
.picker-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
  flex: 0 0 220px;
  padding: 1.5rem;
  background: var(--background-alt);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
}

.color-preview {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  border: 6px solid var(--surface);
  box-shadow: var(--shadow-lg);
  transition: background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.native-picker {
  width: 100%;
  height: 48px;
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  padding: 4px;
}

.hex-label {
  font-family: 'SF Mono', 'Cascadia Code', monospace;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text-primary);
  letter-spacing: 0.05em;
}

/* Inputs */
.inputs-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

:deep(.input-group) {
  margin-bottom: 0;
}

:deep(.custom-textarea) {
  height: 48px !important;
  min-height: 48px !important;
  resize: none;
  font-size: 1rem;
  line-height: 28px;
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
