/**
 * SSE (Server-Sent Events) LiveProvider
 *
 * Connects to an SSE endpoint and dispatches LiveEvents to subscribers.
 * The server should emit events as JSON matching the LiveEvent shape:
 *   data: { "type": "INSERT", "resource": "posts", "payload": {...} }
 *
 * Optionally, named SSE events can be used:
 *   event: posts
 *   data: { "type": "INSERT", "payload": {...} }
 */
import type { LiveProvider, LiveEvent } from './live';

export interface SSELiveProviderOptions {
  /** SSE endpoint URL, e.g. "https://api.example.com/events" */
  url: string;
  /** Optional EventSource init options (e.g. withCredentials) */
  eventSourceInit?: EventSourceInit;
  /** Optional callback when connection opens */
  onOpen?: () => void;
  /** Optional callback for connection errors */
  onError?: (event: Event) => void;
}

export function createSSELiveProvider(options: SSELiveProviderOptions): LiveProvider & { disconnect: () => void; getStatus: () => 'connecting' | 'connected' | 'disconnected' } {
  const { url, eventSourceInit } = options;

  type Callback = (event: LiveEvent) => void;
  const subscribers = new Map<string, Set<Callback>>();
  let eventSource: EventSource | null = null;
  let status: 'connecting' | 'connected' | 'disconnected' = 'disconnected';

  function connect() {
    if (eventSource) return;
    if (typeof EventSource === 'undefined') return;

    status = 'connecting';
    eventSource = new EventSource(url, eventSourceInit);

    eventSource.onopen = () => {
      status = 'connected';
      options.onOpen?.();
    };

    // Listen for generic "message" events
    eventSource.onmessage = (msgEvent) => {
      dispatchEvent(msgEvent.data);
    };

    eventSource.onerror = (event) => {
      // EventSource auto-reconnects by default
      if (eventSource?.readyState === EventSource.CLOSED) {
        status = 'disconnected';
      }
      options.onError?.(event);
    };

    // Also listen for resource-specific named events
    for (const resource of subscribers.keys()) {
      if (resource !== '*') {
        addNamedListener(resource);
      }
    }
  }

  function addNamedListener(resource: string) {
    if (!eventSource) return;
    eventSource.addEventListener(resource, ((event: MessageEvent) => {
      try {
        const parsed = JSON.parse(event.data);
        const liveEvent: LiveEvent = {
          type: parsed.type,
          resource: parsed.resource ?? resource,
          payload: parsed.payload ?? parsed,
        };
        notifySubscribers(liveEvent);
      } catch {
        // ignore non-JSON
      }
    }) as EventListener);
  }

  function dispatchEvent(data: string) {
    try {
      const event: LiveEvent = JSON.parse(data);
      if (event.type && event.resource) {
        notifySubscribers(event);
      }
    } catch {
      // ignore non-JSON
    }
  }

  function notifySubscribers(event: LiveEvent) {
    const callbacks = subscribers.get(event.resource);
    if (callbacks) {
      for (const cb of callbacks) cb(event);
    }
    // Wildcard subscribers
    const wildcardCallbacks = subscribers.get('*');
    if (wildcardCallbacks) {
      for (const cb of wildcardCallbacks) cb(event);
    }
  }

  function disconnect() {
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    status = 'disconnected';
  }

  return {
    subscribe({ resource, callback }) {
      if (!subscribers.has(resource)) {
        subscribers.set(resource, new Set());
      }
      subscribers.get(resource)!.add(callback);

      // Connect if not already
      if (!eventSource && typeof EventSource !== 'undefined') {
        connect();
      }
      // Add named listener for this resource if connected
      if (eventSource && resource !== '*') {
        addNamedListener(resource);
      }

      return () => {
        const callbacks = subscribers.get(resource);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) subscribers.delete(resource);
        }
        if (subscribers.size === 0) disconnect();
      };
    },

    disconnect,

    getStatus() {
      return status;
    },
  };
}
