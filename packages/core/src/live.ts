// LiveProvider — Real-time subscription interface + useLive hook

import { useQueryClient } from '@tanstack/svelte-query';

export interface LiveProvider {
  subscribe(params: { resource: string; callback: (event: LiveEvent) => void }): () => void;
}

export interface LiveEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  resource: string;
  payload: Record<string, unknown>;
}

// Hook to auto-invalidate queries on real-time changes
export function useLive(liveProvider: LiveProvider, resource: string): void {
  const queryClient = useQueryClient();

  $effect(() => {
    const unsubscribe = liveProvider.subscribe({
      resource,
      callback: () => {
        queryClient.invalidateQueries({ queryKey: [resource] });
      },
    });
    return unsubscribe;
  });
}
