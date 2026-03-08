<template>
  <ToolPageLayout :title="t('color.title')" tool-key="color">
    <div class="converter-grid color-layout">
      <section class="picker-section card">
        <div :style="{ backgroundColor: hexValue }" class="color-preview" />
        <input v-model="hexValue" type="color" class="native-picker" @input="updateFromPicker" />
        <div class="hex-label">{{ hexValue.toUpperCase() }}</div>
      </section>

      <section class="inputs-section">
        <InputWithCopy
          id="color-hex"
          v-model="hexInput"
          label="HEX"
          placeholder="#000000"
          allow-copy
          @update:model-value="updateFromHex"
        />

        <InputWithCopy
          id="color-rgb"
          v-model="rgbInput"
          label="RGB"
          placeholder="rgb(0, 0, 0)"
          allow-copy
          @update:model-value="updateFromRgb"
        />

        <InputWithCopy
          id="color-hsl"
          v-model="hslInput"
          label="HSL"
          placeholder="hsl(0, 0%, 0%)"
          allow-copy
          @update:model-value="updateFromHsl"
        />

        <InputWithCopy
          id="color-cmyk"
          v-model="cmykInput"
          label="CMYK"
          placeholder="cmyk(0%, 0%, 0%, 100%)"
          allow-copy
          @update:model-value="updateFromCmyk"
        />
      </section>
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
.color-layout {
  align-items: start;
}

.picker-section {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: center;
  justify-content: center;
  min-height: 100%;
}

.color-preview {
  width: min(180px, 100%);
  aspect-ratio: 1;
  border-radius: 50%;
  border: 6px solid var(--surface);
  box-shadow: var(--shadow-lg);
  transition: background-color var(--transition-normal);
}

.native-picker {
  width: min(100%, 240px);
  height: 52px;
  cursor: pointer;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  background: var(--surface);
  padding: 4px;
}

.hex-label {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-primary);
  letter-spacing: 0.08em;
}

.inputs-section {
  display: grid;
  gap: 1rem;
  width: 100%;
}

:deep(.input-group) {
  margin-bottom: 0;
}

:deep(.custom-textarea) {
  height: 52px !important;
  min-height: 52px !important;
  resize: none;
  font-size: 1rem;
  line-height: 1.4;
  padding-top: 0.8rem;
  padding-bottom: 0.8rem;
}
</style>
