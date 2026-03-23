<script lang="ts">
  import { AlertTriangle, RefreshCw } from 'lucide-svelte';
  import { t } from '@svadmin/core';
  import { Button } from './ui/button';
  import * as Alert from './ui/alert/index.js';

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

<div class="flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
  <Alert.Root variant="destructive" class="max-w-md text-left">
    <AlertTriangle class="h-5 w-5" />
    <Alert.Title>{title}</Alert.Title>
    <Alert.Description>
      {error?.message || description}
    </Alert.Description>
    {#if retry}
      <div class="mt-4">
        <Button variant="outline" size="sm" onclick={retry}>
          <RefreshCw class="h-3 w-3" data-icon="inline-start" />
          {t('buttons.retry')}
        </Button>
      </div>
    {/if}
  </Alert.Root>
</div>
