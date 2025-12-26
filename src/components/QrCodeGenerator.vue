<template>
  <div class="qrcode-generator">
    <!-- 主設定卡片 -->
    <BaseCard :title="t('qrcode.title')">
      <!-- 文字輸入 -->
      <div class="input-group">
        <div class="input-header">
          <label for="qr-input" class="input-label">{{ t('qrcode.contentLabel') }}</label>
          <button
            v-if="canPaste"
            :title="t('common.paste')"
            type="button"
            class="paste-btn"
            @click="pasteInput"
          >
            📋 {{ t('common.paste') }}
          </button>
        </div>
        <textarea
          id="qr-input"
          v-model="inputText"
          :placeholder="t('qrcode.placeholder')"
          :aria-label="t('qrcode.inputAria')"
          maxlength="2048"
        />
      </div>

      <!-- 控制面板 -->
      <div class="controls-grid">
        <!-- 尺寸 -->
        <div class="control-item">
          <label for="qr-size">{{ t('qrcode.size', { n: qrSize }) }}</label>
          <input
            id="qr-size"
            v-model.number="qrSize"
            :aria-label="t('qrcode.sizeAria')"
            type="number"
            min="100"
            max="1000"
            step="10"
          />
        </div>

        <!-- 邊距 -->
        <div class="control-item">
          <label for="qr-margin">{{ t('qrcode.margin', { n: margin }) }}</label>
          <input
            id="qr-margin"
            v-model.number="margin"
            :aria-label="t('qrcode.marginAria')"
            type="number"
            min="0"
            max="50"
            step="1"
          />
        </div>

        <!-- 前景色 -->
        <div class="control-item color-control">
          <label for="qr-fg-color">{{ t('qrcode.fgColor') }}</label>
          <div class="color-picker-row">
            <input
              id="qr-fg-color"
              v-model="foregroundColor"
              :aria-label="t('qrcode.fgColorAria')"
              type="color"
            />
            <span class="color-hex">{{ foregroundColor }}</span>
          </div>
        </div>

        <!-- 背景色 -->
        <div class="control-item color-control">
          <label for="qr-bg-color">{{ t('qrcode.bgColor') }}</label>
          <div class="color-picker-row">
            <input
              id="qr-bg-color"
              v-model="backgroundColor"
              :aria-label="t('qrcode.bgColorAria')"
              type="color"
            />
            <span class="color-hex">{{ backgroundColor }}</span>
          </div>
        </div>

        <!-- 錯誤校正等級 -->
        <fieldset class="control-item ec-control">
          <legend class="input-label">{{ t('qrcode.errorCorrection') }}</legend>
          <div class="ec-options">
            <button
              v-for="ec in ecLevels"
              :key="ec.value"
              :class="[{ active: errorCorrectionLevel === ec.value }]"
              :aria-label="t('qrcode.ecAria', { level: ec.label })"
              :aria-pressed="errorCorrectionLevel === ec.value"
              type="button"
              class="ec-btn"
              @click="errorCorrectionLevel = ec.value"
            >
              {{ ec.label }}
            </button>
          </div>
        </fieldset>
      </div>
    </BaseCard>

    <!-- 預覽 & 操作卡片 -->
    <BaseCard v-if="inputText" :title="t('qrcode.preview')" class="preview-card">
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

    <!-- 歷史紀錄 -->
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
import { ref, watch, nextTick, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseCard from './common/BaseCard.vue';
import HistoryList from './common/HistoryList.vue';
import QRCode from 'qrcode';
import { useHistory } from '../composables/useHistory';

const { t } = useI18n();

const { history, addToHistory, clearHistory, removeFromHistory } = useHistory();

// ── 輸入狀態 ──
const inputText = ref('');
const qrSize = ref(256);
const foregroundColor = ref('#000000');
const backgroundColor = ref('#ffffff');
const errorCorrectionLevel = ref('M');
const margin = ref(4);

// ── Canvas 參照 ──
const canvasRef = ref<HTMLCanvasElement | null>(null);
const hasQrCode = ref(false);
const copySuccess = ref(false);
const downloadTriggered = ref(false);

// ── 錯誤校正等級選項 ──
const ecLevels = [
  { value: 'L', label: 'L (7%)' },
  { value: 'M', label: 'M (15%)' },
  { value: 'Q', label: 'Q (25%)' },
  { value: 'H', label: 'H (30%)' }
];

// ── 產生 QR Code ──
const generateQrCode = async () => {
  if (!inputText.value || !canvasRef.value) {
    hasQrCode.value = false;
    return;
  }

  try {
    await QRCode.toCanvas(canvasRef.value, inputText.value, {
      width: qrSize.value,
      margin: margin.value,
      color: {
        dark: foregroundColor.value,
        light: backgroundColor.value
      },
      errorCorrectionLevel: errorCorrectionLevel.value as QRCode.QRCodeErrorCorrectionLevel
    });
    hasQrCode.value = true;
  } catch (err) {
    console.warn('QR Code generation failed:', err);
    hasQrCode.value = false;
  }
};

// ── 監聽輸入變化，即時更新 ──
watch(
  [inputText, qrSize, foregroundColor, backgroundColor, errorCorrectionLevel, margin],
  () => {
    nextTick(generateQrCode);
  },
  { immediate: true }
);

// ── 下載 PNG ──
const downloadPng = () => {
  if (!canvasRef.value || !hasQrCode.value) return;
  const link = document.createElement('a');
  link.download = `qrcode-${Date.now()}.png`;
  link.href = canvasRef.value.toDataURL('image/png');
  link.click();

  downloadTriggered.value = true;
  setTimeout(() => {
    downloadTriggered.value = false;
  }, 1500);
};

// ── 複製到剪貼簿 ──
const copyToClipboard = async () => {
  if (!canvasRef.value || !hasQrCode.value) return;
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      if (!canvasRef.value) {
        resolve(null);
        return;
      }
      canvasRef.value.toBlob((res) => {
        resolve(res);
      }, 'image/png');
    });
    if (blob) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      copySuccess.value = true;
      setTimeout(() => {
        copySuccess.value = false;
      }, 1500);
    }
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    // 瀏覽器不支援或權限不足，靜默處理
  }
};

