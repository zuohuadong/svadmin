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
import type { LiveProvider, LiveEvent } from './live.svelte';

export interface SSELiveProviderOptions {
  url: string;
  eventSourceInit?: EventSourceInit;
  onOpen?: () => void;
  onError?: (event: Event) => void;
}

export function createSSELiveProvider(options: SSELiveProviderOptions): LiveProvider & { disconnect: () => void; getStatus: () => 'connecting' | 'connected' | 'disconnected' } {
  const { url, eventSourceInit } = options;

  type Callback = (event: LiveEvent) => void;
  const subscribers = new Map<string, Set<Callback>>();
  let eventSource: EventSource | null = null;
  let status: 'connecting' | 'connected' | 'disconnected' = 'disconnected';
  const namedListeners = new Map<string, EventListener>();

  function connect() {
    if (eventSource) return;
    if (typeof EventSource === 'undefined') return;

    status = 'connecting';
    eventSource = new EventSource(url, eventSourceInit);

    eventSource.onopen = () => {
      status = 'connected';
      options.onOpen?.();
    };

    eventSource.onmessage = (msgEvent) => {
      dispatchEvent(msgEvent.data);
    };

    eventSource.onerror = (event) => {
      if (eventSource?.readyState === EventSource.CLOSED) {
        status = 'disconnected';
      }
      options.onError?.(event);
    };

    for (const resource of subscribers.keys()) {
      if (resource !== '*') {
        addNamedListener(resource);
      }
    }
  }

  function addNamedListener(resource: string) {
    if (!eventSource || namedListeners.has(resource)) return;
    const listener = ((event: MessageEvent) => {
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
    }) as EventListener;
    namedListeners.set(resource, listener);
    eventSource.addEventListener(resource, listener);
  }

  function removeNamedListener(resource: string) {
    const listener = namedListeners.get(resource);
    if (!listener) return;
    if (eventSource) {
      eventSource.removeEventListener(resource, listener);
    }
    namedListeners.delete(resource);
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
    namedListeners.clear();
  }

  return {
    subscribe({ resource, callback }) {
      let isNewResource = false;
      if (!subscribers.has(resource)) {
        subscribers.set(resource, new Set());
        isNewResource = true;
      }
      subscribers.get(resource)?.add(callback);

      if (!eventSource && typeof EventSource !== 'undefined') {
        connect();
      }
      if (eventSource && resource !== '*' && isNewResource) {
        addNamedListener(resource);
      }

      return () => {
        const callbacks = subscribers.get(resource);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) {
            subscribers.delete(resource);
            removeNamedListener(resource);
          }
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
