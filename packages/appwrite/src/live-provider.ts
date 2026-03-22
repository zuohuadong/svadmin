// @svadmin/appwrite — Appwrite LiveProvider (Realtime)
import type { LiveProvider, LiveEvent } from '@svadmin/core';

interface AppwriteLiveOptions {
  /** Appwrite Client instance (must have realtime support) */
  client: unknown; // Appwrite.Client
  /** Database ID for document subscriptions */
  databaseId: string;
}

// Duck-typed Appwrite realtime interface
interface AppwriteClient {
  subscribe: (channels: string | string[], callback: (payload: AppwriteRealtimePayload) => void) => { (): void };
}

interface AppwriteRealtimePayload {
  events: string[];
  payload: Record<string, unknown>;
}

/**
 * Map Appwrite realtime events to svadmin LiveEvent types.
 */
function mapEventType(events: string[]): LiveEvent['type'] {
  const eventStr = events.join(',');
  if (eventStr.includes('.create')) return 'INSERT';
  if (eventStr.includes('.update')) return 'UPDATE';
  if (eventStr.includes('.delete')) return 'DELETE';
  return 'UPDATE';
}

/**
 * Create a LiveProvider backed by Appwrite Realtime.
 *
 * Usage:
 * ```ts
 * import { Client } from 'appwrite';
 * import { createAppwriteLiveProvider } from '@svadmin/appwrite';
 *
 * const client = new Client().setEndpoint('https://cloud.appwrite.io/v1').setProject('PROJECT_ID');
 * const liveProvider = createAppwriteLiveProvider({ client, databaseId: 'main' });
 * ```
 */
export function createAppwriteLiveProvider(options: AppwriteLiveOptions): LiveProvider {
  const client = options.client as AppwriteClient;
  const { databaseId } = options;

  return {
    subscribe({ resource, callback }) {
      const channel = `databases.${databaseId}.collections.${resource}.documents`;
      const unsubscribe = client.subscribe(channel, (response) => {
        callback({
          type: mapEventType(response.events),
          resource,
          payload: response.payload,
        });
      });
      return unsubscribe;
    },
  };
}
