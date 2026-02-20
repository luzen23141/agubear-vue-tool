/**
 * QR Code related utility functions
 */

export interface WifiConfig {
  ssid: string;
  encryption: string;
  password?: string;
  hidden?: boolean;
}

/**
 * Generate a WIFI configuration string for QR codes
 */
export function generateWifiString(wifi: WifiConfig): string {
  if (!wifi.ssid) return '';
  const { encryption, ssid, password, hidden } = wifi;
  return `WIFI:T:${encryption};S:${ssid};P:${password || ''};H:${!!hidden};;`;
}

/**
 * Download a canvas as a PNG image
 */
export function downloadCanvasAsPng(canvas: HTMLCanvasElement, filename?: string): void {
  const link = document.createElement('a');
  link.download = filename || `qrcode-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

/**
 * Copy a canvas image to the clipboard
 */
export async function copyCanvasToClipboard(canvas: HTMLCanvasElement): Promise<boolean> {
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
    if (blob) {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Failed to copy canvas to clipboard:', error);
    return false;
  }
}
