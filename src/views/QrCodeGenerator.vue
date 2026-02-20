<template>
  <div class="qrcode-generator">
    <!-- Main Configuration Card -->
    <BaseCard :title="t('qrcode.title')">
      <!-- Mode Tabs -->
      <div class="mode-tabs">
        <button
          :class="[{ active: mode === 'text' }]"
          class="tab-btn"
          type="button"
          @click="mode = 'text'"
        >
          {{ t('qrcode.modeText') }}
        </button>
        <button
          :class="[{ active: mode === 'wifi' }]"
          class="tab-btn"
          type="button"
          @click="mode = 'wifi'"
        >
          {{ t('qrcode.modeWifi') }}
        </button>
        <button
          :class="[{ active: mode === 'contact' }]"
          class="tab-btn"
          type="button"
          @click="mode = 'contact'"
        >
          {{ t('qrcode.modeContact') }}
        </button>
      </div>

      <!-- Input Modes -->
      <QrWifiForm v-if="mode === 'wifi'" v-model="wifi" :can-paste="canPaste" @paste="pasteInput" />
      <QrContactForm
        v-if="mode === 'contact'"
        v-model="contact"
        :can-paste="canPaste"
        @paste="pasteInput"
      />
      <div v-if="mode === 'text'" class="text-input-wrapper">
        <textarea
          id="qr-input"
          v-model="inputText"
          :placeholder="t(`qrcode.${mode}Placeholder`)"
          :aria-label="t(`qrcode.${mode}Aria`)"
        />
        <button
          v-if="canPaste"
          :title="t('common.paste')"
          type="button"
          class="paste-btn"
          @click="pasteInput"
        >
          <SvgIcon name="clipboard" size="1.2rem" />
        </button>
      </div>

      <!-- Control Panel (Common) -->
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

        <!-- Foreground Color -->
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

        <!-- Background Color -->
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

        <!-- Error Correction Level -->
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
    </BaseCard>

    <!-- Preview & Action Card -->
    <BaseCard v-if="finalQrText" :title="t('qrcode.preview')" class="preview-card">
      <div class="canvas-wrapper">
        <canvas
          ref="canvasRef"
          :draggable="hasQrCode"
          :title="t('qrcode.dragTitle')"
          class="qr-canvas"
          @dragstart="onDragStart"
        />
      </div>

      <template #footer>
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
      </template>
    </BaseCard>

    <!-- History List -->
    <HistoryList :history="history" @clear="clearHistory" @remove="removeFromHistory">
      <template #item="{ item }">
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
    </HistoryList>
  </div>
</template>

<script setup lang="ts">
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import BaseCard from '@/components/common/BaseCard.vue';
import SvgIcon from '@/components/icons/SvgIcon.vue';
import HistoryList from '@/components/common/HistoryList.vue';
import { UseHistory } from '@/composables/use-history';
import { UseQrCode } from '@/composables/use-qr-code';
import QrWifiForm from '@/components/qrcode/QrWifiForm.vue';
import QrContactForm from '@/components/qrcode/QrContactForm.vue';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('app.tabs.qrcode')} - ${t('app.title')}`),
  meta: [{ name: 'description', content: computed(() => t('seo.description')) }]
});

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
  canPaste,
  downloadPng,
  copyToClipboard,
  onDragStart,
  recordToHistory,
  pasteInput
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
  canPaste,
  downloadPng,
  copyToClipboard,
  onDragStart,
  recordToHistory,
  pasteInput,
  canvasRef
});
</script>

<style scoped>
.qrcode-generator {
  width: 100%;
}
.mode-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 15px;
}
.tab-btn {
  padding: 8px 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.95rem;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}
.tab-btn.active {
  background: var(--primary-soft);
  color: var(--primary);
  font-weight: 600;
}
.tab-btn:hover:not(.active) {
  background: var(--surface-hover);
}
.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
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
.control-item input[type='number'],
.control-item select {
  padding: 8px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  background: var(--surface);
  color: var(--text-primary);
  transition: border-color var(--transition-fast);
}
.control-item input[type='number']:focus,
.control-item select:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: var(--shadow-focus);
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
  font-family: 'SF Mono', 'Cascadia Code', 'Fira Code', 'Courier New', monospace;
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
}
.ec-options {
  display: flex;
  gap: 6px;
}
.ec-btn {
  flex: 1;
  padding: 8px 10px;
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
  background: var(--primary-soft);
}
.ec-btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 2px 8px rgba(45, 157, 106, 0.25);
}
.preview-card {
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
canvas {
  display: block;
  max-width: 100%;
  height: auto;
}
.action-bar {
  display: flex;
  justify-content: center;
  gap: 12px;
  flex-wrap: wrap;
  width: 100%;
}
.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
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
  color: white;
}
.download-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(45, 157, 106, 0.3);
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
  transform: translateY(-1px);
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
  overflow: hidden;
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
  overflow: hidden;
}
.config-val {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.text-input-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
}
.text-input-wrapper textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  padding-right: 45px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 1rem;
  resize: vertical;
  transition: border-color 0.2s;
}
.text-input-wrapper textarea:focus {
  border-color: var(--primary);
  outline: none;
  box-shadow: var(--shadow-focus);
}
.text-input-wrapper .paste-btn {
  position: absolute;
  right: 10px;
  top: 10px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.2s;
  z-index: 1;
}
.text-input-wrapper .paste-btn:hover {
  background: var(--primary-soft);
  color: var(--primary);
  border-color: var(--primary);
  transform: scale(1.05);
}
</style>
