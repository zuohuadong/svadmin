<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { Loader2, Check, X, Cloud } from 'lucide-svelte';
  import { t } from '@svadmin/core/i18n';

  let {
    status = 'idle',
    error,
  } = $props<{
    /** The current auto-save status */
    status?: 'idle' | 'loading' | 'success' | 'error';
    /** Optional error message */
    error?: string;
  }>();
</script>

<div class="flex items-center gap-2 text-sm text-muted-foreground">
  {#key status}
    <div class="flex items-center gap-2" in:fly={{ y: -8, duration: 200 }} out:fade={{ duration: 150 }}>
      {#if status === 'idle'}
        <Cloud class="h-4 w-4" />
        <span>{t('autoSave.idle')}</span>
      {:else if status === 'loading'}
        <Loader2 class="h-4 w-4 animate-spin text-primary" />
        <span>{t('autoSave.saving')}</span>
      {:else if status === 'success'}
        <Check class="h-4 w-4 text-green-500" />
        <span class="text-green-500">{t('autoSave.saved')}</span>
      {:else if status === 'error'}
        <X class="h-4 w-4 text-destructive" />
        <span class="text-destructive" title={error}>{t('autoSave.error')}</span>
      {/if}
    </div>
  {/key}
</div>
