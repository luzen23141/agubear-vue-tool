<template>
  <ToolPageLayout
    :title="t('qrcode.title')"
    :history="history"
    tool-key="qrcode"
    @clear-history="clearHistory"
    @remove-history="removeFromHistory"
  >
    <!-- Mode Tabs -->
    <div class="mode-tabs">
      <button
        v-for="m in ['text', 'wifi', 'contact']"
        :key="m"
        :class="[{ active: mode === m }]"
        :aria-pressed="mode === m"
        class="tab-btn"
        type="button"
        @click="mode = m as 'text' | 'wifi' | 'contact'"
      >
        {{ t(`qrcode.mode${m.charAt(0).toUpperCase() + m.slice(1)}`) }}
      </button>
    </div>

    <!-- Input Modes -->
    <div class="input-section">
      <QrWifiForm v-if="mode === 'wifi'" v-model="wifi" />
      <QrContactForm v-if="mode === 'contact'" v-model="contact" />
      <InputWithCopy
        v-if="mode === 'text'"
        id="qr-input"
        v-model="inputText"
        :placeholder="t(`qrcode.${mode}Placeholder`)"
        :aria-label="t(`qrcode.${mode}Aria`)"
        :maxlength="1000"
        allow-paste
      />
    </div>

    <!-- Control Panel -->
    <div class="controls-grid">
      <!-- Size -->
      <div class="control-item">
        <label for="qr-size">{{ t('qrcode.size', { n: qrOptions.qrSize }) }}</label>
        <input
          id="qr-size"
          v-model.number="qrOptions.qrSize"
          :aria-label="t('qrcode.sizeAria')"
          type="number"
          min="100"
          max="1000"
          step="10"
        />
      </div>

      <!-- Margin -->
      <div class="control-item">
        <label for="qr-margin">{{ t('qrcode.margin', { n: qrOptions.margin }) }}</label>
        <input
          id="qr-margin"
          v-model.number="qrOptions.margin"
          :aria-label="t('qrcode.marginAria')"
          type="number"
          min="0"
          max="50"
          step="1"
        />
      </div>

      <!-- Colors -->
      <div class="control-item color-control">
        <label for="qr-fg-color">{{ t('qrcode.fgColor') }}</label>
        <div class="color-picker-row">
          <input
            id="qr-fg-color"
            v-model="qrOptions.foregroundColor"
            :aria-label="t('qrcode.fgColorAria')"
            type="color"
          />
          <span class="color-hex">{{ qrOptions.foregroundColor }}</span>
        </div>
      </div>

      <div class="control-item color-control">
        <label for="qr-bg-color">{{ t('qrcode.bgColor') }}</label>
        <div class="color-picker-row">
          <input
            id="qr-bg-color"
            v-model="qrOptions.backgroundColor"
            :aria-label="t('qrcode.bgColorAria')"
            type="color"
          />
          <span class="color-hex">{{ qrOptions.backgroundColor }}</span>
        </div>
      </div>

      <!-- Error Correction -->
      <fieldset class="control-item ec-control">
        <legend class="input-label">{{ t('qrcode.errorCorrection') }}</legend>
        <div class="ec-options">
          <button
            v-for="ec in ecLevels"
            :key="ec.value"
            :class="[{ active: qrOptions.errorCorrectionLevel === ec.value }]"
            :aria-label="t('qrcode.ecAria', { level: ec.label })"
            :aria-pressed="qrOptions.errorCorrectionLevel === ec.value"
            type="button"
            class="ec-btn"
            @click="qrOptions.errorCorrectionLevel = ec.value"
          >
            {{ ec.label }}
          </button>
        </div>
      </fieldset>
    </div>

    <!-- Preview Section -->
    <div v-if="finalQrText" class="preview-section mt-8">
      <h2 class="text-center text-1.1rem font-600 mb-6">{{ t('qrcode.preview') }}</h2>
      <div class="canvas-wrapper">
        <canvas
          ref="canvasRef"
          :draggable="hasQrCode"
          :title="t('qrcode.dragTitle')"
          class="qr-canvas"
          @dragstart="onDragStart"
        />
      </div>

      <div v-if="hasQrCode" class="action-bar">
        <button
          :aria-label="t('qrcode.downloadAria')"
          type="button"
          class="action-btn download-btn"
          @click="downloadPng"
        >
          {{ downloadTriggered ? t('qrcode.downloaded') : t('qrcode.downloadPng') }}
        </button>
        <button
          :aria-label="t('qrcode.copyAria')"
          type="button"
          class="action-btn copy-btn"
          @click="copyToClipboard"
        >
          {{ copySuccess ? t('qrcode.copied') : t('qrcode.copyImage') }}
        </button>
        <button
          :aria-label="t('qrcode.recordAria')"
          type="button"
          class="action-btn record-btn"
          @click="recordToHistory"
        >
          {{ t('qrcode.record') }}
        </button>
      </div>
      <p v-if="hasQrCode" class="hint">{{ t('qrcode.dragHint') }}</p>
    </div>

    <template #history-item="{ item }">
      <div class="history-qr-preview">
        <img
          v-if="(item.extra as any)?.dataUrl"
          :src="(item.extra as any).dataUrl"
          alt="QR Preview"
        />
      </div>
      <div class="history-details">
        <span class="val">{{ item.input }}</span>
        <span class="config-val">{{ item.output }}</span>
      </div>
    </template>
  </ToolPageLayout>
