import { vi } from 'vitest';

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
