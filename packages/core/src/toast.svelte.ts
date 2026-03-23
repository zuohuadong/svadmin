// Toast notification system — wraps svelte-sonner for consistent API
// Maintains backward-compatible `toast.success()` / `toast.error()` etc.

import { toast as sonner } from 'svelte-sonner';

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'undoable';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
  onUndo?: () => void;
  onTimeout?: () => void;
}

// Legacy compatibility — kept for existing consumers
let nextId = 0;
let toasts = $state<Toast[]>([]);

export function getToasts(): Toast[] {
  return toasts;
}

export function addToast(type: ToastType, message: string, duration = 3000, options?: { onUndo?: () => void, onTimeout?: () => void }): void {
  // Use svelte-sonner for regular toasts
  if (type !== 'undoable') {
    switch (type) {
      case 'success': sonner.success(message, { duration }); break;
      case 'error': sonner.error(message, { duration }); break;
      case 'warning': sonner.warning(message, { duration }); break;
      case 'info': sonner.info(message, { duration }); break;
    }
    return;
  }

  // Undoable toasts still use custom system
  const id = nextId++;
  toasts = [...toasts, { id, type, message, duration, ...options }];
}

export function removeToast(id: number): void {
  toasts = toasts.filter(t => t.id !== id);
}

// Convenience methods — backward compatible
export const toast = {
  success: (msg: string, duration?: number) => addToast('success', msg, duration),
  error: (msg: string, duration?: number) => addToast('error', msg, duration ?? 5000),
  info: (msg: string, duration?: number) => addToast('info', msg, duration),
  warning: (msg: string, duration?: number) => addToast('warning', msg, duration ?? 4000),
  undoable: (msg: string, duration: number, onUndo: () => void, onTimeout: () => void) =>
    addToast('undoable', msg, duration, { onUndo, onTimeout }),
  /** Promise toast — shows loading → success/error automatically */
  promise: <T>(promise: Promise<T>, opts: { loading: string; success: string; error: string }) =>
    sonner.promise(promise, opts),
};
