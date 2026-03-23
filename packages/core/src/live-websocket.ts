/**
 * WebSocket LiveProvider
 *
 * Connects to a WebSocket server and dispatches LiveEvents to subscribers.
 * The server is expected to send JSON messages matching the LiveEvent shape:
 *   { type: 'INSERT' | 'UPDATE' | 'DELETE', resource: string, payload: {...} }
 */
import type { LiveProvider, LiveEvent } from './live';

export interface WebSocketLiveProviderOptions {
  /** WebSocket server URL, e.g. "wss://api.example.com/ws" */
  url: string;
  /** Reconnect delay in ms (default 3000) */
  reconnectDelay?: number;
  /** Max reconnect attempts (default Infinity) */
  maxReconnects?: number;
  /** Optional callback when connection opens */
  onOpen?: () => void;
  /** Optional callback when connection closes */
  onClose?: (event: CloseEvent) => void;
  /** Optional callback for connection errors */
  onError?: (event: Event) => void;
}

export function createWebSocketLiveProvider(options: WebSocketLiveProviderOptions): LiveProvider & { disconnect: () => void; getStatus: () => 'connecting' | 'connected' | 'disconnected' } {
  const { url, reconnectDelay = 3000, maxReconnects = Infinity } = options;

  type Callback = (event: LiveEvent) => void;
  const subscribers = new Map<string, Set<Callback>>();
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let status: 'connecting' | 'connected' | 'disconnected' = 'disconnected';
  let intentionalClose = false;

  function connect() {
    if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;

    status = 'connecting';
    intentionalClose = false;

    try {
      ws = new WebSocket(url);
    } catch {
      status = 'disconnected';
      scheduleReconnect();
      return;
    }

    ws.onopen = () => {
      status = 'connected';
      reconnectAttempts = 0;
      options.onOpen?.();
    };

    ws.onmessage = (msgEvent) => {
      try {
        const event: LiveEvent = JSON.parse(msgEvent.data);
        if (event.type && event.resource) {
          const callbacks = subscribers.get(event.resource);
          if (callbacks) {
            for (const cb of callbacks) cb(event);
          }
          // Also notify wildcard '*' subscribers
          const wildcardCallbacks = subscribers.get('*');
          if (wildcardCallbacks) {
            for (const cb of wildcardCallbacks) cb(event);
          }
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    ws.onclose = (event) => {
      status = 'disconnected';
      options.onClose?.(event);
      if (!intentionalClose) scheduleReconnect();
    };

    ws.onerror = (event) => {
      options.onError?.(event);
    };
  }

  function scheduleReconnect() {
    if (reconnectAttempts >= maxReconnects) return;
    if (reconnectTimer) clearTimeout(reconnectTimer);

    reconnectAttempts++;
    reconnectTimer = setTimeout(connect, reconnectDelay);
  }

  function disconnect() {
    intentionalClose = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    if (ws) {
      ws.close();
      ws = null;
    }
    status = 'disconnected';
  }

  // Auto-connect on creation
  if (typeof WebSocket !== 'undefined') {
    connect();
  }

  return {
    subscribe({ resource, callback }) {
      if (!subscribers.has(resource)) {
        subscribers.set(resource, new Set());
      }
      subscribers.get(resource)!.add(callback);

      // Ensure connection is open
      if (status === 'disconnected' && typeof WebSocket !== 'undefined') {
        connect();
      }

      return () => {
        const callbacks = subscribers.get(resource);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) subscribers.delete(resource);
        }
        // Auto-disconnect if no subscribers left
        if (subscribers.size === 0) disconnect();
      };
    },

    disconnect,

    getStatus() {
      return status;
    },
  };
}
