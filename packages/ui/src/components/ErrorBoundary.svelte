<script lang="ts">
  import type { Snippet } from 'svelte';
  import { AlertTriangle } from 'lucide-svelte';
  import { Button } from './ui/button/index.js';
  import { t } from '@svadmin/core/i18n';

  let { children }: { children: Snippet } = $props();

  let error = $state<Error | null>(null);

  function handleError(e: ErrorEvent) {
    error = e.error instanceof Error ? e.error : new Error(String(e.error));
    e.preventDefault();
  }

  function handleRejection(e: PromiseRejectionEvent) {
    error = e.reason instanceof Error ? e.reason : new Error(String(e.reason));
    e.preventDefault();
  }

  $effect(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  });

  function handleRetry() {
    error = null;
    window.location.reload();
  }
</script>

{#if error}
  <div class="flex h-screen items-center justify-center bg-background">
    <div class="max-w-md text-center space-y-4">
      <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle class="h-8 w-8 text-destructive" />
      </div>
      <h2 class="text-xl font-bold text-foreground">{t('common.error')}</h2>
      <p class="text-sm text-muted-foreground">{error.message}</p>
      <Button onclick={handleRetry}>
        {t('common.retry')}
      </Button>
    </div>
  </div>
{:else}
  {@render children()}
{/if}
