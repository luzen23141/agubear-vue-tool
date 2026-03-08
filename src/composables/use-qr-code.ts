/* eslint-disable max-lines-per-function, max-statements */

import { ref, reactive, computed, watch, nextTick, type Ref } from 'vue';
import type { QRCodeErrorCorrectionLevel } from 'qrcode';
import { generateWifiString, downloadCanvasAsPng, copyCanvasToClipboard } from '../utils/qrcode';
import { generateVCard } from '../utils/vcard';
import { canUseClipboardRead, readClipboardText } from './use-copy-to-clipboard';

export interface QrOptions {
  qrSize: number;
  foregroundColor: string;
  backgroundColor: string;
  errorCorrectionLevel: QRCodeErrorCorrectionLevel;
  margin: number;
}

export interface WifiState {
  ssid: string;
  password: string;
  encryption: string;
  hidden: boolean;
  hiddenPassword: boolean;
}

export interface ContactState {
  name: string;
  org: string;
  phone: string;
  email: string;
  url: string;
}

const INITIAL_QR_OPTIONS: QrOptions = {
  qrSize: 256,
  foregroundColor: '#000000',
  backgroundColor: '#ffffff',
  errorCorrectionLevel: 'medium',
  margin: 4
};

/**
 * Composable for managing QR code generation and interactions
 */
export function UseQrCode(canvasReference: Ref<HTMLCanvasElement | null>, addToHistory: Function) {
  // --- State ---
  const mode = ref<'text' | 'wifi' | 'contact'>('text');
  const inputText = ref('');
  const wifi = ref<WifiState>({
    ssid: '',
    password: '',
    encryption: 'WPA',
    hidden: false,
    hiddenPassword: true
  });
  const contact = ref<ContactState>({
    name: '',
    org: '',
    phone: '',
    email: '',
    url: ''
  });
  const qrOptions = reactive<QrOptions>({ ...INITIAL_QR_OPTIONS });

  const hasQrCode = ref(false);
  const copySuccess = ref(false);
  const downloadTriggered = ref(false);
  const canPaste = ref(canUseClipboardRead());

  // --- Computed ---
  const finalQrText = computed(() => {
    switch (mode.value) {
      case 'wifi': {
        return generateWifiString(wifi.value);
      }
      case 'contact': {
        return generateVCard(contact.value);
      }
      default: {
        return inputText.value;
      }
    }
  });

  // --- Methods ---
  const generateQrCode = async () => {
    if (!finalQrText.value) {
      hasQrCode.value = false;
      const canvas = canvasReference.value;
      if (canvas) {
        canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
      }
      return;
    }

    await nextTick();
    const canvas = canvasReference.value;
    if (!canvas) return;

    try {
      const qrCodeModule = await import('qrcode');
      const QRCode = qrCodeModule.default;
      const options = {
        width: qrOptions.qrSize,
        margin: qrOptions.margin,
        color: {
          dark: qrOptions.foregroundColor,
          light: qrOptions.backgroundColor
        },
        errorCorrectionLevel: qrOptions.errorCorrectionLevel
      };
      await QRCode.toCanvas(canvas, finalQrText.value, options);
      hasQrCode.value = true;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      hasQrCode.value = false;
    }
  };

  const downloadPng = () => {
    if (canvasReference.value && hasQrCode.value) {
      downloadCanvasAsPng(canvasReference.value);
      downloadTriggered.value = true;
      setTimeout(() => {
        downloadTriggered.value = false;
      }, 1500);
    }
  };

  const copyToClipboard = async () => {
    if (canvasReference.value && hasQrCode.value) {
      const success = await copyCanvasToClipboard(canvasReference.value);
      if (success) {
        copySuccess.value = true;
        setTimeout(() => {
          copySuccess.value = false;
        }, 1500);
      }
    }
  };

  const onDragStart = (event: DragEvent) => {
    if (canvasReference.value && hasQrCode.value && event.dataTransfer) {
      event.dataTransfer.setData('text/uri-list', canvasReference.value.toDataURL('image/png'));
      event.dataTransfer.setData('text/plain', finalQrText.value);
    }
  };

  const recordToHistory = () => {
    const canvas = canvasReference.value;
    const text = finalQrText.value;
    if (!text || !hasQrCode.value || !canvas) return;

    const input = text.length > 30 ? `${text.slice(0, 30)}...` : text;
    const config = `${qrOptions.qrSize}px / ${qrOptions.errorCorrectionLevel} / ${mode.value}`;
    addToHistory('qrcode', input, config, { dataUrl: canvas.toDataURL('image/png') });
  };

  const pasteInput = async () => {
    const text = await readClipboardText();
    if (text) inputText.value = text;
  };

  // --- Watchers & Lifecycle ---
  watch([finalQrText, qrOptions], generateQrCode, { immediate: true, deep: true });

  return {
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
    generateQrCode,
    downloadPng,
    copyToClipboard,
    onDragStart,
    recordToHistory,
    pasteInput
  };
}
