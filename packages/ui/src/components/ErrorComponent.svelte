<script lang="ts">
  import { AlertTriangle, AlertCircle } from 'lucide-svelte';
  import { t } from '@svadmin/core';
  import { Button } from './ui/button';

  let {
    error,
    title = t('error.title'),
    description = t('error.description'),
    retry,
  } = $props<{
    error?: Error | null;
    title?: string;
    description?: string;
    retry?: () => void;
  }>();
</script>

<div class="flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-destructive/5 rounded-lg border border-destructive/20 text-destructive transition-all duration-300">
  <div class="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
    <AlertTriangle class="h-8 w-8 text-destructive" />
  </div>
  <h3 class="text-lg font-semibold">{title}</h3>
  <p class="text-sm opacity-90 mt-2 max-w-md">
    {error?.message || description}
  </p>
  {#if retry}
    <div class="mt-6">
      <Button variant="outline" class="border-destructive/30 hover:bg-destructive/10 text-destructive" onclick={retry}>
        <AlertCircle class="mr-2 h-4 w-4" />
        {t('buttons.retry')}
      </Button>
    </div>
  {/if}
</div>
