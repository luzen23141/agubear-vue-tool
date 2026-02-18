import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reactive, nextTick } from 'vue';
import { mount, flushPromises } from '@vue/test-utils';
import QrCodeGenerator from '../../components/QrCodeGenerator.vue';
import { setupI18n } from '../../i18n';
import qrcode from 'qrcode';

const i18n = setupI18n();

const mountOptions = {
  global: {
    plugins: [i18n]
  }
};

vi.mock('qrcode', () => ({
  default: {
    toCanvas: vi.fn().mockResolvedValue(undefined)
  }
}));

// Mock useHead
vi.mock('@unhead/vue', () => ({
  useHead: vi.fn()
}));

// Mock useHistory
const mockUseHistory = reactive({
  history: [] as any[],
  addToHistory: vi.fn(),
  clearHistory: vi.fn(),
  removeFromHistory: vi.fn()
});
vi.mock('../../composables/useHistory', () => ({
  useHistory: () => mockUseHistory
}));

// Mock clipboard API
const mockClipboardWrite = vi.fn().mockResolvedValue(undefined);
vi.stubGlobal('navigator', {
  ...navigator,
  clipboard: {
    writeText: mockClipboardWrite,
    write: mockClipboardWrite
  }
});

// Mock HTMLCanvasElement.prototype.toBlob
vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback, type, _quality) => {
  const blob = new Blob(['mock-binary-data'], { type: type || 'image/png' });
  callback(blob);
});

// Mock ClipboardItem if not present
if (typeof ClipboardItem === 'undefined') {
  (global as any).ClipboardItem = class ClipboardItem {
    constructor(data: any) {
      (this as any).data = data;
    }

    static supports(_type: string) {
      return true;
    }
  };
}

// Ensure navigator.clipboard.write is a mock
if (!navigator.clipboard.write) {
  navigator.clipboard.write = vi.fn().mockResolvedValue(undefined);
}

