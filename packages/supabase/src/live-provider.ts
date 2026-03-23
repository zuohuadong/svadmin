// Supabase LiveProvider — Real-time subscriptions via Supabase Realtime
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { LiveProvider, LiveEvent } from '@svadmin/core';

export function createSupabaseLiveProvider(client: SupabaseClient): LiveProvider {
  const channels = new Map<string, RealtimeChannel>();

  function getOrCreateChannel(resource: string): RealtimeChannel {
    let channel = channels.get(resource);
    if (!channel) {
      channel = client.channel(`live-${resource}`);
      channels.set(resource, channel);
    }
    return channel;
  }

  return {
    subscribe({ resource, callback }) {
      const channel = getOrCreateChannel(resource)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: resource },
          (payload) => {
            callback({
              type: payload.eventType as LiveEvent['type'],
              resource,
              payload: (payload.new ?? payload.old ?? {}) as Record<string, unknown>,
            });
          }
        )
        .on('broadcast', { event: 'live-event' }, ({ payload: broadcastPayload }) => {
          if (broadcastPayload) {
            callback(broadcastPayload as LiveEvent);
          }
        })
        .subscribe();

      channels.set(resource, channel);

      return () => {
        channel.unsubscribe();
        channels.delete(resource);
      };
    },

    publish(event: LiveEvent) {
      const channel = getOrCreateChannel(event.resource);
      channel.send({
        type: 'broadcast',
        event: 'live-event',
        payload: event,
      });
    },
  };
}
