<template>
  <div class="color-converter">
    <div class="description-card">
      <p>{{ t('color.description') }}</p>
    </div>

    <BaseCard :title="t('color.title')">
      <div class="converter-grid">
        <!-- Color Picker & Preview -->
        <div class="picker-section">
          <div :style="{ backgroundColor: hexValue }" class="color-preview" />
          <input v-model="hexValue" type="color" class="native-picker" @input="updateFromPicker" />
        </div>

        <!-- Inputs -->
        <div class="inputs-section">
          <!-- HEX -->
          <div class="input-group">
            <label>HEX</label>
            <div class="input-wrapper">
              <input v-model="hexInput" type="text" placeholder="#000000" @input="updateFromHex" />
              <button type="button" class="copy-btn" @click="copy(hexInput)">
                <SvgIcon name="copy" />
              </button>
            </div>
          </div>

          <!-- RGB -->
          <div class="input-group">
            <label>RGB</label>
            <div class="input-wrapper">
              <input
                v-model="rgbInput"
                type="text"
                placeholder="rgb(0, 0, 0)"
                @input="updateFromRgb"
              />
              <button type="button" class="copy-btn" @click="copy(rgbInput)">
                <SvgIcon name="copy" />
              </button>
            </div>
          </div>

          <!-- HSL -->
          <div class="input-group">
            <label>HSL</label>
            <div class="input-wrapper">
              <input
                v-model="hslInput"
                type="text"
                placeholder="hsl(0, 0%, 0%)"
                @input="updateFromHsl"
              />
              <button type="button" class="copy-btn" @click="copy(hslInput)">
                <SvgIcon name="copy" />
              </button>
            </div>
          </div>

          <!-- CMYK -->
          <div class="input-group">
            <label>CMYK</label>
            <div class="input-wrapper">
              <input
                v-model="cmykInput"
                type="text"
                placeholder="cmyk(0%, 0%, 0%, 100%)"
                @input="updateFromCmyk"
              />
              <button type="button" class="copy-btn" @click="copy(cmykInput)">
                <SvgIcon name="copy" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </BaseCard>

    <ToolContext tool-key="color" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { colord, extend, type Colord } from 'colord';
import cmykPlugin from 'colord/plugins/cmyk';
import namesPlugin from 'colord/plugins/names';
import BaseCard from './common/BaseCard.vue';
import ToolContext from './common/ToolContext.vue';
import SvgIcon from './icons/SvgIcon.vue';

// Extend colord
extend([cmykPlugin, namesPlugin]);

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.color')} - ${t('app.title')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('seo.colorDescription'))
    }
  ]
});

type ToastFunction = (_msg: string, _type: 'success' | 'error' | 'info') => void;
const showToast = inject('showToast', (() => {}) as ToastFunction);

// State
const hexValue = ref('#2d9d6a'); // Internal source of truth for color state (picker)
const hexInput = ref('#2d9d6a');
const rgbInput = ref('rgb(45, 157, 106)');
const hslInput = ref('hsl(153, 55%, 40%)');
const cmykInput = ref('device-cmyk(71%, 0%, 32%, 38%)');

// Sync functions
const syncAll = (color: Colord) => {
  if (color.isValid()) {
    hexValue.value = color.toHex();
    hexInput.value = color.toHex();
    rgbInput.value = color.toRgbString();
    hslInput.value = color.toHslString();
    cmykInput.value = color.toCmykString();
  }
};

const updateFromPicker = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const c = colord(target.value);
  syncAll(c);
};

const updateFromHex = () => {
  const c = colord(hexInput.value);
  if (c.isValid()) syncAll(c);
};

const updateFromRgb = () => {
  const c = colord(rgbInput.value);
  if (c.isValid()) syncAll(c);
};

const updateFromHsl = () => {
  const c = colord(hslInput.value);
  if (c.isValid()) syncAll(c);
};

const updateFromCmyk = () => {
  const c = colord(cmykInput.value);
  if (c.isValid()) syncAll(c);
};

const copy = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast(t('common.copied'), 'success');
  } catch (_err) {
    console.error(_err);
    showToast('Failed to copy', 'error');
  }
};
</script>

<style scoped>
.color-converter {
  width: 100%;
}

.description-card {
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}

.converter-grid {
  display: flex;
  flex-direction: column;
  gap: 2rem;
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
  gap: 1rem;
  align-items: center;
  flex: 0 0 200px;
}

.color-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  border: 4px solid var(--surface);
  box-shadow: var(--shadow-md);
  transition: background-color 0.2s;
}

.native-picker {
  width: 100%;
  height: 50px;
  cursor: pointer;
  border: none;
  background: transparent;
}

/* Inputs */
.inputs-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-group label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.input-wrapper {
  display: flex;
  gap: 8px;
}

.input-wrapper input {
  flex: 1;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-family: 'SF Mono', monospace;
  font-size: 0.95rem;
}

.input-wrapper input:focus {
  outline: 2px solid var(--primary-soft);
  border-color: var(--primary);
}

.copy-btn {
  padding: 0 12px;
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 1.1rem;
  transition: all var(--transition-fast);
}

.copy-btn:hover {
  background: var(--primary-soft);
  border-color: var(--primary);
}
</style>
