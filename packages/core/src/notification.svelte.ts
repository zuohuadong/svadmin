// Notification Provider — pluggable notification system
// Falls back to built-in toast when no provider is set

import { toast } from './toast.svelte';
import type { NotificationProvider } from './types';

let notificationProvider = $state<NotificationProvider | null>(null);

export function setNotificationProvider(provider: NotificationProvider): void {
  notificationProvider = provider;
}

export function getNotificationProvider(): NotificationProvider | null {
  return notificationProvider;
}

/**
 * Send a notification through the configured provider, or fall back to toast.
 */
export function notify(params: {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  key?: string;
}): void {
  if (notificationProvider) {
    notificationProvider.open(params);
  } else {
    // Fallback to built-in toast
    const { type, message } = params;
    switch (type) {
      case 'success': toast.success(message, undefined, { key: params.key }); break;
      case 'error': toast.error(message, undefined, { key: params.key }); break;
      case 'warning': toast.warning(message, undefined, { key: params.key }); break;
      case 'info': toast.info(message, undefined, { key: params.key }); break;
    }
  }
}

/**
 * Close a notification by key (only works with custom provider).
 */
export function closeNotification(key: string): void {
  notificationProvider?.close(key);
}

export function resetNotificationProvider(): void {
  notificationProvider = null;
}
