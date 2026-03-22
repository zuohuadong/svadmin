<script lang="ts">
  import type { Snippet } from 'svelte';
  import { t } from '@svadmin/core/i18n';
  import { Button } from './ui/button/index.js';
  import { InboxIcon } from 'lucide-svelte';

  interface Props {
    icon?: typeof InboxIcon;
    title?: string;
    description?: string;
    action?: Snippet;
    class?: string;
  }

  let {
    icon: Icon = InboxIcon,
    title,
    description,
    action,
    class: className = '',
  }: Props = $props();
</script>

<div class="flex flex-col items-center justify-center py-16 text-center {className}">
  <div class="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
    <Icon class="h-8 w-8 text-muted-foreground" />
  </div>
  <h3 class="text-lg font-semibold text-foreground">
    {title ?? t('common.noData')}
  </h3>
  {#if description}
    <p class="mt-1 text-sm text-muted-foreground max-w-sm">
      {description}
    </p>
  {/if}
  {#if action}
    <div class="mt-4">
      {@render action()}
    </div>
  {/if}
</div>
