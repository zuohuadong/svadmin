// Supabase LiveProvider — Real-time subscriptions via Supabase Realtime
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { LiveProvider, LiveEvent } from '@svadmin/core';

export function createSupabaseLiveProvider(client: SupabaseClient): LiveProvider {
  const subscribers = new Map<string, Set<(event: LiveEvent) => void>>();
  const channels = new Map<string, RealtimeChannel>();
  const broadcastChannels = new Map<string, RealtimeChannel>();

  function getOrCreateChannel(resource: string): RealtimeChannel {
    let channel = channels.get(resource);
    if (!channel) {
      channel = client.channel(`live-${resource}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: resource },
          (payload) => {
            const event: LiveEvent = {
              type: payload.eventType as LiveEvent['type'],
              resource,
              payload: (payload.new ?? payload.old ?? {}) as Record<string, unknown>,
            };
            subscribers.get(resource)?.forEach(cb => cb(event));
          }
        )
        .on('broadcast', { event: 'live-event' }, ({ payload }) => {
          if (payload) {
            subscribers.get(resource)?.forEach(cb => cb(payload as LiveEvent));
          }
        })
        .subscribe();
      channels.set(resource, channel);
    }
    return channel;
  }

  function getOrCreateBroadcastChannel(resource: string): RealtimeChannel {
    let channel = broadcastChannels.get(resource);
    if (!channel) {
      const existing = channels.get(resource);
      if (existing) return existing;
      channel = client.channel(`live-bc-${resource}`)
        .on('broadcast', { event: 'live-event' }, ({ payload }) => {
          if (payload) {
            subscribers.get(resource)?.forEach(cb => cb(payload as LiveEvent));
          }
        })
        .subscribe();
      broadcastChannels.set(resource, channel);
    }
    return channel;
  }

  return {
    subscribe({ resource, callback }) {
      if (!subscribers.has(resource)) subscribers.set(resource, new Set());
      subscribers.get(resource)!.add(callback);

      getOrCreateChannel(resource);

      return () => {
        const cbs = subscribers.get(resource);
        if (cbs) {
          cbs.delete(callback);
          if (cbs.size === 0) {
            subscribers.delete(resource);
            const channel = channels.get(resource);
            if (channel) {
              channel.unsubscribe();
              channels.delete(resource);
            }
            const bc = broadcastChannels.get(resource);
            if (bc) {
              bc.unsubscribe();
              broadcastChannels.delete(resource);
            }
          }
        }
      };
    },

    publish(event: LiveEvent) {
      const channel = getOrCreateBroadcastChannel(event.resource);
      channel.send({
        type: 'broadcast',
        event: 'live-event',
        payload: event,
      });
    },
  };
}
