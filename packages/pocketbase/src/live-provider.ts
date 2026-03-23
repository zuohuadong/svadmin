// @svadmin/pocketbase — PocketBase LiveProvider (SSE Realtime)
import type { LiveProvider, LiveEvent } from '@svadmin/core';

interface PocketBaseLiveOptions {
  /** PocketBase client instance */
  pb: unknown; // PocketBase
}

// Duck-typed PocketBase realtime interface
interface PBClientRealtime {
  collection: (name: string) => {
    subscribe: (topic: string, callback: (data: PBRealtimeEvent) => void) => Promise<void>;
    unsubscribe: (topic?: string) => Promise<void>;
  };
}

interface PBRealtimeEvent {
  action: 'create' | 'update' | 'delete';
  record: Record<string, unknown>;
}

/**
 * Map PocketBase realtime action to svadmin LiveEvent type.
 */
function mapAction(action: string): LiveEvent['type'] {
  switch (action) {
    case 'create': return 'INSERT';
    case 'update': return 'UPDATE';
    case 'delete': return 'DELETE';
    default: return 'UPDATE';
  }
}

/**
 * Create a LiveProvider backed by PocketBase Realtime (SSE).
 *
 * Usage:
 * ```ts
 * import PocketBase from 'pocketbase';
 * import { createPocketBaseLiveProvider } from '@svadmin/pocketbase';
 *
 * const pb = new PocketBase('http://127.0.0.1:8090');
 * const liveProvider = createPocketBaseLiveProvider({ pb });
 * ```
 */
export function createPocketBaseLiveProvider(options: PocketBaseLiveOptions): LiveProvider {
  const pb = options.pb as PBClientRealtime;

  return {
    subscribe({ resource, callback }) {
      // PocketBase subscribe uses '*' for all events on a collection
      pb.collection(resource).subscribe('*', (data) => {
        callback({
          type: mapAction(data.action),
          resource,
          payload: data.record,
        });
      });

      return () => {
        pb.collection(resource).unsubscribe('*');
      };
    },
  };
}
