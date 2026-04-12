export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'undoable';

export interface ToastItem {
  id: number;
  key?: string;
  type: ToastType;
  message: string;
  duration?: number;
  onUndo?: () => void;
  onTimeout?: () => void;
}

let nextId = 0;

// Queue for simple toasts (consumed by UI Toast bridge)
let queue = $state<ToastItem[]>([]);
export function getToastQueue() { return queue; }
export function consumeToastQueue() { queue = []; }

// Promise Queue
let promiseQueue = $state<{ id: number; promise: Promise<any>; opts: { loading: string; success: string; error: string } }[]>([]);
export function getPromiseQueue() { return promiseQueue; }
export function consumePromiseQueue() { promiseQueue = []; }

// Legacy compatibility — kept for existing consumers (Undoable)
let toasts = $state<ToastItem[]>([]);
export function getToasts(): ToastItem[] { return toasts; }

export function addToast(
  type: ToastType, 
  message: string, 
  duration = 3000, 
  options?: { key?: string, onUndo?: () => void, onTimeout?: () => void }
): void {
  if (options?.key) {
    if (queue.some(q => q.key === options.key) || toasts.some(t => t.key === options.key)) return;
  }
  if (type !== 'undoable') {
    queue.push({ id: nextId++, type, message, duration, key: options?.key });
    return;
  }
  const id = nextId++;
  toasts = [...toasts, { id, type, message, duration, ...options }];
  if (type === 'undoable') {
    setTimeout(() => {
      options?.onTimeout?.();
      removeToast(id);
    }, duration);
  }
}

export function removeToast(id: number): void {
  toasts = toasts.filter(t => t.id !== id);
}

// Convenience methods — backward compatible
export const toast = {
  success: (msg: string, duration?: number, opts?: { key?: string }) => addToast('success', msg, duration, opts),
  error: (msg: string, duration?: number, opts?: { key?: string }) => addToast('error', msg, duration ?? 5000, opts),
  info: (msg: string, duration?: number, opts?: { key?: string }) => addToast('info', msg, duration, opts),
  warning: (msg: string, duration?: number, opts?: { key?: string }) => addToast('warning', msg, duration ?? 4000, opts),
  undoable: (msg: string, duration: number, onUndo: () => void, onTimeout: () => void) =>
    addToast('undoable', msg, duration, { onUndo, onTimeout }),
  /** Promise toast — shows loading → success/error automatically */
  promise: <T>(promise: Promise<T>, opts: { loading: string; success: string; error: string }) => {
    promiseQueue.push({ id: nextId++, promise, opts });
    return promise;
  },
};
