/**
 * LiveProvider unit tests
 * Tests the subscription management logic without requiring actual WebSocket/SSE connections.
 */
import { describe, test, expect, mock } from 'bun:test';
import type { LiveProvider, LiveEvent } from './live';

// Helper: create a minimal in-memory LiveProvider for testing subscription logic
function createMockLiveProvider(): LiveProvider & { emit: (event: LiveEvent) => void } {
  type Callback = (event: LiveEvent) => void;
  const subscribers = new Map<string, Set<Callback>>();

  return {
    subscribe({ resource, callback }) {
      if (!subscribers.has(resource)) {
        subscribers.set(resource, new Set());
      }
      subscribers.get(resource)!.add(callback);

      return () => {
        const callbacks = subscribers.get(resource);
        if (callbacks) {
          callbacks.delete(callback);
          if (callbacks.size === 0) subscribers.delete(resource);
        }
      };
    },

    emit(event: LiveEvent) {
      const callbacks = subscribers.get(event.resource);
      if (callbacks) {
        for (const cb of callbacks) cb(event);
      }
      // Wildcard
      const wildcardCallbacks = subscribers.get('*');
      if (wildcardCallbacks) {
        for (const cb of wildcardCallbacks) cb(event);
      }
    },
  };
}

describe('LiveProvider subscription', () => {
  test('subscribe receives events for correct resource', () => {
    const provider = createMockLiveProvider();
    const received: LiveEvent[] = [];

    provider.subscribe({
      resource: 'posts',
      callback: (event) => received.push(event),
    });

    provider.emit({ type: 'INSERT', resource: 'posts', payload: { id: 1 } });
    provider.emit({ type: 'UPDATE', resource: 'comments', payload: { id: 2 } });

    expect(received.length).toBe(1);
    expect(received[0].type).toBe('INSERT');
    expect(received[0].resource).toBe('posts');
  });

  test('wildcard subscriber receives all events', () => {
    const provider = createMockLiveProvider();
    const received: LiveEvent[] = [];

    provider.subscribe({
      resource: '*',
      callback: (event) => received.push(event),
    });

    provider.emit({ type: 'INSERT', resource: 'posts', payload: {} });
    provider.emit({ type: 'DELETE', resource: 'users', payload: {} });

    expect(received.length).toBe(2);
    expect(received[0].resource).toBe('posts');
    expect(received[1].resource).toBe('users');
  });

  test('unsubscribe stops receiving events', () => {
    const provider = createMockLiveProvider();
    const received: LiveEvent[] = [];

    const unsub = provider.subscribe({
      resource: 'posts',
      callback: (event) => received.push(event),
    });

    provider.emit({ type: 'INSERT', resource: 'posts', payload: {} });
    expect(received.length).toBe(1);

    unsub();

    provider.emit({ type: 'UPDATE', resource: 'posts', payload: {} });
    expect(received.length).toBe(1); // No new events after unsub
  });

  test('multiple subscribers for same resource', () => {
    const provider = createMockLiveProvider();
    const received1: LiveEvent[] = [];
    const received2: LiveEvent[] = [];

    provider.subscribe({ resource: 'posts', callback: (e) => received1.push(e) });
    provider.subscribe({ resource: 'posts', callback: (e) => received2.push(e) });

    provider.emit({ type: 'INSERT', resource: 'posts', payload: { id: 1 } });

    expect(received1.length).toBe(1);
    expect(received2.length).toBe(1);
  });

  test('LiveEvent types are correct', () => {
    const insertEvent: LiveEvent = { type: 'INSERT', resource: 'posts', payload: { title: 'New' } };
    const updateEvent: LiveEvent = { type: 'UPDATE', resource: 'posts', payload: { title: 'Updated' } };
    const deleteEvent: LiveEvent = { type: 'DELETE', resource: 'posts', payload: { id: 1 } };

    expect(insertEvent.type).toBe('INSERT');
    expect(updateEvent.type).toBe('UPDATE');
    expect(deleteEvent.type).toBe('DELETE');
  });

  test('unsubscribing one does not affect others', () => {
    const provider = createMockLiveProvider();
    const received1: LiveEvent[] = [];
    const received2: LiveEvent[] = [];

    const unsub1 = provider.subscribe({ resource: 'posts', callback: (e) => received1.push(e) });
    provider.subscribe({ resource: 'posts', callback: (e) => received2.push(e) });

    unsub1();
    provider.emit({ type: 'INSERT', resource: 'posts', payload: {} });

    expect(received1.length).toBe(0);
    expect(received2.length).toBe(1);
  });
});
