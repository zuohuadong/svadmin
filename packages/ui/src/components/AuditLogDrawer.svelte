<script lang="ts">
  import { getAuditLogProvider, t } from '@svadmin/core';
  import type { AuditEntry } from '@svadmin/core';
  import * as Sheet from './ui/sheet/index.js';
  import { History, Loader2 } from 'lucide-svelte';

  let { open = $bindable(false), resource, recordId } = $props<{
    open: boolean;
    resource: string;
    recordId?: string | number;
  }>();

  let logs = $state<AuditEntry[]>([]);
  let isLoading = $state(false);

  $effect(() => {
    if (open) {
      const provider = getAuditLogProvider();
      if (provider) {
        isLoading = true;
        provider.get({ resource, meta: recordId ? { recordId } : undefined })
          .then((data) => {
            logs = data;
            isLoading = false;
          })
          .catch((err) => {
            console.error('[svadmin] Failed to fetch audit logs', err);
            isLoading = false;
          });
      }
    }
  });

  // Action semantic color mapping
  function getActionColor(action: string) {
    switch (action) {
      case 'create': return 'bg-green-500';
      case 'update': return 'bg-blue-500';
      case 'delete': return 'bg-red-500';
      default: return 'bg-slate-400';
    }
  }
</script>

<Sheet.Root bind:open>
  <Sheet.Content class="w-full sm:max-w-md overflow-y-auto">
    <Sheet.Header>
      <Sheet.Title class="flex items-center gap-2">
        <History class="h-5 w-5" />
        {t('common.history') || 'History'}
      </Sheet.Title>
      <Sheet.Description>
        Audit log and revision history for this record.
      </Sheet.Description>
    </Sheet.Header>

    <div class="mt-8 space-y-4">
      {#if isLoading}
        <div class="flex justify-center py-8 text-muted-foreground">
          <Loader2 class="h-6 w-6 animate-spin" />
        </div>
      {:else if logs.length === 0}
        <div class="text-center py-10">
          <History class="h-8 w-8 mx-auto text-muted-foreground/30 mb-3" />
          <p class="text-sm text-muted-foreground">
            {t('common.noData') || 'No audit logs found'}
          </p>
        </div>
      {:else}
        <div class="relative border-l border-border ml-3 pl-6 space-y-8">
          {#each logs as log}
            <div class="relative">
              <span class="absolute -left-7 top-1 flex h-2 w-2 items-center justify-center rounded-full ring-4 ring-background {getActionColor(log.action)}"></span>
              <div class="flex flex-col gap-1.5">
                <div class="flex items-center gap-2 justify-between">
                  <span class="text-sm font-semibold capitalize">{log.action}</span>
                  <span class="text-xs text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                {#if log.userId}
                  <span class="text-xs text-muted-foreground font-mono bg-muted inline-flex px-1.5 py-0.5 rounded w-fit">
                    User: {log.userId}
                  </span>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </Sheet.Content>
</Sheet.Root>
