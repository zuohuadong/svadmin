// Supabase LiveProvider — Real-time subscriptions via Supabase Realtime
import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { LiveProvider, LiveEvent } from '@svadmin/core';

export function createSupabaseLiveProvider(client: SupabaseClient): LiveProvider {
  const channels = new Map<string, RealtimeChannel>();

  return {
    subscribe({ resource, callback }) {
      const channel = client
        .channel(`live-${resource}`)
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
        .subscribe();

      channels.set(resource, channel);

      return () => {
        channel.unsubscribe();
        channels.delete(resource);
      };
    },
  };
}
