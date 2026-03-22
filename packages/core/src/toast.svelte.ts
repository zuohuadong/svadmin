// Toast notification system — Svelte 5 runes-based

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'undoable';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
  onUndo?: () => void;
  onTimeout?: () => void;
}

let nextId = 0;
let toasts = $state<Toast[]>([]);

export function getToasts(): Toast[] {
  return toasts;
}

export function addToast(type: ToastType, message: string, duration = 3000, options?: { onUndo?: () => void, onTimeout?: () => void }): void {
  const id = nextId++;
  toasts = [...toasts, { id, type, message, duration, ...options }];
  if (duration > 0 && type !== 'undoable') {
    setTimeout(() => removeToast(id), duration);
  }
}

export function removeToast(id: number): void {
  toasts = toasts.filter(t => t.id !== id);
}

// Convenience methods
export const toast = {
  success: (msg: string, duration?: number) => addToast('success', msg, duration),
  error: (msg: string, duration?: number) => addToast('error', msg, duration ?? 5000),
  info: (msg: string, duration?: number) => addToast('info', msg, duration),
  warning: (msg: string, duration?: number) => addToast('warning', msg, duration ?? 4000),
  undoable: (msg: string, duration: number, onUndo: () => void, onTimeout: () => void) => 
    addToast('undoable', msg, duration, { onUndo, onTimeout }),
};