// ── 拖曳支援 ──
const onDragStart = (event: DragEvent) => {
  if (!canvasRef.value || !hasQrCode.value || !event.dataTransfer) return;
  const dataUrl = canvasRef.value.toDataURL('image/png');
  event.dataTransfer.setData('text/uri-list', dataUrl);
  event.dataTransfer.setData('text/plain', inputText.value);
};

// ── 記錄到歷史 ──
const recordToHistory = () => {
  if (!inputText.value || !hasQrCode.value || !canvasRef.value) return;
  const displayInput =
    inputText.value.length > 30 ? `${inputText.value.slice(0, 30)}...` : inputText.value;
  const config = `${qrSize.value}px / ${errorCorrectionLevel.value}`;
  const dataUrl = canvasRef.value.toDataURL('image/png');

  addToHistory('qrcode', displayInput, config, { dataUrl });
};

const canPaste = ref(false);

const pasteInput = async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) inputText.value = text;
  } catch (e) {
    if (typeof process === 'undefined' || !process.env.VITEST) {
      console.warn('pasteInput error:', e);
    }
  }
};

// ── 效能標記 ──
onMounted(() => {
  performance.mark('QrCodeGenerator-mounted');
  if (navigator.clipboard) {
    canPaste.value = true;
  }
});
</script>

<style scoped>
.qrcode-generator {
  width: 100%;
}

.card {
  background: var(--surface-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.card + .card {
  margin-top: 1.5rem;
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  letter-spacing: -0.01em;
}

/* ── 輸入區 ── */
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

/* ── 控制面板 ── */
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

.control-item input[type='range'] {
  width: 100%;
  accent-color: var(--primary);
  cursor: pointer;
}

/* ── 顏色選取 ── */
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

/* ── 錯誤校正 ── */
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

/* ── QR Code 顯示區 ── */
/* 預覽卡片 specific */
.preview-card {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.canvas-wrapper {
  padding: 24px;
  background: white; /* QR code 需要白底以確保掃描 */
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

/* ── 動作按鈕 ── */
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

/* History Styles - Handled by common components */
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

.input-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

/* .input-label defined at line 361 */

.paste-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 0.8rem;
  cursor: pointer;
  color: var(--text-primary);
}
.paste-btn:hover {
  background: var(--surface-hover);
  color: var(--primary);
}
</style>
