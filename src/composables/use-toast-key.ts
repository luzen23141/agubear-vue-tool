import type { InjectionKey } from 'vue';

export type ToastFunction = (_message: string, _type: 'success' | 'error' | 'info') => void;

/**
 * Typed injection key for the global toast function.
 * Provides type-safe inject/provide without string keys.
 */
export const TOAST_KEY: InjectionKey<ToastFunction> = Symbol('showToast');