</template>

<script setup lang="ts">
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import ToolPageLayout from '@/components/layout/ToolPageLayout.vue';
import InputWithCopy from '@/components/common/InputWithCopy.vue';
import { UseHistory } from '@/composables/use-history';
import { UseQrCode } from '@/composables/use-qr-code';
import QrWifiForm from '@/components/qrcode/QrWifiForm.vue';
import QrContactForm from '@/components/qrcode/QrContactForm.vue';

const { t } = useI18n();
const { history, addToHistory, clearHistory, removeFromHistory } = UseHistory();
const canvasRef = ref<HTMLCanvasElement | null>(null);

const {
  mode,
  inputText,
  wifi,
  contact,
  qrOptions,
  finalQrText,
  hasQrCode,
  copySuccess,
  downloadTriggered,
  downloadPng,
  copyToClipboard,
  onDragStart,
  recordToHistory
} = UseQrCode(canvasRef, addToHistory);

const ecLevels: { value: QRCodeErrorCorrectionLevel; label: string }[] = [
  { value: 'low', label: 'L (7%)' },
  { value: 'medium', label: 'M (15%)' },
  { value: 'quartile', label: 'Q (25%)' },
  { value: 'high', label: 'H (30%)' }
];

defineExpose({
  mode,
  inputText,
  wifi,
  contact,
  qrOptions,
  hasQrCode,
  copySuccess,
  downloadTriggered,
  downloadPng,
  copyToClipboard,
  onDragStart,
  recordToHistory,
  canvasRef
});
</script>

<style scoped>
.mode-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
}

.tab-btn.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}

.tab-btn:hover:not(.active) {
  background: var(--surface-hover);
}

.input-section {
  margin-bottom: 2rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
  background: var(--background-alt);
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.control-item input[type='number'] {
  padding: 8px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  background: var(--surface);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}

.control-item input[type='number']:focus {
  border-color: var(--primary);
  outline: none;
}

.color-picker-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker-row input[type='color'] {
  width: 42px;
  height: 38px;
  padding: 2px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: var(--surface);
}

.color-hex {
  font-family: inherit;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.ec-control {
  grid-column: 1 / -1;
  border: none;
  padding: 0;
  margin: 0;
}

.ec-control legend {
  padding: 0;
  margin-bottom: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.ec-options {
  display: flex;
  gap: 8px;
}

.ec-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.ec-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.ec-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: var(--text-on-primary);
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.canvas-wrapper {
  padding: 24px;
  background: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
  border: 1px solid var(--border);
}

.qr-canvas {
  display: block;
  max-width: 100%;
  height: auto;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  padding: 10px 20px;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all var(--transition-fast);
}

.download-btn {
  background: var(--primary);
  color: var(--text-on-primary);
}

.download-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.copy-btn,
.record-btn {
  background: var(--surface);
  color: var(--text-secondary);
  border: 1px solid var(--border);
}

.copy-btn:hover,
.record-btn:hover {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: var(--primary);
}

.hint {
  font-size: 0.85rem;
  color: var(--text-muted);
  text-align: center;
  margin-top: 1rem;
}

.history-qr-preview {
  width: 40px;
  height: 40px;
  background: white;
  padding: 2px;
  border-radius: 4px;
  border: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-qr-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.history-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.config-val {
  font-size: 0.75rem;
  color: var(--text-muted);
}
</style>
