import { vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { setActivePinia, createPinia } from 'pinia';
process.env.TZ = 'UTC';

beforeEach(() => {
  setActivePinia(createPinia());
  // G2: Reset storage state to prevent cross-test contamination
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.clear();
  }
});

// Global localStorage and sessionStorage mock to prevent jsdom persistence warnings
const storageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn(
      (key: string) =>
        // eslint-disable-next-line security/detect-object-injection
        store[key] || null
    ),
    setItem: vi.fn((key: string, value: string) => {
      // eslint-disable-next-line security/detect-object-injection
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      // eslint-disable-next-line security/detect-object-injection
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    length: 0,
    key: vi.fn((_index: number) => null)
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: storageMock,
  writable: true
});

Object.defineProperty(window, 'sessionStorage', {
  value: storageMock,
  writable: true
});

// Mock matchMedia if not present
if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), // deprecated
      removeListener: vi.fn(), // deprecated
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    }))
  });
}

// Mock scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
});

// Mock Canvas for QRCode
if (typeof HTMLCanvasElement !== 'undefined') {
  // @ts-expect-error - Prototype hijacking for testing
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    fillRect: vi.fn(),
    clearRect: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(0)
    })),
    putImageData: vi.fn(),
    createImageData: vi.fn(() => []),
    setTransform: vi.fn(),
    drawImage: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    translate: vi.fn(),
    scale: vi.fn(),
    rotate: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    transform: vi.fn(),
    rect: vi.fn(),
    clip: vi.fn()
  }));

  // Also mock toDataURL
  HTMLCanvasElement.prototype.toDataURL = vi.fn(() => 'data:image/png;base64,mock');
}

// Mock navigator.clipboard
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(),
      readText: vi.fn().mockResolvedValue('mocked paste text')
    },
    writable: true
  });
}

// Mock vue-i18n partially
vi.mock('vue-i18n', async (importOriginal) => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  const originalUseI18n = actual.useI18n as (..._args: unknown[]) => unknown;
  return {
    ...actual,
    useI18n: vi.fn(() => {
      try {
        return originalUseI18n();
      } catch {
        // Fallback for composable tests
        return {
          t: (key: string) => key,
          locale: ref('en'),
          fallbackLocale: ref('en'),
          availableLocales: ['en', 'zh-TW']
        };
      }
    })
  };
});
