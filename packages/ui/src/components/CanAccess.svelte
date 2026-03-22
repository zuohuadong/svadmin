<script lang="ts">
  import type { Snippet } from 'svelte';
  import { canAccess } from '@svadmin/core/permissions';
  import type { Action } from '@svadmin/core/permissions';

  let { resource, action, params, children, fallback } = $props<{
    resource: string;
    action: Action;
    params?: Record<string, unknown>;
    children: Snippet;
    fallback?: Snippet;
  }>();

  const result = $derived(canAccess(resource, action, params));
</script>

{#if result.can}
  {@render children()}
{:else if fallback}
  {@render fallback()}
{/if}
