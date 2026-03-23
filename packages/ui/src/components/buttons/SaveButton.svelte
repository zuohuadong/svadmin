<script lang="ts">
  import { t } from '@svadmin/core';
  import { Button } from '../ui/button/index.js';
  import { Save, Loader2 } from 'lucide-svelte';

  let { loading = false, hideText = false, type = 'submit', class: className = '' } = $props<{
    loading?: boolean;
    hideText?: boolean;
    type?: 'submit' | 'button';
    class?: string;
  }>();
</script>

<Button
  {type}
  variant="default"
  size={hideText ? 'icon' : 'default'}
  class={className}
  disabled={loading}
>
  {#if loading}
    <Loader2 class="h-4 w-4 animate-spin" />
  {:else}
    <Save class="h-4 w-4" />
  {/if}
  {#if !hideText}<span class="ml-1">{t('common.save')}</span>{/if}
</Button>