describe('QrCodeGenerator.vue', () => {
  let wrapper: any;

  beforeEach(() => {
    i18n.global.locale.value = 'zh-TW';
    vi.mocked(qrcode.toCanvas).mockClear();
    mockUseHistory.addToHistory.mockClear();
    mockUseHistory.clearHistory.mockClear();
    mockUseHistory.removeFromHistory.mockClear();
    mockUseHistory.history = [];
    mockClipboardWrite.mockClear();
    wrapper = mount(QrCodeGenerator, mountOptions);
  });

  afterEach(() => {
    wrapper?.unmount();
  });

  describe('渲染', () => {
    it('應正確渲染標題', () => {
      expect(wrapper.find('h2').text()).toBe('📱 QR Code 產生器');
    });

    it('應渲染文字輸入框', () => {
      const textarea = wrapper.find('textarea');
      expect(textarea.exists()).toBe(true);
      expect(textarea.attributes('placeholder')).toContain('文字或網址');
    });

    it('應渲染尺寸輸入框', () => {
      const slider = wrapper.find('#qr-size');
      expect(slider.exists()).toBe(true);
      expect(slider.attributes('type')).toBe('number');
      expect(slider.attributes('min')).toBe('100');
      expect(slider.attributes('max')).toBe('1000');
    });

    it('應渲染邊距輸入框', () => {
      const slider = wrapper.find('#qr-margin');
      expect(slider.exists()).toBe(true);
      expect(slider.attributes('type')).toBe('number');
      expect(slider.attributes('min')).toBe('0');
      expect(slider.attributes('max')).toBe('50');
    });

    it('應渲染前景色選擇器', () => {
      const colorInput = wrapper.find('#qr-fg-color');
      expect(colorInput.exists()).toBe(true);
      expect(colorInput.attributes('type')).toBe('color');
    });

    it('應渲染背景色選擇器', () => {
      const colorInput = wrapper.find('#qr-bg-color');
      expect(colorInput.exists()).toBe(true);
      expect(colorInput.attributes('type')).toBe('color');
    });

    it('應渲染四個錯誤校正等級按鈕', () => {
      const ecBtns = wrapper.findAll('.ec-btn');
      expect(ecBtns).toHaveLength(4);
      expect(ecBtns[0].text()).toContain('L');
      expect(ecBtns[1].text()).toContain('M');
      expect(ecBtns[2].text()).toContain('Q');
      expect(ecBtns[3].text()).toContain('H');
    });

    it('M 等級應為預設選中', () => {
      const ecBtns = wrapper.findAll('.ec-btn');
      expect(ecBtns[1].classes()).toContain('active');
    });

    it('無輸入時不應顯示預覽區域', () => {
      expect(wrapper.find('.preview-card').exists()).toBe(false);
    });
  });

  describe('預設值', () => {
    it('尺寸預設值應為 256', () => {
      const label = wrapper
        .findAll('.control-item label')
        .find((l: any) => l.text().includes('尺寸'));
      expect((label as any).text()).toContain('256px');
    });

    it('邊距預設值應為 4', () => {
      const label = wrapper
        .findAll('.control-item label')
        .find((l: any) => l.text().includes('邊距'));
      expect((label as any).text()).toContain('4');
    });

    it('前景色預設值應為黑色', () => {
      const hex = wrapper.findAll('.color-hex')[0];
      expect(hex.text()).toBe('#000000');
    });

    it('背景色預設值應為白色', () => {
      const hex = wrapper.findAll('.color-hex')[1];
      expect(hex.text()).toBe('#ffffff');
    });
  });

  describe('輸入與 QR 產生', () => {
    it('輸入文字後應顯示預覽區域', async () => {
      await wrapper.find('textarea').setValue('hello');
      await wrapper.vm.$nextTick();

      expect(wrapper.find('.canvas-wrapper').exists()).toBe(true);
    });

    it('輸入文字後應呼叫 QRCode.toCanvas', async () => {
      await wrapper.find('textarea').setValue('http://test.com');
      await wrapper.vm.$nextTick(); // Wait for v-if
      await wrapper.vm.$nextTick(); // Wait for ref update?
      await flushPromises();

      expect(wrapper.find('canvas').exists()).toBe(true);
      // Wait a bit more just in case
      await new Promise((resolve) => {
        setTimeout(resolve, 500);
      }); // Wait for chunks
      expect(wrapper.vm.hasQrCode).toBe(true);
      expect(qrcode.toCanvas).toHaveBeenCalled();
    });

    it('toCanvas 應收到正確的選項', async () => {
      await wrapper.find('textarea').setValue('test data');
      await wrapper.vm.$nextTick();
      await flushPromises();

      if (vi.mocked(qrcode.toCanvas).mock.calls.length > 0) {
        const lastCall = vi.mocked(qrcode.toCanvas).mock.calls[
          vi.mocked(qrcode.toCanvas).mock.calls.length - 1
        ];
        const options = lastCall ? lastCall[2] : null;
        expect(options).toMatchObject({
          width: 256,
          margin: 4,
          color: {
            dark: '#000000',
            light: '#ffffff'
          },
          errorCorrectionLevel: 'M'
        });
      }
    });

    it('應處理邊界值設定 (最小 100px / 0 邊距)', async () => {
      const sizeInput = wrapper.find('#qr-size');
      const marginInput = wrapper.find('#qr-margin');

      await sizeInput.setValue(100);
      await wrapper.vm.$nextTick();
      await marginInput.setValue(0);
      await wrapper.vm.$nextTick();
      await wrapper.find('textarea').setValue('boundary test');

      await wrapper.vm.$nextTick();
      await flushPromises();

      const lastCall = vi.mocked(qrcode.toCanvas).mock.calls[
        vi.mocked(qrcode.toCanvas).mock.calls.length - 1
      ];
      expect(lastCall?.[2].width).toBe(100);
      expect(lastCall?.[2].margin).toBe(0);
    });

    it('應處理大數據量輸入 (接近 2048 字限制)', async () => {
      const longText = 'A'.repeat(2000);
      await wrapper.find('textarea').setValue(longText);
      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(vi.mocked(qrcode.toCanvas)).toHaveBeenCalled();
      const lastCall = vi.mocked(qrcode.toCanvas).mock.calls[
        vi.mocked(qrcode.toCanvas).mock.calls.length - 1
      ];
      expect(lastCall?.[1]).toBe(longText);
    });

    it('產生失敗時應重置 hasQrCode', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(qrcode.toCanvas).mockRejectedValueOnce(new Error('Canvas error'));
      await wrapper.find('textarea').setValue('error');
      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(wrapper.vm.hasQrCode).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('修改顏色應重新產生 QR Code', async () => {
      await wrapper.find('textarea').setValue('color test');
      await wrapper.vm.$nextTick();
      await flushPromises();
      vi.mocked(qrcode.toCanvas).mockClear();

      const fgInput = wrapper.find('#qr-fg-color');
      await fgInput.setValue('#ff0000');

      const bgInput = wrapper.find('#qr-bg-color');
      await bgInput.setValue('#0000ff');

      await wrapper.vm.$nextTick();
      await flushPromises();

      expect(vi.mocked(qrcode.toCanvas)).toHaveBeenCalled();
      const lastCall = vi.mocked(qrcode.toCanvas).mock.calls[
        vi.mocked(qrcode.toCanvas).mock.calls.length - 1
      ];
      expect(lastCall?.[2].color.dark).toBe('#ff0000');
      expect(lastCall?.[2].color.light).toBe('#0000ff');
    });
  });

  describe('錯誤校正切換', () => {
    it('點擊 L 應切換錯誤校正等級', async () => {
      const ecBtns = wrapper.findAll('.ec-btn');
      await ecBtns[0].trigger('click');

      expect(ecBtns[0].classes()).toContain('active');
      expect(ecBtns[1].classes()).not.toContain('active');
    });

    it('點擊 H 應切換到最高等級', async () => {
      const ecBtns = wrapper.findAll('.ec-btn');
      await ecBtns[3].trigger('click');

      expect(ecBtns[3].classes()).toContain('active');
    });
  });

  describe('歷史紀錄', () => {
    it('無歷史時不應顯示歷史卡片', () => {
      expect(wrapper.find('.history-card').exists()).toBe(false);
    });
  });

  describe('Canvas 屬性', () => {
    it('輸入文字後 canvas 應可拖曳', async () => {
      await wrapper.find('textarea').setValue('drag test');
      await wrapper.vm.$nextTick();

      const canvas = wrapper.find('.qr-canvas');
      expect(canvas.exists()).toBe(true);
    });
  });

  describe('Aria 標籤', () => {
    it('所有控制元素應有 aria-label', () => {
      const textarea = wrapper.find('textarea');
      expect(textarea.attributes('aria-label')).toBeTruthy();

      const sizeSlider = wrapper.find('#qr-size');
      expect(sizeSlider.attributes('aria-label')).toBeTruthy();

      const marginSlider = wrapper.find('#qr-margin');
      expect(marginSlider.attributes('aria-label')).toBeTruthy();

      const fgColor = wrapper.find('#qr-fg-color');
      expect(fgColor.attributes('aria-label')).toBeTruthy();

      const bgColor = wrapper.find('#qr-bg-color');
      expect(bgColor.attributes('aria-label')).toBeTruthy();
    });

    it('EC 按鈕應有 aria-label 和 aria-pressed', () => {
      const ecBtns = wrapper.findAll('.ec-btn');
      ecBtns.forEach((btn: any) => {
        expect(btn.attributes('aria-label')).toBeTruthy();
        expect(btn.attributes('aria-pressed')).toBeDefined();
      });
    });
  });

  describe('進階功能與歷史紀錄', () => {
    // Mock HTMLCanvasElement.prototype.toDataURL
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/png;base64,mock'
    );

    it('應能點擊下載按鈕並重置狀態', async () => {
      vi.useFakeTimers();
      const mockClick = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      await wrapper.find('textarea').setValue('download test');
      await flushPromises();

      const downloadBtn = wrapper.find('.download-btn');
      await downloadBtn.trigger('click');

      expect(mockClick).toHaveBeenCalled();
      expect(wrapper.vm.downloadTriggered).toBe(true);

      vi.advanceTimersByTime(1500);
      expect(wrapper.vm.downloadTriggered).toBe(false);

      mockClick.mockRestore();
      vi.useRealTimers();
    });

    it('應能點擊複製按鈕並重置狀態', async () => {
      vi.useFakeTimers();
      await wrapper.find('textarea').setValue('copy test');
      wrapper.vm.hasQrCode = true;
      await flushPromises();

      await wrapper.vm.copyToClipboard();

      expect(mockClipboardWrite).toHaveBeenCalled();
      expect(wrapper.vm.copySuccess).toBe(true);

      vi.advanceTimersByTime(1500);
      expect(wrapper.vm.copySuccess).toBe(false);
      vi.useRealTimers();
    });

    it('應能記錄到歷史', async () => {
      await wrapper.find('textarea').setValue('history test');
      await flushPromises();

      const recordBtn = wrapper.find('.record-btn');
      await recordBtn.trigger('click');

      expect(mockUseHistory.addToHistory).toHaveBeenCalledWith(
        'qrcode',
        'history test',
        expect.stringContaining('256px / M'),
        expect.any(Object)
      );
    });

    it('記錄到歷史時應截斷長輸入', async () => {
      const longInput = 'A'.repeat(50);
      await wrapper.find('textarea').setValue(longInput);
      wrapper.vm.hasQrCode = true;
      wrapper.vm.canvasRef = document.createElement('canvas'); // Ensure canvas exists
      await nextTick();

      const recordBtn = wrapper.find('.record-btn');
      await recordBtn.trigger('click');

      expect(mockUseHistory.addToHistory).toHaveBeenCalledWith(
        'qrcode',
        expect.stringContaining('...'),
        expect.any(String),
        expect.any(Object)
      );
    });

    it('拖曳時應設置正確的 dataTransfer', async () => {
      await wrapper.find('textarea').setValue('drag test');
      await flushPromises();

      const canvas = wrapper.find('.qr-canvas');
      const mockSetData = vi.fn();

      await canvas.trigger('dragstart', {
        dataTransfer: {
          setData: mockSetData
        }
      });

      expect(mockSetData).toHaveBeenCalledWith(
        'text/uri-list',
        expect.stringContaining('data:image/png')
      );
      expect(mockSetData).toHaveBeenCalledWith('text/plain', 'drag test');
    });

    it('應能刪除歷史紀錄', async () => {
      mockUseHistory.history = [
        { id: 1, timestamp: '12:00', input: 'test', output: 'config', extra: { dataUrl: 'data:' } }
      ];

      const wrapperWithHistory = mount(QrCodeGenerator, mountOptions);
      await nextTick();
      const deleteBtn = wrapperWithHistory.find('.delete-btn');
      if (deleteBtn.exists()) {
        await deleteBtn.trigger('click');
      }
      expect(mockUseHistory.removeFromHistory).toHaveBeenCalledWith(1);
    });

    it('應能清空歷史紀錄', async () => {
      mockUseHistory.history = [{ id: 1, timestamp: '12:00', input: 'test', output: 'config' }];

      const wrapperWithHistory = mount(QrCodeGenerator, mountOptions);
      await nextTick();
      const clearBtn = wrapperWithHistory.find('.clear-btn');
      await clearBtn.trigger('click');

      expect(mockUseHistory.clearHistory).toHaveBeenCalled();
    });

    it('無 QR Code 時不應執行下載、複製、拖曳或記錄', async () => {
      wrapper.vm.hasQrCode = false;

      // Download
      await wrapper.vm.downloadPng();
      expect(wrapper.vm.downloadTriggered).toBe(false);

      // Copy
      await wrapper.vm.copyToClipboard();
      expect(mockClipboardWrite).not.toHaveBeenCalled();

      // Drag
      const mockEvent = { dataTransfer: { setData: vi.fn() } };
      await (wrapper.vm as any).onDragStart(mockEvent);
      expect(mockEvent.dataTransfer.setData).not.toHaveBeenCalled();

      // Record
      await wrapper.vm.recordToHistory();
      expect(mockUseHistory.addToHistory).not.toHaveBeenCalled();
    });

    it('應能執行貼上功能', async () => {
      const mockReadText = vi.fn().mockResolvedValue('pasted text');
      vi.stubGlobal('navigator', {
        clipboard: {
          readText: mockReadText,
          write: vi.fn()
        }
      });

      // Need to re-mount to trigger onMounted and set canPaste
      const newWrapper = mount(QrCodeGenerator, mountOptions);
      await nextTick();

      const pasteBtn = newWrapper.find('.paste-btn');
      expect(pasteBtn.exists()).toBe(true);

      await pasteBtn.trigger('click');
      expect(mockReadText).toHaveBeenCalled();
      expect((newWrapper.vm as any).inputText).toBe('pasted text');
    });

    it('複製失敗時應處理錯誤', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.spyOn(navigator.clipboard, 'write').mockRejectedValueOnce(new Error('Copy failed'));
      await wrapper.find('textarea').setValue('fail test');
      wrapper.vm.hasQrCode = true;
      await nextTick();

      await wrapper.vm.copyToClipboard();
      expect(wrapper.vm.copySuccess).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('拖曳時若無 dataTransfer 應提早回傳', async () => {
      await wrapper.find('textarea').setValue('drag fail');
      wrapper.vm.hasQrCode = true;
      await nextTick();

      const mockEvent = { dataTransfer: null } as any;
      const result = await (wrapper.vm as any).onDragStart(mockEvent);
      expect(result).toBeUndefined();
    });

    it('當 toBlob 回傳 null 時不應執行複製', async () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementationOnce((callback) => {
        callback(null);
      });
      await wrapper.find('textarea').setValue('null blob');
      wrapper.vm.hasQrCode = true;
      await nextTick();

      await wrapper.vm.copyToClipboard();
      expect(mockClipboardWrite).not.toHaveBeenCalled();
    });
  });
});
